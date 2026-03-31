import { Inject, Injectable } from '@nestjs/common';
import { CreateChallengeCommand } from './create-challenge.command';
import {
  IChallengeRepository,
  CHALLENGE_REPOSITORY,
} from '@domain/challenge/repositories/i-challenge.repository';
import { Challenge } from '@domain/challenge/entities/challenge.entity';
import { ChallengePeriod } from '@domain/challenge/value-objects/challenge-period.vo';

export interface CreateChallengeResult {
  challengeId: string;
}

@Injectable()
export class CreateChallengeHandler {
  constructor(
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challengeRepository: IChallengeRepository,
  ) {}

  async handle(command: CreateChallengeCommand): Promise<CreateChallengeResult> {
    const period = ChallengePeriod.create(command.startDate, command.endDate);

    const challenge = Challenge.create({
      name: command.name.trim(),
      description: command.description?.trim() ?? null,
      period,
      createdById: command.createdById,
    });

    // Sincroniza status baseado nas datas (caso start = hoje)
    challenge.syncStatus();

    await this.challengeRepository.save(challenge);

    // TODO: publicar ChallengeCreatedEvent → notificar seguidores

    return { challengeId: challenge.id };
  }
}
