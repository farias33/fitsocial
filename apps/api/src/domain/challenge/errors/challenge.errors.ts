import { DomainError } from '@shared/domain/domain-error';

export class ChallengeNotFoundException extends DomainError {
  constructor(id: string) {
    super(`Desafio não encontrado: ${id}`, 'CHALLENGE_NOT_FOUND');
  }
}

export class ChallengeNotActiveException extends DomainError {
  constructor() {
    super('Este desafio não está ativo', 'CHALLENGE_NOT_ACTIVE');
  }
}

export class AlreadyParticipatingException extends DomainError {
  constructor() {
    super('Você já está participando deste desafio', 'CHALLENGE_ALREADY_PARTICIPATING');
  }
}

export class NotParticipatingException extends DomainError {
  constructor() {
    super('Você não está participando deste desafio', 'CHALLENGE_NOT_PARTICIPATING');
  }
}

export class UnauthorizedChallengeActionException extends DomainError {
  constructor() {
    super('Apenas o criador pode realizar esta ação', 'CHALLENGE_UNAUTHORIZED');
  }
}
