import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async login(loginUser: any): Promise<any> {
    const user: any = this.usersRepository.selectUserByUsername(
      loginUser.username,
    );

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
