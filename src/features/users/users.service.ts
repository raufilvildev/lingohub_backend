import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { SignupUser } from './dto/signup-user.dto';
import { UpdateUser } from './dto/update-user.dto';
import { User } from 'generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async getMyUser(id: number): Promise<any> {
    return await this.usersRepository.selectUserById(id);
  }

  async signup(signupUser: SignupUser): Promise<any> {
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
      signupUser.password = signupUser.password;

      const user: User = await this.usersRepository.insertUser(signupUser);
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
