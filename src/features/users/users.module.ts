import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthMiddleware } from '../auth/auth.middleware';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    PrismaService,
    AuthService,
    JwtService,
  ],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'users/me',
        method: RequestMethod.GET,
      },
      {
        path: 'users/update',
        method: RequestMethod.PUT,
      },
      {
        path: 'users/delete',
        method: RequestMethod.DELETE,
      },
    );
  }
}
