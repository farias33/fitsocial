import { Inject, Injectable } from '@nestjs/common';
import { GetWorkoutQuery } from './get-workout.query';
import {
  IWorkoutRepository,
  WORKOUT_REPOSITORY,
} from '@domain/workout/repositories/i-workout.repository';
import { WorkoutNotFoundException } from '@domain/workout/errors/workout.errors';
import { WorkoutDto, toWorkoutDto } from './workout.dto';

@Injectable()
export class GetWorkoutHandler {
  constructor(
    @Inject(WORKOUT_REPOSITORY)
    private readonly workoutRepository: IWorkoutRepository,
  ) {}

  async handle(query: GetWorkoutQuery): Promise<WorkoutDto> {
    const workout = await this.workoutRepository.findById(query.workoutId);
    if (!workout) throw new WorkoutNotFoundException(query.workoutId);
    return toWorkoutDto(workout);
  }
}
