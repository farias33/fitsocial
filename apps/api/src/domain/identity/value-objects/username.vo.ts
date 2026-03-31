import { DomainError } from '@shared/domain/domain-error';

export class InvalidUsernameException extends DomainError {
  constructor(reason: string) {
    super(`Username inválido: ${reason}`, 'IDENTITY_INVALID_USERNAME');
  }
}

export class Username {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): Username {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed.length < 3) throw new InvalidUsernameException('muito curto (mín. 3)');
    if (trimmed.length > 30) throw new InvalidUsernameException('muito longo (máx. 30)');
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      throw new InvalidUsernameException('apenas letras minúsculas, números e _');
    }
    return new Username(trimmed);
  }

  static reconstitute(stored: string): Username {
    return new Username(stored);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }
}
