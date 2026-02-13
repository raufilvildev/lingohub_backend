import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'generated/prisma/client';
import { Request, Response } from 'express';
import { UserResponse } from '../users/dto/user-response.dto';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}
  async use(request: Request, response: Response, next: () => void) {
    let user: User | null = await this.authService.validateAccessToken(request);

    if (user) {
      request.user = new UserResponse(user);
      return next();
    }

    await this.authService.refresh(request, response);

    user = (await this.authService.validateAccessToken(request)) as User;

    request.user = new UserResponse(user);
    next();
  }
}
