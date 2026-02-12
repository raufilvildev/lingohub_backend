import { Injectable, Req, Res, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import { JwtPayload } from './interfaces/JwtPayload.interface';
import { LoginUser } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { Token } from './dto/token.dto';
import { User } from 'generated/prisma/client';
import type { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async login(loginUser: LoginUser, response: Response): Promise<Token> {
    const user: User | null = await this.usersRepository.selectUserByUsername(
      loginUser.username,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const isMatch: boolean = await bcrypt.compare(
      loginUser.password,
      user?.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return await this.create_access_and_refresh_tokens(
      user.id,
      user.username,
      response,
    );
  }

  logout(response: Response): void {
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  async validate(token: string): Promise<User> {
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      const user: User | null = await this.usersRepository.selectUserById(
        payload.sub,
      );

      if (!user || user.username !== payload.username) {
        throw new UnauthorizedException('Token inválido.');
      }

      return user;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado.');
      }
      throw new UnauthorizedException('Token inválido.');
    }
  }

  async create_access_and_refresh_tokens(
    id: number,
    username: string,
    response: Response,
  ): Promise<Token> {
    const payload: JwtPayload = { sub: id, username: username };

    const access_token: string = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRED_SECONDS ?? '300'),
    });
    const refresh_token: string = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRED_SECONDS),
    });

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: Number(process.env.REFRESH_TOKEN_EXPIRED_SECONDS) * 1000,
      sameSite: 'strict',
    });

    return { access_token };
  }

  async refresh(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Token> {
    const user: User = await this.validate(
      request.cookies['refresh_token'] ?? '',
    );
    return await this.create_access_and_refresh_tokens(
      user.id,
      user.username,
      response,
    );
  }
}
