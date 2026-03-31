import { randomUUID } from 'crypto';
import { ChallengePeriod } from '../value-objects/challenge-period.vo';
import {
  ChallengeNotActiveException,
  AlreadyParticipatingException,
  UnauthorizedChallengeActionException,
} from '../errors/challenge.errors';

export enum ChallengeStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

export interface ChallengeProps {
  id: string;
  name: string;
  description: string | null;
  period: ChallengePeriod;
  status: ChallengeStatus;
  createdById: string;
  participantIds: Set<string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChallengeInput {
  name: string;
  description: string | null;
  period: ChallengePeriod;
  createdById: string;
}

export class Challenge {
  private readonly props: ChallengeProps;

  private constructor(props: ChallengeProps) {
    this.props = props;
  }

  static create(input: CreateChallengeInput): Challenge {
    return new Challenge({
      ...input,
      id: randomUUID(),
      status: ChallengeStatus.UPCOMING,
      participantIds: new Set([input.createdById]), // criador entra automaticamente
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: ChallengeProps): Challenge {
    return new Challenge(props);
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get description(): string | null { return this.props.description; }
  get period(): ChallengePeriod { return this.props.period; }
  get status(): ChallengeStatus { return this.props.status; }
  get createdById(): string { return this.props.createdById; }
  get participantIds(): ReadonlySet<string> { return this.props.participantIds; }
  get participantCount(): number { return this.props.participantIds.size; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // ─── Regras de domínio ─────────────────────────────────────────────────────

  isCreatedBy(userId: string): boolean {
    return this.props.createdById === userId;
  }

  hasParticipant(userId: string): boolean {
    return this.props.participantIds.has(userId);
  }

  canJoin(): boolean {
    return (
      this.props.status === ChallengeStatus.UPCOMING ||
      this.props.status === ChallengeStatus.ACTIVE
    );
  }

  addParticipant(userId: string): void {
    if (!this.canJoin()) throw new ChallengeNotActiveException();
    if (this.hasParticipant(userId)) throw new AlreadyParticipatingException();

    this.props.participantIds.add(userId);
    this.props.updatedAt = new Date();
  }

  activate(): void {
    if (this.props.status !== ChallengeStatus.UPCOMING) return;
    this.props.status = ChallengeStatus.ACTIVE;
    this.props.updatedAt = new Date();
  }

  end(): void {
    if (this.props.status === ChallengeStatus.ENDED) return;
    this.props.status = ChallengeStatus.ENDED;
    this.props.updatedAt = new Date();
  }

  syncStatus(): void {
    if (this.props.period.hasEnded()) {
      this.end();
    } else if (this.props.period.hasStarted()) {
      this.activate();
    }
  }

  updateDetails(
    requesterId: string,
    input: { name?: string; description?: string },
  ): void {
    if (!this.isCreatedBy(requesterId)) {
      throw new UnauthorizedChallengeActionException();
    }
    if (input.name) this.props.name = input.name.trim();
    if (input.description !== undefined) this.props.description = input.description;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      description: this.props.description,
      startDate: this.props.period.startDate,
      endDate: this.props.period.endDate,
      status: this.props.status,
      createdById: this.props.createdById,
      participantIds: Array.from(this.props.participantIds),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
