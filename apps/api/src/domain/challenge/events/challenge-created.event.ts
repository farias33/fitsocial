import { DomainEvent } from '@shared/domain/domain-event';

export class ChallengeCreatedEvent extends DomainEvent {
  constructor(
    public readonly challengeId: string,
    public readonly createdById: string,
    public readonly name: string,
  ) {
    super();
  }
}
