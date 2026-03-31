import { Workout } from '@domain/workout/entities/workout.entity';
import { MediaStatus } from '@domain/workout/value-objects/media-status.vo';

export interface WorkoutMediaDto {
  id: string;
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  originalUrl: string;
  status: MediaStatus;
}

export interface WorkoutDto {
  id: string;
  userId: string;
  challengeId: string;
  title: string;
  description: string | null;
  points: number;
  media: WorkoutMediaDto[];
  createdAt: string;
}

export function toWorkoutDto(workout: Workout): WorkoutDto {
  return {
    id: workout.id,
    userId: workout.userId,
    challengeId: workout.challengeId,
    title: workout.title,
    description: workout.description,
    points: workout.points.value,
    media: workout.media.map((m) => ({
      id: m.id,
      thumbnailUrl: m.thumbnailUrl,
      mediumUrl: m.mediumUrl,
      originalUrl: m.originalUrl,
      status: m.status,
    })),
    createdAt: workout.createdAt.toISOString(),
  };
}
