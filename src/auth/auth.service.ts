import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWTTokens } from './types/jwt';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new BadRequestException('Password does not match');
    }

    return user;
  }

  async signUp(createUserDto: CreateUserDto): Promise<JWTTokens> {
    const existedUser = await this.userService.findByEmail(createUserDto.email);

    if (existedUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPaasword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.userService.create({
      ...createUserDto,
      password: hashedPaasword,
    });

    const tokens = await this.getTokens(user._id, user.email);
    await Promise.all([
      this.updateRefreshToken(user._id, tokens.refreshToken),
      this.redisService.saveAccesToken(user._id, tokens.accessToken),
    ]);
    return tokens;
  }

  async signIn(email: string, pass: string): Promise<JWTTokens> {
    const user = await this.validateUser(email, pass);

    const tokens = await this.getTokens(user._id, user.email);
    await Promise.all([
      this.updateRefreshToken(user._id, tokens.refreshToken),
      this.redisService.saveAccesToken(user._id, tokens.accessToken),
    ]);
    return tokens;
  }

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_KEY'),
          expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async logout(userId: string) {
    return Promise.all([
      this.userService.update(userId, { refreshToken: null }),
      this.redisService.deleteAccessToken(userId),
    ]);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findOne(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user._id, user.email);
    await Promise.all([
      this.updateRefreshToken(user._id, tokens.refreshToken),
      this.redisService.saveAccesToken(user._id, tokens.accessToken),
    ]);
    return tokens;
  }
}
