import { Workout } from '../entities/workout.entity';

export interface ListWorkoutsFilter {
  challengeId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface IWorkoutRepository {
  findById(id: string): Promise<Workout | null>;
  findMany(filter: ListWorkoutsFilter): Promise<{ workouts: Workout[]; total: number }>;
  save(workout: Workout): Promise<void>;
  delete(id: string): Promise<void>;
}

export const WORKOUT_REPOSITORY = Symbol('IWorkoutRepository');
