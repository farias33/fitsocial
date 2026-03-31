import { DomainEvent } from '@shared/domain/domain-event';

export class ReactionAddedEvent extends DomainEvent {
  constructor(
    public readonly reactionId: string,
    public readonly workoutId: string,
    public readonly userId: string,
    public readonly emoji: string,
  ) {
    super();
  }
}
