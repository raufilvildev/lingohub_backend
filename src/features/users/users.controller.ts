import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { SignupUser } from './dto/signup-user.dto';
import { UpdateUser } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getMyUser(): Promise<any> {
    return await this.usersService.getMyUser(0);
  }

  @Post()
  async signup(@Body() signupUser: SignupUser): Promise<any> {
    return await this.usersService.signup(signupUser);
  }

  @Put()
  async update(@Body() updateUser: UpdateUser): Promise<any> {
    return await this.usersService.update(0, updateUser);
  }

  @Delete()
  async delete(): Promise<any> {
    return await this.usersService.delete(0);
  }
}
