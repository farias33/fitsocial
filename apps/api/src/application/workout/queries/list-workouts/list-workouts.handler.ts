import { Inject, Injectable } from '@nestjs/common';
import { ListWorkoutsQuery } from './list-workouts.query';
import {
  IWorkoutRepository,
  WORKOUT_REPOSITORY,
} from '@domain/workout/repositories/i-workout.repository';
import { PaginatedResult } from '@shared/utils/pagination';
import { WorkoutDto } from '../get-workout/workout.dto';
import { toWorkoutDto } from '../get-workout/workout.dto';

@Injectable()
export class ListWorkoutsHandler {
  constructor(
    @Inject(WORKOUT_REPOSITORY)
    private readonly workoutRepository: IWorkoutRepository,
  ) {}

  async handle(query: ListWorkoutsQuery): Promise<PaginatedResult<WorkoutDto>> {
    const { workouts, total } = await this.workoutRepository.findMany({
      challengeId: query.challengeId,
      userId: query.userId,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: workouts.map(toWorkoutDto),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        hasNext: query.page * query.limit < total,
      },
    };
  }
}
