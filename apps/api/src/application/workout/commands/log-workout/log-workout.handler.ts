import { Inject, Injectable } from '@nestjs/common';
import { LogWorkoutCommand } from './log-workout.command';
import {
  IWorkoutRepository,
  WORKOUT_REPOSITORY,
} from '@domain/workout/repositories/i-workout.repository';
import {
  IChallengeRepository,
  CHALLENGE_REPOSITORY,
} from '@domain/challenge/repositories/i-challenge.repository';
import { Workout } from '@domain/workout/entities/workout.entity';
import { WorkoutPoints } from '@domain/workout/value-objects/workout-points.vo';
import { WorkoutLoggedEvent } from '@domain/workout/events/workout-logged.event';
import { NotParticipatingInChallengeException } from '@domain/workout/errors/workout.errors';
import { ChallengeNotFoundException } from '@domain/challenge/errors/challenge.errors';
import { WorkoutEventProducer } from '@infrastructure/messaging/producers/workout-event.producer';

export interface LogWorkoutResult {
  workoutId: string;
}

@Injectable()
export class LogWorkoutHandler {
  constructor(
    @Inject(WORKOUT_REPOSITORY)
    private readonly workoutRepository: IWorkoutRepository,
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challengeRepository: IChallengeRepository,
    private readonly workoutEventProducer: WorkoutEventProducer,
  ) {}

  async handle(command: LogWorkoutCommand): Promise<LogWorkoutResult> {
    const challenge = await this.challengeRepository.findById(command.challengeId);
    if (!challenge) throw new ChallengeNotFoundException(command.challengeId);

    challenge.syncStatus();

    if (!challenge.hasParticipant(command.userId)) {
      throw new NotParticipatingInChallengeException();
    }

    const points = WorkoutPoints.create(command.points);

    const workout = Workout.create({
      userId: command.userId,
      challengeId: command.challengeId,
      title: command.title.trim(),
      description: command.description?.trim() ?? null,
      points,
    });

    await this.workoutRepository.save(workout);

    const event = new WorkoutLoggedEvent(
      workout.id,
      workout.userId,
      workout.challengeId,
      workout.points.value,
    );
    await this.workoutEventProducer.publishWorkoutLogged(event);

    return { workoutId: workout.id };
  }
}
