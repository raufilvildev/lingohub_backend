import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import type { Request, Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMyUser(@Req() request: Request): Promise<UserResponse> {
    return request.user as UserResponse;
  }

  @Post('signup')
  @HttpCode(204)
  async signup(
    @Body() signupUser: SignupUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.usersService.signup(signupUser, request, response);
    response.send();
  }

  @Put('update')
  @HttpCode(204)
  async update(
    @Req() request: Request,
    @Body() updateUser: UpdateUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.usersService.update(
      (request.user as UserResponse).id,
      updateUser,
    );
    response.send();
  }

  @Delete('delete')
  async delete(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.usersService.delete((request.user as UserResponse).id);
    response.send();
  }
}
