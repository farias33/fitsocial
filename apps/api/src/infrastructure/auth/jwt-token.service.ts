import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

export interface AccessTokenPayload {
  sub: string;   // userId
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;   // token id — usado para rotação
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
}

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  generateTokenPair(payload: AccessTokenPayload): TokenPair {
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow('JWT_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshTokenId = randomUUID();
    const refreshToken = this.jwt.sign(
      { sub: payload.sub, jti: refreshTokenId } satisfies RefreshTokenPayload,
      {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );

    return { accessToken, refreshToken, refreshTokenId };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwt.verify<AccessTokenPayload>(token, {
      secret: this.config.getOrThrow('JWT_SECRET'),
    });
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return this.jwt.verify<RefreshTokenPayload>(token, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
    });
  }
}
