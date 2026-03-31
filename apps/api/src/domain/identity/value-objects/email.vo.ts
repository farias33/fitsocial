import { DomainError } from '@shared/domain/domain-error';

export class InvalidEmailException extends DomainError {
  constructor(value: string) {
    super(`"${value}" não é um e-mail válido`, 'IDENTITY_INVALID_EMAIL');
  }
}

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new InvalidEmailException(raw);
    }
    return new Email(normalized);
  }

  static reconstitute(stored: string): Email {
    return new Email(stored);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
