import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IReactionRepository,
  ReactionSummary,
} from '@domain/social/repositories/i-reaction.repository';
import { Reaction } from '@domain/social/entities/reaction.entity';
import { ReactionEmoji } from '@domain/social/value-objects/reaction-emoji.vo';
import type { Reaction as PrismaReaction } from '@prisma/client';

@Injectable()
export class PrismaReactionRepository implements IReactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndWorkout(userId: string, workoutId: string): Promise<Reaction | null> {
    const record = await this.prisma.reaction.findUnique({
      where: { userId_workoutId: { userId, workoutId } },
    });
    return record ? this.toDomain(record) : null;
  }

  async summarizeByWorkout(
    workoutId: string,
    requesterId?: string,
  ): Promise<ReactionSummary[]> {
    const rows = await this.prisma.reaction.groupBy({
      by: ['emoji'],
      where: { workoutId },
      _count: { emoji: true },
      orderBy: { _count: { emoji: 'desc' } },
    });

    const myReactions = requesterId
      ? await this.prisma.reaction.findMany({
          where: { workoutId, userId: requesterId },
          select: { emoji: true },
        })
      : [];

    const myEmojiSet = new Set(myReactions.map((r) => r.emoji));

    return rows.map((row) => ({
      emoji: row.emoji,
      count: row._count.emoji,
      reactedByMe: myEmojiSet.has(row.emoji),
    }));
  }

  async save(reaction: Reaction): Promise<void> {
    const data = reaction.toJSON();
    await this.prisma.reaction.upsert({
      where: { userId_workoutId: { userId: data.userId, workoutId: data.workoutId } },
      create: {
        id: data.id,
        userId: data.userId,
        workoutId: data.workoutId,
        emoji: data.emoji,
        createdAt: data.createdAt,
      },
      update: { emoji: data.emoji },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reaction.delete({ where: { id } });
  }

  private toDomain(record: PrismaReaction): Reaction {
    return Reaction.reconstitute({
      id: record.id,
      userId: record.userId,
      workoutId: record.workoutId,
      emoji: ReactionEmoji.reconstitute(record.emoji),
      createdAt: record.createdAt,
    });
  }
}
