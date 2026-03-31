import { Inject, Injectable } from '@nestjs/common';
import { LoginCommand } from './login.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/identity/repositories/i-user.repository';
import { InvalidCredentialsException } from '@domain/identity/errors/identity.errors';
import { JwtTokenService } from '@infrastructure/auth/jwt-token.service';
import { RedisService } from '@infrastructure/cache/redis.service';

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 dias

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; displayName: string; username: string; avatarUrl: string | null };
}

@Injectable()
export class LoginHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtTokenService,
    private readonly redis: RedisService,
  ) {}

  async handle(command: LoginCommand): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(command.email);

    // Mensagem genérica — não revelar se o e-mail existe
    if (!user || !user.passwordHash) {
      throw new InvalidCredentialsException();
    }

    const passwordValid = await user.passwordHash.verify(command.password);
    if (!passwordValid) throw new InvalidCredentialsException();

    const { accessToken, refreshToken, refreshTokenId } =
      this.jwtService.generateTokenPair({
        sub: user.id,
        email: user.email.toString(),
        role: user.role,
      });

    // Armazenar refresh token no Redis para validação e rotação
    await this.redis.set(
      `refresh_token:${user.id}:${refreshTokenId}`,
      { userId: user.id },
      REFRESH_TOKEN_TTL_SECONDS,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        displayName: user.displayName,
        username: user.username.toString(),
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
