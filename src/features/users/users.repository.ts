import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  async selectUserById(): Promise<any> {}

  async selectUserByUsername(): Promise<any> {}

  async insertUser(): Promise<any> {}

  async updateUserById(): Promise<any> {}

  async deleteUserById(): Promise<any> {}
}
