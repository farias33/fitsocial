import { DomainError } from '@shared/domain/domain-error';

export class UserNotFoundException extends DomainError {
  constructor(identifier: string) {
    super(`Usuário não encontrado: ${identifier}`, 'IDENTITY_USER_NOT_FOUND');
  }
}

export class EmailAlreadyTakenException extends DomainError {
  constructor(email: string) {
    super(`E-mail já cadastrado: ${email}`, 'IDENTITY_EMAIL_TAKEN');
  }
}

export class UsernameAlreadyTakenException extends DomainError {
  constructor(username: string) {
    super(`Username já está em uso: ${username}`, 'IDENTITY_USERNAME_TAKEN');
  }
}

export class InvalidCredentialsException extends DomainError {
  constructor() {
    super('Credenciais inválidas', 'IDENTITY_INVALID_CREDENTIALS');
  }
}

export class InvalidRefreshTokenException extends DomainError {
  constructor() {
    super('Refresh token inválido ou expirado', 'IDENTITY_INVALID_REFRESH_TOKEN');
  }
}
