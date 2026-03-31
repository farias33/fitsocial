import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IChallengeRepository,
  ListChallengesFilter,
} from '@domain/challenge/repositories/i-challenge.repository';
import {
  Challenge,
  ChallengeStatus,
} from '@domain/challenge/entities/challenge.entity';
import { ChallengePeriod } from '@domain/challenge/value-objects/challenge-period.vo';
import { paginate } from '@shared/utils/pagination';
import type { Challenge as PrismaChallenge, Participant } from '@prisma/client';

type ChallengeWithParticipants = PrismaChallenge & { participants: Pick<Participant, 'userId'>[] };

@Injectable()
export class PrismaChallengeRepository implements IChallengeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Challenge | null> {
    const record = await this.prisma.challenge.findUnique({
      where: { id },
      include: { participants: { select: { userId: true } } },
    });
    return record ? this.toDomain(record) : null;
  }

  async findMany(
    filter: ListChallengesFilter,
  ): Promise<{ challenges: Challenge[]; total: number }> {
    const { skip, take } = paginate({ page: filter.page ?? 1, limit: filter.limit ?? 20 });

    const where = {
      ...(filter.status && { status: filter.status }),
      ...(filter.userId && {
        participants: { some: { userId: filter.userId } },
      }),
    };

    const [records, total] = await Promise.all([
      this.prisma.challenge.findMany({
        where,
        include: { participants: { select: { userId: true } } },
        orderBy: { startDate: 'desc' },
        skip,
        take,
      }),
      this.prisma.challenge.count({ where }),
    ]);

    return { challenges: records.map((r) => this.toDomain(r)), total };
  }

  async save(challenge: Challenge): Promise<void> {
    const data = challenge.toJSON();

    await this.prisma.$transaction(async (tx) => {
      await tx.challenge.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          name: data.name,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
          createdById: data.createdById,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
        update: {
          name: data.name,
          description: data.description,
          status: data.status,
          updatedAt: data.updatedAt,
        },
      });

      // Sincroniza participantes — upsert cada um
      if (data.participantIds.length > 0) {
        await tx.participant.createMany({
          data: data.participantIds.map((userId) => ({
            userId,
            challengeId: data.id,
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.challenge.delete({ where: { id } });
  }

  private toDomain(record: ChallengeWithParticipants): Challenge {
    return Challenge.reconstitute({
      id: record.id,
      name: record.name,
      description: record.description,
      period: ChallengePeriod.reconstitute(record.startDate, record.endDate),
      status: record.status as ChallengeStatus,
      createdById: record.createdById,
      participantIds: new Set(record.participants.map((p) => p.userId)),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
