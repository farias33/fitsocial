import { DomainError } from '@shared/domain/domain-error';

const MIN_POINTS = 1;
const MAX_POINTS = 10;

export class InvalidWorkoutPointsException extends DomainError {
  constructor(value: number) {
    super(
      `Pontos inválidos: ${value}. Deve ser entre ${MIN_POINTS} e ${MAX_POINTS}`,
      'WORKOUT_INVALID_POINTS',
    );
  }
}

export class WorkoutPoints {
  private constructor(private readonly _value: number) {}

  static create(value: number): WorkoutPoints {
    if (!Number.isInteger(value) || value < MIN_POINTS || value > MAX_POINTS) {
      throw new InvalidWorkoutPointsException(value);
    }
    return new WorkoutPoints(value);
  }

  static default(): WorkoutPoints {
    return new WorkoutPoints(1);
  }

  static reconstitute(value: number): WorkoutPoints {
    return new WorkoutPoints(value);
  }

  get value(): number { return this._value; }

  equals(other: WorkoutPoints): boolean {
    return this._value === other._value;
  }
}
