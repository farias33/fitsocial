import { DomainError } from '@shared/domain/domain-error';

export class InvalidChallengePeriodException extends DomainError {
  constructor(reason: string) {
    super(`Período de desafio inválido: ${reason}`, 'CHALLENGE_INVALID_PERIOD');
  }
}

export class ChallengePeriod {
  private constructor(
    private readonly _startDate: Date,
    private readonly _endDate: Date,
  ) {}

  static create(startDate: Date, endDate: Date): ChallengePeriod {
    if (endDate <= startDate) {
      throw new InvalidChallengePeriodException(
        'a data de fim deve ser posterior à data de início',
      );
    }
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (startDate < todayStart) {
      throw new InvalidChallengePeriodException(
        'a data de início não pode ser no passado',
      );
    }
    return new ChallengePeriod(startDate, endDate);
  }

  static reconstitute(startDate: Date, endDate: Date): ChallengePeriod {
    return new ChallengePeriod(startDate, endDate);
  }

  get startDate(): Date { return this._startDate; }
  get endDate(): Date { return this._endDate; }

  isActive(at = new Date()): boolean {
    return at >= this._startDate && at <= this._endDate;
  }

  hasStarted(at = new Date()): boolean {
    return at >= this._startDate;
  }

  hasEnded(at = new Date()): boolean {
    return at > this._endDate;
  }

  durationDays(): number {
    return Math.ceil(
      (this._endDate.getTime() - this._startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  }
}
