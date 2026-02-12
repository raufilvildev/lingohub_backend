import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    UsersRepository,
    JwtService,
    PrismaService,
  ],
})
export class AuthModule {}
