import { DomainEvent } from '@shared/domain/domain-event';

export class MediaProcessedEvent extends DomainEvent {
  constructor(
    public readonly workoutId: string,
    public readonly mediaId: string,
    public readonly thumbnailUrl: string,
    public readonly mediumUrl: string,
  ) {
    super();
  }
}
