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
import { Response } from 'express';
import { Token } from '../auth/dto/token.dto';

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

  async signup(signupUser: SignupUser, response: Response): Promise<Token> {
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
        parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10'),
      );
      const user: User = await this.usersRepository.insertUser(signupUser);

      return this.authService.create_access_and_refresh_tokens(
        user.id,
        user.username,
        response,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Ha ocurrido un error inesperado. Vuelve a intentarlo más tarde.',
      );
    }
  }

  async update(id: number, updateUser: UpdateUser): Promise<any> {
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
      const user: User = await this.usersRepository.updateUserById(
        id,
        updateUser,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Ha ocurrido un error inesperado. Vuelve a intentarlo más tarde.',
      );
    }
  }

  async delete(id: number): Promise<any> {
    return await this.usersRepository.deleteUserById(id);
  }
}
