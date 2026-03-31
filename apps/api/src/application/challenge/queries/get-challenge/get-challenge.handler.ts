import { Inject, Injectable } from '@nestjs/common';
import { GetChallengeQuery } from './get-challenge.query';
import {
  IChallengeRepository,
  CHALLENGE_REPOSITORY,
} from '@domain/challenge/repositories/i-challenge.repository';
import { ChallengeNotFoundException } from '@domain/challenge/errors/challenge.errors';
import { ChallengeDto } from './challenge.dto';

@Injectable()
export class GetChallengeHandler {
  constructor(
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challengeRepository: IChallengeRepository,
  ) {}

  async handle(query: GetChallengeQuery): Promise<ChallengeDto> {
    const challenge = await this.challengeRepository.findById(query.challengeId);
    if (!challenge) throw new ChallengeNotFoundException(query.challengeId);

    challenge.syncStatus();

    return {
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      startDate: challenge.period.startDate.toISOString(),
      endDate: challenge.period.endDate.toISOString(),
      durationDays: challenge.period.durationDays(),
      status: challenge.status,
      participantCount: challenge.participantCount,
      createdById: challenge.createdById,
      isParticipating: query.requesterId
        ? challenge.hasParticipant(query.requesterId)
        : false,
      isOwner: query.requesterId
        ? challenge.isCreatedBy(query.requesterId)
        : false,
      createdAt: challenge.createdAt.toISOString(),
    };
  }
}
