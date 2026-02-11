import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginUser: any): Promise<any> {
    const user: any = this.usersService.getUserByUsername(loginUser.username);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    if (user?.password !== loginUser.password) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = { sub: user.id, username: user.username };
  }

  async logout(): Promise<any> {}

  async validate(): Promise<any> {}

  async refresh(): Promise<any> {}
}
