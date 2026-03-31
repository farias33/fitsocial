import { Inject, Injectable } from '@nestjs/common';
import { DeleteWorkoutCommand } from './delete-workout.command';
import {
  IWorkoutRepository,
  WORKOUT_REPOSITORY,
} from '@domain/workout/repositories/i-workout.repository';
import { WorkoutNotFoundException } from '@domain/workout/errors/workout.errors';

@Injectable()
export class DeleteWorkoutHandler {
  constructor(
    @Inject(WORKOUT_REPOSITORY)
    private readonly workoutRepository: IWorkoutRepository,
  ) {}

  async handle(command: DeleteWorkoutCommand): Promise<void> {
    const workout = await this.workoutRepository.findById(command.workoutId);
    if (!workout) throw new WorkoutNotFoundException(command.workoutId);

    // Regra de domínio — lança WorkoutUnauthorizedException se não for o dono
    workout.assertOwnership(command.requesterId);

    await this.workoutRepository.delete(command.workoutId);
  }
}
