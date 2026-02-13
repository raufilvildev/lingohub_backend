import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUser } from './dto/login-user.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(204)
  async login(
    @Body() loginUser: LoginUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.login(loginUser, request, response);
    response.send();
  }

  @Post('logout')
  @HttpCode(204)
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): void {
    this.authService.logout(request, response);
    response.send();
  }
}
