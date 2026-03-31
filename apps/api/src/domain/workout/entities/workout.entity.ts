import { randomUUID } from 'crypto';
import { WorkoutPoints } from '../value-objects/workout-points.vo';
import { WorkoutMedia } from './workout-media.entity';
import { WorkoutUnauthorizedException } from '../errors/workout.errors';

export interface WorkoutProps {
  id: string;
  userId: string;
  challengeId: string;
  title: string;
  description: string | null;
  points: WorkoutPoints;
  media: WorkoutMedia[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkoutInput {
  userId: string;
  challengeId: string;
  title: string;
  description: string | null;
  points?: WorkoutPoints;
}

export class Workout {
  private readonly props: WorkoutProps;

  private constructor(props: WorkoutProps) {
    this.props = props;
  }

  static create(input: CreateWorkoutInput): Workout {
    return new Workout({
      ...input,
      id: randomUUID(),
      points: input.points ?? WorkoutPoints.default(),
      media: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: WorkoutProps): Workout {
    return new Workout(props);
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get challengeId(): string { return this.props.challengeId; }
  get title(): string { return this.props.title; }
  get description(): string | null { return this.props.description; }
  get points(): WorkoutPoints { return this.props.points; }
  get media(): readonly WorkoutMedia[] { return this.props.media; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // ─── Domínio ───────────────────────────────────────────────────────────────

  isOwnedBy(userId: string): boolean {
    return this.props.userId === userId;
  }

  assertOwnership(userId: string): void {
    if (!this.isOwnedBy(userId)) throw new WorkoutUnauthorizedException();
  }

  attachMedia(media: WorkoutMedia): void {
    this.props.media.push(media);
    this.props.updatedAt = new Date();
  }

  readyMediaCount(): number {
    return this.props.media.filter((m) => m.isReady()).length;
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      challengeId: this.props.challengeId,
      title: this.props.title,
      description: this.props.description,
      points: this.props.points.value,
      media: this.props.media.map((m) => m.toJSON()),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
