import { Injectable } from '@nestjs/common';
import { UserSession } from 'generated/prisma/browser';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async selectUserSessionById(id: number): Promise<UserSession | null> {
    return await this.prisma.userSession.findUnique({ where: { id } });
  }

  async insertSession(
    user_id: number,
    device_info: string,
    ip: string,
  ): Promise<UserSession> {
    return await this.prisma.userSession.create({
      data: { user_id, device_info, ip },
    });
  }

  async updateSessionWithRefreshToken(
    id: number,
    refresh_token: string,
    expires_at: Date,
  ): Promise<UserSession> {
    return await this.prisma.userSession.update({
      where: { id },
      data: { refresh_token, expires_at },
    });
  }

  async revokeRefreshToken(id: number): Promise<void> {
    await this.prisma.userSession.update({
      where: { id },
      data: { revoked_at: new Date() },
    });
  }
}
