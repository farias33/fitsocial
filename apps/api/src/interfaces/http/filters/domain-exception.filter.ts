import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { DomainError } from '@shared/domain/domain-error';
import type { FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

const CODE_TO_STATUS: Record<string, number> = {
  // Identity
  IDENTITY_USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  IDENTITY_EMAIL_TAKEN: HttpStatus.CONFLICT,
  IDENTITY_USERNAME_TAKEN: HttpStatus.CONFLICT,
  IDENTITY_INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  IDENTITY_INVALID_REFRESH_TOKEN: HttpStatus.UNAUTHORIZED,
  IDENTITY_INVALID_EMAIL: HttpStatus.UNPROCESSABLE_ENTITY,
  IDENTITY_WEAK_PASSWORD: HttpStatus.UNPROCESSABLE_ENTITY,
  IDENTITY_INVALID_USERNAME: HttpStatus.UNPROCESSABLE_ENTITY,
  // Workout
  WORKOUT_NOT_FOUND: HttpStatus.NOT_FOUND,
  WORKOUT_UNAUTHORIZED: HttpStatus.FORBIDDEN,
  WORKOUT_NOT_PARTICIPATING: HttpStatus.FORBIDDEN,
  WORKOUT_INVALID_POINTS: HttpStatus.UNPROCESSABLE_ENTITY,
  WORKOUT_MEDIA_NOT_FOUND: HttpStatus.NOT_FOUND,
  // Social
  SOCIAL_INVALID_EMOJI: HttpStatus.UNPROCESSABLE_ENTITY,
  SOCIAL_REACTION_NOT_FOUND: HttpStatus.NOT_FOUND,
  SOCIAL_COMMENT_NOT_FOUND: HttpStatus.NOT_FOUND,
  SOCIAL_COMMENT_UNAUTHORIZED: HttpStatus.FORBIDDEN,
  SOCIAL_COMMENT_TOO_LONG: HttpStatus.UNPROCESSABLE_ENTITY,
  // Challenge
  CHALLENGE_NOT_FOUND: HttpStatus.NOT_FOUND,
  CHALLENGE_NOT_ACTIVE: HttpStatus.UNPROCESSABLE_ENTITY,
  CHALLENGE_ALREADY_PARTICIPATING: HttpStatus.CONFLICT,
  CHALLENGE_NOT_PARTICIPATING: HttpStatus.FORBIDDEN,
  CHALLENGE_UNAUTHORIZED: HttpStatus.FORBIDDEN,
  CHALLENGE_INVALID_PERIOD: HttpStatus.UNPROCESSABLE_ENTITY,
};

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const status = CODE_TO_STATUS[exception.code] ?? HttpStatus.BAD_REQUEST;

    reply.status(status).send({
      error: {
        code: exception.code,
        message: exception.message,
        timestamp: new Date().toISOString(),
        requestId: randomUUID(),
      },
    });
  }
}
