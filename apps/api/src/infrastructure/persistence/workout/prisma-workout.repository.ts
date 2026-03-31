import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IWorkoutRepository,
  ListWorkoutsFilter,
} from '@domain/workout/repositories/i-workout.repository';
import { Workout } from '@domain/workout/entities/workout.entity';
import { WorkoutMedia } from '@domain/workout/entities/workout-media.entity';
import { WorkoutPoints } from '@domain/workout/value-objects/workout-points.vo';
import { MediaStatus } from '@domain/workout/value-objects/media-status.vo';
import { paginate } from '@shared/utils/pagination';
import type {
  Workout as PrismaWorkout,
  WorkoutMedia as PrismaWorkoutMedia,
} from '@prisma/client';

type WorkoutWithMedia = PrismaWorkout & { media: PrismaWorkoutMedia[] };

@Injectable()
export class PrismaWorkoutRepository implements IWorkoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Workout | null> {
    const record = await this.prisma.workout.findUnique({
      where: { id },
      include: { media: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async findMany(
    filter: ListWorkoutsFilter,
  ): Promise<{ workouts: Workout[]; total: number }> {
    const { skip, take } = paginate({ page: filter.page ?? 1, limit: filter.limit ?? 20 });

    const where = {
      ...(filter.challengeId && { challengeId: filter.challengeId }),
      ...(filter.userId && { userId: filter.userId }),
    };

    const [records, total] = await Promise.all([
      this.prisma.workout.findMany({
        where,
        include: { media: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.workout.count({ where }),
    ]);

    return { workouts: records.map((r) => this.toDomain(r)), total };
  }

  async save(workout: Workout): Promise<void> {
    const data = workout.toJSON();

    await this.prisma.$transaction(async (tx) => {
      await tx.workout.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          userId: data.userId,
          challengeId: data.challengeId,
          title: data.title,
          description: data.description,
          points: data.points,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
        update: {
          title: data.title,
          description: data.description,
          points: data.points,
          updatedAt: data.updatedAt,
        },
      });

      // Upsert de todas as mídias do aggregate
      for (const m of data.media) {
        await tx.workoutMedia.upsert({
          where: { id: m.id },
          create: {
            id: m.id,
            workoutId: m.workoutId,
            originalUrl: m.originalUrl,
            thumbnailUrl: m.thumbnailUrl,
            mediumUrl: m.mediumUrl,
            status: m.status,
            createdAt: m.createdAt,
          },
          update: {
            thumbnailUrl: m.thumbnailUrl,
            mediumUrl: m.mediumUrl,
            status: m.status,
          },
        });
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workout.delete({ where: { id } });
  }

  private toDomain(record: WorkoutWithMedia): Workout {
    return Workout.reconstitute({
      id: record.id,
      userId: record.userId,
      challengeId: record.challengeId,
      title: record.title,
      description: record.description,
      points: WorkoutPoints.reconstitute(record.points),
      media: record.media.map((m) =>
        WorkoutMedia.reconstitute({
          id: m.id,
          workoutId: m.workoutId,
          originalUrl: m.originalUrl,
          thumbnailUrl: m.thumbnailUrl,
          mediumUrl: m.mediumUrl,
          status: m.status as MediaStatus,
          createdAt: m.createdAt,
        }),
      ),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
