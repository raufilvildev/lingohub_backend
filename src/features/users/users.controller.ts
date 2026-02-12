import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignupUser } from './dto/signup-user.dto';
import { UpdateUser } from './dto/update-user.dto';
import { UserResponse } from './dto/user-response.dto';
import { Token } from '../auth/dto/token.dto';
import type { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMyUser(@Req() request: Request): Promise<UserResponse> {
    return request.user as UserResponse;
  }

  @Post('signup')
  async signup(
    @Body() signupUser: SignupUser,
    @Res({ passthrough: true }) response,
  ): Promise<Token> {
    return await this.usersService.signup(signupUser, response);
  }

  @Put('update')
  async update(
    @Req() request: Request,
    @Body() updateUser: UpdateUser,
  ): Promise<any> {
    return await this.usersService.update(
      (request.user as UserResponse).id,
      updateUser,
    );
  }

  @Delete('delete')
  async delete(@Req() request: Request): Promise<any> {
    return await this.usersService.delete((request.user as UserResponse).id);
  }
}
