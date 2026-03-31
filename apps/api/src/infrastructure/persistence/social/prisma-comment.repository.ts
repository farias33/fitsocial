import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ICommentRepository } from '@domain/social/repositories/i-comment.repository';
import { Comment } from '@domain/social/entities/comment.entity';
import { paginate } from '@shared/utils/pagination';
import type { Comment as PrismaComment } from '@prisma/client';

@Injectable()
export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Comment | null> {
    const record = await this.prisma.comment.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByWorkout(
    workoutId: string,
    options: { page: number; limit: number },
  ): Promise<{ comments: Comment[]; total: number }> {
    const { skip, take } = paginate(options);
    const [records, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { workoutId },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      this.prisma.comment.count({ where: { workoutId } }),
    ]);
    return { comments: records.map((r) => this.toDomain(r)), total };
  }

  async save(comment: Comment): Promise<void> {
    const data = comment.toJSON();
    await this.prisma.comment.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        userId: data.userId,
        workoutId: data.workoutId,
        body: data.body,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      update: { body: data.body, updatedAt: data.updatedAt },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }

  private toDomain(record: PrismaComment): Comment {
    return Comment.reconstitute({
      id: record.id,
      userId: record.userId,
      workoutId: record.workoutId,
      body: record.body,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
