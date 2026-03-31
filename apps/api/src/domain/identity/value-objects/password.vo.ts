import * as bcrypt from 'bcryptjs';
import { DomainError } from '@shared/domain/domain-error';

const BCRYPT_ROUNDS = 12;
const MIN_LENGTH = 8;

export class WeakPasswordException extends DomainError {
  constructor() {
    super(
      `A senha deve ter no mínimo ${MIN_LENGTH} caracteres`,
      'IDENTITY_WEAK_PASSWORD',
    );
  }
}

export class HashedPassword {
  private readonly hash: string;

  private constructor(hash: string) {
    this.hash = hash;
  }

  /** Cria a partir de texto puro — valida regras e faz hash */
  static async fromPlainText(plain: string): Promise<HashedPassword> {
    if (plain.length < MIN_LENGTH) throw new WeakPasswordException();
    const hash = await bcrypt.hash(plain, BCRYPT_ROUNDS);
    return new HashedPassword(hash);
  }

  /** Reconstitui a partir do hash já armazenado no banco */
  static fromHash(storedHash: string): HashedPassword {
    return new HashedPassword(storedHash);
  }

  async verify(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.hash);
  }

  toString(): string {
    return this.hash;
  }
}
