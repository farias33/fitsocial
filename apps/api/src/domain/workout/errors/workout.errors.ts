import { DomainError } from '@shared/domain/domain-error';

export class WorkoutNotFoundException extends DomainError {
  constructor(id: string) {
    super(`Treino não encontrado: ${id}`, 'WORKOUT_NOT_FOUND');
  }
}

export class WorkoutUnauthorizedException extends DomainError {
  constructor() {
    super('Apenas o dono pode realizar esta ação no treino', 'WORKOUT_UNAUTHORIZED');
  }
}

export class NotParticipatingInChallengeException extends DomainError {
  constructor() {
    super(
      'Você precisa participar do desafio antes de registrar um treino',
      'WORKOUT_NOT_PARTICIPATING',
    );
  }
}

export class WorkoutMediaNotFoundException extends DomainError {
  constructor(id: string) {
    super(`Mídia de treino não encontrada: ${id}`, 'WORKOUT_MEDIA_NOT_FOUND');
  }
}
