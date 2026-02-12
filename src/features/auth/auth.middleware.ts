import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'generated/prisma/client';
import { Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}
  async use(request: Request, response: Response, next: () => void) {
    const access_token: string = request.headers['authorization'] ?? '';

    if (!access_token)
      throw new UnauthorizedException('Cabecera Authorization vacía.');

    try {
      const payload: User = await this.authService.validate(access_token);
      request.user = payload;
      next();
    } catch (error) {}
    next();
  }
}
