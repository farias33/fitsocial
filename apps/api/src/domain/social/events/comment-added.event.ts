import { DomainEvent } from '@shared/domain/domain-event';

export class CommentAddedEvent extends DomainEvent {
  constructor(
    public readonly commentId: string,
    public readonly workoutId: string,
    public readonly userId: string,
  ) {
    super();
  }
}
