import { randomUUID } from 'crypto';

export abstract class DomainEvent {
  readonly id: string;
  readonly occurredAt: Date;

  constructor() {
    this.id = randomUUID();
    this.occurredAt = new Date();
  }
}
