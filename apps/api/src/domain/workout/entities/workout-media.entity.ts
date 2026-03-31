import { randomUUID } from 'crypto';
import { MediaStatus } from '../value-objects/media-status.vo';

export interface WorkoutMediaProps {
  id: string;
  workoutId: string;
  originalUrl: string;
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  status: MediaStatus;
  createdAt: Date;
}

export class WorkoutMedia {
  private readonly props: WorkoutMediaProps;

  private constructor(props: WorkoutMediaProps) {
    this.props = props;
  }

  static create(workoutId: string, originalUrl: string): WorkoutMedia {
    return new WorkoutMedia({
      id: randomUUID(),
      workoutId,
      originalUrl,
      thumbnailUrl: null,
      mediumUrl: null,
      status: MediaStatus.PROCESSING,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: WorkoutMediaProps): WorkoutMedia {
    return new WorkoutMedia(props);
  }

  get id(): string { return this.props.id; }
  get workoutId(): string { return this.props.workoutId; }
  get originalUrl(): string { return this.props.originalUrl; }
  get thumbnailUrl(): string | null { return this.props.thumbnailUrl; }
  get mediumUrl(): string | null { return this.props.mediumUrl; }
  get status(): MediaStatus { return this.props.status; }
  get createdAt(): Date { return this.props.createdAt; }

  markAsReady(thumbnailUrl: string, mediumUrl: string): void {
    this.props.thumbnailUrl = thumbnailUrl;
    this.props.mediumUrl = mediumUrl;
    this.props.status = MediaStatus.READY;
  }

  markAsFailed(): void {
    this.props.status = MediaStatus.FAILED;
  }

  isReady(): boolean {
    return this.props.status === MediaStatus.READY;
  }

  toJSON(): WorkoutMediaProps {
    return { ...this.props };
  }
}
