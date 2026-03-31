import { DomainEvent } from '@shared/domain/domain-event';

export class ParticipantJoinedEvent extends DomainEvent {
  constructor(
    public readonly challengeId: string,
    public readonly userId: string,
  ) {
    super();
  }
}
