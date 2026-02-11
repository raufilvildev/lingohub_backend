import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getMyUser(): Promise<any> {
    return await this.usersService.getMyUser();
  }

  @Post()
  async signup(): Promise<any> {
    return await this.usersService.signup();
  }

  @Put()
  async update(): Promise<any> {
    return await this.usersService.update();
  }

  @Delete()
  async delete(): Promise<any> {
    return await this.usersService.delete();
  }
}
