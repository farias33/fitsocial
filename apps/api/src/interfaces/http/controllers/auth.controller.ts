import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { RegisterUserHandler } from '@application/identity/commands/register-user/register-user.handler';
import { RegisterUserCommand } from '@application/identity/commands/register-user/register-user.command';
import { LoginHandler } from '@application/identity/commands/login/login.handler';
import { LoginCommand } from '@application/identity/commands/login/login.command';
import { RefreshTokenHandler } from '@application/identity/commands/refresh-token/refresh-token.handler';
import { RefreshTokenCommand } from '@application/identity/commands/refresh-token/refresh-token.command';
import { JwtAuthGuard } from '../middlewares/jwt-auth.guard';
import { CurrentUser } from '../middlewares/current-user.decorator';
import type { AccessTokenPayload } from '@infrastructure/auth/jwt-token.service';
import { RedisService } from '@infrastructure/cache/redis.service';

// ─── DTOs com validação Zod ───────────────────────────────────────────────────

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  displayName: z.string().min(1).max(80),
  password: z.string().min(8),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterUserHandler,
    private readonly loginHandler: LoginHandler,
    private readonly refreshHandler: RefreshTokenHandler,
    private readonly redis: RedisService,
  ) {}

  /** POST /api/auth/register */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: unknown) {
    const dto = RegisterSchema.parse(body);
    const result = await this.registerHandler.handle(
      new RegisterUserCommand(dto.email, dto.username, dto.displayName, dto.password),
    );
    return { data: result };
  }

  /** POST /api/auth/login */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const dto = LoginSchema.parse(body);
    const result = await this.loginHandler.handle(
      new LoginCommand(dto.email, dto.password),
    );

    // refresh_token → HttpOnly cookie (nunca exposto ao JS)
    reply.setCookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTIONS);

    // access_token → body (cliente armazena em memória)
    return {
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
  }

  /** POST /api/auth/refresh */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const token = (request.cookies as Record<string, string>)[REFRESH_COOKIE];
    if (!token) {
      reply.status(HttpStatus.UNAUTHORIZED).send({
        error: { code: 'IDENTITY_INVALID_REFRESH_TOKEN', message: 'Refresh token ausente' },
      });
      return;
    }

    const result = await this.refreshHandler.handle(new RefreshTokenCommand(token));

    reply.setCookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTIONS);

    return { data: { accessToken: result.accessToken } };
  }

  /** POST /api/auth/logout */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() currentUser: AccessTokenPayload,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    // Limpar todos os refresh tokens do usuário no Redis
    // (em produção usar SCAN por padrão — aqui simplificado)
    reply.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  }
}
