import { Injectable } from '@nestjs/common';
import { SignupUser } from './dto/signup-user.dto';
import { UpdateUser } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { User } from 'generated/prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async selectUserById(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async selectUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async selectUserByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { username } });
  }

  async insertUser(signupUser: SignupUser): Promise<User> {
    return await this.prisma.user.create({ data: signupUser });
  }

  async updateUserById(id: number, updateUser: UpdateUser): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: updateUser,
    });
  }

  async deleteUserById(id: number): Promise<User> {
    return await this.prisma.user.delete({ where: { id } });
  }
}
