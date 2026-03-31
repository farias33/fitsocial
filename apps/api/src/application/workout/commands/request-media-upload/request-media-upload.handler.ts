import { Inject, Injectable } from '@nestjs/common';
import { RequestMediaUploadCommand } from './request-media-upload.command';
import {
  IWorkoutRepository,
  WORKOUT_REPOSITORY,
} from '@domain/workout/repositories/i-workout.repository';
import { WorkoutMedia } from '@domain/workout/entities/workout-media.entity';
import { WorkoutNotFoundException } from '@domain/workout/errors/workout.errors';
import { StorageService } from '@infrastructure/storage/storage.service';

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export class UnsupportedMediaTypeException extends Error {
  constructor(type: string) {
    super(`Tipo de arquivo não suportado: ${type}. Use: ${ALLOWED_CONTENT_TYPES.join(', ')}`);
    this.name = 'UnsupportedMediaTypeException';
  }
}

export interface RequestMediaUploadResult {
  mediaId: string;
  uploadUrl: string;
}

@Injectable()
export class RequestMediaUploadHandler {
  constructor(
    @Inject(WORKOUT_REPOSITORY)
    private readonly workoutRepository: IWorkoutRepository,
    private readonly storage: StorageService,
  ) {}

  async handle(command: RequestMediaUploadCommand): Promise<RequestMediaUploadResult> {
    if (!ALLOWED_CONTENT_TYPES.includes(command.contentType)) {
      throw new UnsupportedMediaTypeException(command.contentType);
    }

    const workout = await this.workoutRepository.findById(command.workoutId);
    if (!workout) throw new WorkoutNotFoundException(command.workoutId);

    workout.assertOwnership(command.requesterId);

    const { mediaId, uploadUrl, key } = await this.storage.createPresignedUpload(
      `workouts/${command.workoutId}`,
      command.contentType,
    );

    // Registra mídia no aggregate com status PROCESSING
    const media = WorkoutMedia.create(command.workoutId, key);
    workout.attachMedia(media);

    await this.workoutRepository.save(workout);

    return { mediaId, uploadUrl };
  }
}
