import { Module } from '@nestjs/common';
import { WORKOUT_REPOSITORY } from '@domain/workout/repositories/i-workout.repository';
import { CHALLENGE_REPOSITORY } from '@domain/challenge/repositories/i-challenge.repository';
import { PrismaWorkoutRepository } from '@infrastructure/persistence/workout/prisma-workout.repository';
import { PrismaChallengeRepository } from '@infrastructure/persistence/challenge/prisma-challenge.repository';
import { StorageService } from '@infrastructure/storage/storage.service';
import { LogWorkoutHandler } from '@application/workout/commands/log-workout/log-workout.handler';
import { DeleteWorkoutHandler } from '@application/workout/commands/delete-workout/delete-workout.handler';
import { RequestMediaUploadHandler } from '@application/workout/commands/request-media-upload/request-media-upload.handler';
import { GetWorkoutHandler } from '@application/workout/queries/get-workout/get-workout.handler';
import { ListWorkoutsHandler } from '@application/workout/queries/list-workouts/list-workouts.handler';
import { WorkoutController } from '../controllers/workout.controller';
import { IdentityModule } from './identity.module';

@Module({
  imports: [IdentityModule],
  controllers: [WorkoutController],
  providers: [
    { provide: WORKOUT_REPOSITORY, useClass: PrismaWorkoutRepository },
    // LogWorkout precisa verificar participação no desafio
    { provide: CHALLENGE_REPOSITORY, useClass: PrismaChallengeRepository },
    StorageService,
    LogWorkoutHandler,
    DeleteWorkoutHandler,
    RequestMediaUploadHandler,
    GetWorkoutHandler,
    ListWorkoutsHandler,
  ],
})
export class WorkoutModule {}
