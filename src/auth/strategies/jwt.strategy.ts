import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';
import { JWTPayload } from '../types/jwt';
import { RedisService } from '../../cache/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userService: UserService,
    private redisService: RedisService,
  ) {
    super({
      usernameField: 'email',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_KEY,
    });
  }

  async validate(jwtPayload: JWTPayload): Promise<User> {
    const userId = jwtPayload.sub;

    const cachedAccessToken = await this.redisService.getAccessToken(userId);

    if (cachedAccessToken) return;

    const user = await this.userService.findOne(jwtPayload.sub);

    if (!user || user.email !== jwtPayload.email) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
