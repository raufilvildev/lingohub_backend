import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { SignupUser } from './dto/signup-user.dto';
import { UpdateUser } from './dto/update-user.dto';
import { User } from 'generated/prisma/client';
import { UserResponse } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { Request, Response } from 'express';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private authService: AuthService,
  ) {}

  async getMyUser(id: number): Promise<UserResponse> {
    const user: User | null = await this.usersRepository.selectUserById(id);

    if (!user) {
      throw new NotFoundException('El usuario con el id indicado no existe.');
    }

    return new UserResponse(user);
  }

  async signup(
    signupUser: SignupUser,
    request: Request,
    response: Response,
  ): Promise<void> {
    let user: User | null = await this.usersRepository.selectUserByEmail(
      signupUser.email,
    );

    if (user) {
      throw new ConflictException('Correo electrónico ya registrado.');
    }

    user = await this.usersRepository.selectUserByUsername(signupUser.username);

    if (user) {
      throw new ConflictException('Usuario ya registrado.');
    }

    try {
      signupUser.password = await bcrypt.hash(
        signupUser.password,
        Number(process.env.BCRYPT_SALT_ROUNDS),
      );
      const user: User = await this.usersRepository.insertUser(signupUser);

      await this.authService.createAccessAndRefreshTokens(
        user.id,
        request,
        response,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Ha ocurrido un error inesperado. Vuelve a intentarlo más tarde.',
      );
    }
  }

  async update(id: number, updateUser: UpdateUser): Promise<void> {
    let user: User | null = await this.usersRepository.selectUserByEmail(
      updateUser.email,
    );

    if (user && user.id !== id) {
      throw new ConflictException('Correo electrónico ya registrado.');
    }

    user = await this.usersRepository.selectUserByUsername(updateUser.username);

    if (user && user.id !== id) {
      throw new ConflictException('Usuario ya registrado.');
    }

    try {
      await this.usersRepository.updateUserById(id, updateUser);
    } catch (error) {
      throw new InternalServerErrorException(
        'Ha ocurrido un error inesperado. Vuelve a intentarlo más tarde.',
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.usersRepository.deleteUserById(id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Ha ocurrido un error inesperado. Vuelve a intentarlo más tarde.',
      );
    }
  }
}
