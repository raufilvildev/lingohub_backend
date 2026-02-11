import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async getMyUser(): Promise<any> {
    return await this.usersRepository.selectUserById();
  }

  async getUserByUsername(username: string): Promise<any> {
    const user = await this.usersRepository.selectUserByUsername();
  }

  async signup(): Promise<any> {
    return await this.usersRepository.insertUser();
  }

  async update(): Promise<any> {
    return await this.usersRepository.updateUserById();
  }

  async delete(): Promise<any> {
    return await this.usersRepository.deleteUserById();
  }
}
