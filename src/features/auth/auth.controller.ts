import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUser } from './dto/login-user.dto';
import { Token } from './dto/token.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginUser: LoginUser,
    @Res({ passthrough: true }) response,
  ): Promise<Token> {
    return await this.authService.login(loginUser, response);
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) response): void {
    this.authService.logout(response);
    response.send();
  }

  @Post('validate')
  @HttpCode(204)
  async validate(@Body() token: Token, @Res() response): Promise<void> {
    await this.authService.validate(token.access_token);
    response.send();
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Token> {
    return await this.authService.refresh(request, response);
  }
}
