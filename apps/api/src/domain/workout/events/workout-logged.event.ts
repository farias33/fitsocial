import { DomainEvent } from '@shared/domain/domain-event';

export class WorkoutLoggedEvent extends DomainEvent {
  constructor(
    public readonly workoutId: string,
    public readonly userId: string,
    public readonly challengeId: string,
    public readonly points: number,
  ) {
    super();
  }
}
