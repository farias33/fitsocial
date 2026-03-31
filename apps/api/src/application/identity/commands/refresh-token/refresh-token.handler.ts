import { Injectable } from '@nestjs/common';
import { RefreshTokenCommand } from './refresh-token.command';
import { JwtTokenService } from '@infrastructure/auth/jwt-token.service';
import { RedisService } from '@infrastructure/cache/redis.service';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/identity/repositories/i-user.repository';
import {
  InvalidRefreshTokenException,
  UserNotFoundException,
} from '@domain/identity/errors/identity.errors';
import { Inject } from '@nestjs/common';

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtTokenService,
    private readonly redis: RedisService,
  ) {}

  async handle(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    let payload;
    try {
      payload = this.jwtService.verifyRefreshToken(command.refreshToken);
    } catch {
      throw new InvalidRefreshTokenException();
    }

    const redisKey = `refresh_token:${payload.sub}:${payload.jti}`;
    const stored = await this.redis.exists(redisKey);
    if (!stored) throw new InvalidRefreshTokenException();

    const user = await this.userRepository.findById(payload.sub);
    if (!user) throw new UserNotFoundException(payload.sub);

    // Rotação — invalida o token antigo
    await this.redis.delete(redisKey);

    const { accessToken, refreshToken, refreshTokenId } =
      this.jwtService.generateTokenPair({
        sub: user.id,
        email: user.email.toString(),
        role: user.role,
      });

    await this.redis.set(
      `refresh_token:${user.id}:${refreshTokenId}`,
      { userId: user.id },
      REFRESH_TOKEN_TTL_SECONDS,
    );

    return { accessToken, refreshToken };
  }
}
