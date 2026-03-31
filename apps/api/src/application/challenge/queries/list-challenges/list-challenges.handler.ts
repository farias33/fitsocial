import { Inject, Injectable } from '@nestjs/common';
import { ListChallengesQuery } from './list-challenges.query';
import {
  IChallengeRepository,
  CHALLENGE_REPOSITORY,
} from '@domain/challenge/repositories/i-challenge.repository';
import { ChallengeDto } from '../get-challenge/challenge.dto';
import { PaginatedResult } from '@shared/utils/pagination';

@Injectable()
export class ListChallengesHandler {
  constructor(
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challengeRepository: IChallengeRepository,
  ) {}

  async handle(query: ListChallengesQuery): Promise<PaginatedResult<ChallengeDto>> {
    const { challenges, total } = await this.challengeRepository.findMany({
      status: query.status,
      userId: query.userId,
      page: query.page,
      limit: query.limit,
    });

    const data: ChallengeDto[] = challenges.map((c) => {
      c.syncStatus();
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        startDate: c.period.startDate.toISOString(),
        endDate: c.period.endDate.toISOString(),
        durationDays: c.period.durationDays(),
        status: c.status,
        participantCount: c.participantCount,
        createdById: c.createdById,
        isParticipating: query.requesterId
          ? c.hasParticipant(query.requesterId)
          : false,
        isOwner: query.requesterId ? c.isCreatedBy(query.requesterId) : false,
        createdAt: c.createdAt.toISOString(),
      };
    });

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        hasNext: query.page * query.limit < total,
      },
    };
  }
}
