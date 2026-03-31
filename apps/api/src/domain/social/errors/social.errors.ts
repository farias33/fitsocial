import { DomainError } from '@shared/domain/domain-error';

export class ReactionNotFoundException extends DomainError {
  constructor() {
    super('Reação não encontrada', 'SOCIAL_REACTION_NOT_FOUND');
  }
}

export class CommentNotFoundException extends DomainError {
  constructor(id: string) {
    super(`Comentário não encontrado: ${id}`, 'SOCIAL_COMMENT_NOT_FOUND');
  }
}

export class CommentUnauthorizedException extends DomainError {
  constructor() {
    super('Apenas o autor pode modificar este comentário', 'SOCIAL_COMMENT_UNAUTHORIZED');
  }
}

export class CommentTooLongException extends DomainError {
  constructor() {
    super('Comentário excede o limite de 500 caracteres', 'SOCIAL_COMMENT_TOO_LONG');
  }
}
