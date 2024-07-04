import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Response,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Response as Res, Request as Req } from 'express';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { signInSchema, signUpSchema } from '../user/dto/create-user.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JoiValidationPipe } from '../../common/pipes/validation.pipe';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  @UsePipes(new JoiValidationPipe(signUpSchema))
  async signUp(@Body() signUpDto: SignUpDto, @Response() res: Res) {
    const { accessToken, refreshToken } =
      await this.authService.signUp(signUpDto);
    return res
      .set({ Authorization: accessToken, 'Refresh-Token': refreshToken })
      .json();
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  @UsePipes(new JoiValidationPipe(signInSchema))
  async signIn(@Body() signInDto: SignInDto, @Response() res: Res) {
    const { accessToken, refreshToken } = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );

    return res
      .set({ Authorization: accessToken, 'Refresh-Token': refreshToken })
      .json();
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh-token')
  async refreshTokens(@Request() req: Req) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(@Request() req: Req) {
    await this.authService.logout(req.user['sub']);
  }
}
