import { Injectable, Req, Res, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import { JwtAccessPayload } from './interfaces/JwtAccessPayload.interface';
import { JwtRefreshPayload } from './interfaces/JwtRefreshPayload.interface';
import { LoginUser } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { User, UserSession } from 'generated/prisma/client';
import type { Request, Response } from 'express';
import { AuthRepository } from './auth.repository';
import { getDeviceInfo } from 'src/utils/request-context';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  SECURE: boolean = process.env.NODE_ENV === 'production';
  SAME_SITE: 'strict' | 'none' = this.SECURE ? 'none' : 'strict';

  async login(
    loginUser: LoginUser,
    request: Request,
    response: Response,
  ): Promise<void> {
    // --------------------------------------------------
    //  1. Buscamos el usuario por nombre de usuario.
    //  2. Si no existe el usuario, lanzamos una excepción de usuario no autorizado.
    //  3. Si existe el usuario, pero las contraseñas no coinciden, lanzamos una excepción de usuario no autorizado.
    //  4. En otro caso, creamos access y refresh tokens.
    // --------------------------------------------------

    const user: User | null = await this.usersRepository.selectUserByUsername(
      loginUser.username,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const isMatch: boolean = await bcrypt.compare(
      loginUser.password,
      user?.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    await this.createAccessAndRefreshTokens(user.id, request, response);
  }

  async logout(request: Request, response: Response): Promise<void> {
    // --------------------------------------------------
    //  1. Limpiamos cookies de access_token.
    //  2. Revocamos el refresh_token.
    // --------------------------------------------------
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: this.SECURE,
      sameSite: this.SAME_SITE,
    });

    await this.revokeRefreshToken(request, response);
  }

  async revokeRefreshToken(
    request: Request,
    response: Response,
  ): Promise<void> {
    // --------------------------------------------------
    //  1. Validamos refresh_token para obtener la sesión del usuario.
    //  2. Limpiamos refresh_token de cookies.
    //  3. Si no tenemos la sesión del usuario o el id de la sesión, acabamos la ejecución de la función.
    //  4. Si tenemos tanto la sesión del usuario como su id, revocamos su sesión en base de datos.
    // --------------------------------------------------

    const userSession: UserSession | null =
      await this.validateRefreshToken(request);

    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.SECURE,
      sameSite: this.SAME_SITE,
    });

    if (!userSession || !userSession.id) return;

    await this.authRepository.revokeRefreshToken(userSession.id);
  }

  async createToken(
    response: Response,
    payload: JwtAccessPayload | JwtRefreshPayload,
    name: 'access_token' | 'refresh_token',
    expiresIn: number,
  ) {
    // --------------------------------------------------
    //  1. Creamos token.
    //  2. Actualizamos cookies.
    //  3. Devolvemos el token.
    // --------------------------------------------------

    const token: string = await this.jwtService.signAsync(payload, {
      secret:
        name === 'access_token'
          ? process.env.JWT_ACCESS_SECRET
          : process.env.JWT_REFRESH_SECRET,
      expiresIn: expiresIn,
    });

    response.cookie(name, token, {
      httpOnly: true,
      secure: this.SECURE,
      maxAge: expiresIn * 1000,
      sameSite: this.SAME_SITE,
    });

    return token;
  }

  async createAccessAndRefreshTokens(
    user_id: number,
    request: Request,
    response: Response,
  ): Promise<void> {
    // --------------------------------------------------
    //  1. Creamos access_token.
    //  2. Creamos sesión en base de datos.
    //  3. Creamos refresh_token y actualizamos la sesión en base de datos.
    // --------------------------------------------------

    await this.createToken(
      response,
      { sub: user_id },
      'access_token',
      Number(process.env.ACCESS_TOKEN_EXPIRED_SECONDS),
    );

    const session: UserSession = await this.authRepository.insertSession(
      user_id,
      getDeviceInfo(request),
      request.ip || '',
    );

    const refreshPayload: JwtRefreshPayload = {
      sub: user_id,
      sessionId: session.id,
    };
    let refresh_token: string = await this.createToken(
      response,
      refreshPayload,
      'refresh_token',
      Number(process.env.REFRESH_TOKEN_EXPIRED_SECONDS),
    );

    refresh_token = await bcrypt.hash(
      refresh_token,
      Number(process.env.BCRYPT_SALT_ROUNDS),
    );
    const expires_at: Date = new Date(
      Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRED_SECONDS) * 1000,
    );
    await this.authRepository.updateSessionWithRefreshToken(
      refreshPayload.sessionId,
      refresh_token,
      expires_at,
    );
  }

  async createAccessTokenAndUpdateRefreshToken(
    id: number,
    user_id: number,
    response: Response,
  ): Promise<void> {
    // --------------------------------------------------
    //  1. Creamos access_token.
    //  2. Creamos sesión en base de datos.
    //  3. Creamos refresh_token y actualizamos la sesión en base de datos.
    // --------------------------------------------------

    await this.createToken(
      response,
      { sub: user_id },
      'access_token',
      Number(process.env.ACCESS_TOKEN_EXPIRED_SECONDS),
    );

    const refreshPayload: JwtRefreshPayload = {
      sub: user_id,
      sessionId: id,
    };
    let refresh_token: string = await this.createToken(
      response,
      refreshPayload,
      'refresh_token',
      Number(process.env.REFRESH_TOKEN_EXPIRED_SECONDS),
    );

    refresh_token = await bcrypt.hash(
      refresh_token,
      Number(process.env.BCRYPT_SALT_ROUNDS),
    );
    const expires_at: Date = new Date(
      Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRED_SECONDS) * 1000,
    );
    await this.authRepository.updateSessionWithRefreshToken(
      refreshPayload.sessionId,
      refresh_token,
      expires_at,
    );
  }

  clearTokenCookie(response: Response, name: 'access_token' | 'refresh_token') {
    response.clearCookie(name, {
      httpOnly: true,
      secure: this.SECURE,
      sameSite: this.SAME_SITE,
    });
  }

  async validateAccessToken(request: Request): Promise<User | null> {
    // --------------------------------------------------
    //  1. Obtengo access_token de cookies.
    //  2. Si no tengo access_token, devuelvo null.
    //  3. Si tengo access_token lo valido y obtengo el payload.
    //  4. Si el payload no tiene el id de usuario, devuelvo null.
    //  5. Si tengo el id de usuario, lo busco.
    //  6. Si el usuario existe, lo devuelvo. En caso contrario, devuelvo null.
    //  7. En caso de error en cualquiera de los pasos anteriores, devuelvo null.
    // --------------------------------------------------
    try {
      const access_token: string | undefined = request.cookies['access_token'];

      if (!access_token) {
        return null;
      }

      const payload: JwtAccessPayload = await this.jwtService.verifyAsync(
        access_token,
        {
          secret: process.env.JWT_ACCESS_SECRET,
        },
      );

      if (!payload.sub) {
        return null;
      }

      const user: User | null = await this.usersRepository.selectUserById(
        payload.sub,
      );

      if (user) {
        return user;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async validateRefreshToken(request: Request): Promise<UserSession | null> {
    // --------------------------------------------------
    //  1. Obtengo refresh_token de cookies.
    //  2. Si no tengo refresh_token, devuelvo null.
    //  3. Si tengo refresh_token lo valido y obtengo el payload.
    //  4. Si el payload no tiene el id de la sesión o el id de usuario, devuelvo null.
    //  5. Si tengo el id de usuario, lo busco.
    //  6. Si el usuario no existe, devuelvo null.
    //  7. Si tengo el id de la sesión, lo busco.
    //  8. Si la sesión no existe, devuelvo null.
    //  9. Si el refresh_token es nulo, devuelvo null.
    //  10. Si el revoked_at es nulo, devuelvo null.
    //  11. Si el expires_at no existe o es menor que la fecha actual, devuelvo null.
    //  12. Si la sesión existe y todavía no he devuelto null, devuelvo dicha sesión.
    //  13. En caso de error en cualquiera de los pasos anteriores, devuelvo null.
    // --------------------------------------------------
    try {
      const refresh_token: string | undefined =
        request.cookies['refresh_token'];

      if (!refresh_token) return null;

      const payload: JwtRefreshPayload = await this.jwtService.verifyAsync(
        refresh_token,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      if (!payload.sessionId || !payload.sub) return null;

      const user: User | null = await this.usersRepository.selectUserById(
        payload.sub,
      );

      if (!user) return null;

      const userSession: UserSession | null =
        await this.authRepository.selectUserSessionById(payload.sessionId);

      if (!userSession) return null;
      if (!userSession.refresh_token) return null;
      if (userSession.revoked_at) return null;
      if (!userSession.expires_at || userSession.expires_at < new Date()) {
        return null;
      }

      const isMatch: boolean = await bcrypt.compare(
        refresh_token,
        userSession.refresh_token,
      );

      if (!isMatch) {
        return null;
      }
      return userSession;
    } catch (error) {
      return null;
    }
  }

  async refresh(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const userSession: UserSession | null =
      await this.validateRefreshToken(request);

    if (!userSession) {
      throw new UnauthorizedException('refresh_token inválido.');
    }

    await this.createAccessTokenAndUpdateRefreshToken(
      userSession.id,
      userSession.user_id,
      response,
    );
  }
}
