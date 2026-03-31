import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Repositório
import { USER_REPOSITORY } from '@domain/identity/repositories/i-user.repository';
import { PrismaUserRepository } from '@infrastructure/persistence/identity/prisma-user.repository';

// Infraestrutura
import { RedisService } from '@infrastructure/cache/redis.service';
import { JwtTokenService } from '@infrastructure/auth/jwt-token.service';

// Use Cases
import { RegisterUserHandler } from '@application/identity/commands/register-user/register-user.handler';
import { LoginHandler } from '@application/identity/commands/login/login.handler';
import { RefreshTokenHandler } from '@application/identity/commands/refresh-token/refresh-token.handler';

// Controller
import { AuthController } from '../controllers/auth.controller';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    // Repositório — injeção via token simbólico (domínio não conhece Prisma)
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },

    // Infraestrutura
    RedisService,
    JwtTokenService,

    // Use Cases
    RegisterUserHandler,
    LoginHandler,
    RefreshTokenHandler,
  ],
  exports: [JwtTokenService, RedisService],
})
export class IdentityModule {}
