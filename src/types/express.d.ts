import { User } from 'generated/prisma/browser';
import { JwtPayload } from '../auth/interfaces/JwtPayload.interface';
import { UserResponse } from 'src/features/users/dto/user-response.dto';

declare module 'express' {
  interface Request {
    user?: UserResponse;
  }
}
