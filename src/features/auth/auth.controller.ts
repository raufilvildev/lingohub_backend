import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(): Promise<any> {
    return await this.authService.login({});
  }

  @Post('logout')
  async logout(): Promise<any> {
    return await this.authService.logout();
  }

  @Post('validate')
  async validate(): Promise<any> {
    return await this.authService.validate();
  }

  @Post('refresh')
  async refresh(): Promise<any> {
    return await this.authService.refresh();
  }
}
