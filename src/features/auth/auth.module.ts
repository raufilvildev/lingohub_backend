import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, UsersRepository, JwtService],
})
export class AuthModule {}
