import { Inject, Injectable } from '@nestjs/common';
import { JoinChallengeCommand } from './join-challenge.command';
import {
  IChallengeRepository,
  CHALLENGE_REPOSITORY,
} from '@domain/challenge/repositories/i-challenge.repository';
import { ChallengeNotFoundException } from '@domain/challenge/errors/challenge.errors';

@Injectable()
export class JoinChallengeHandler {
  constructor(
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challengeRepository: IChallengeRepository,
  ) {}

  async handle(command: JoinChallengeCommand): Promise<void> {
    const challenge = await this.challengeRepository.findById(command.challengeId);
    if (!challenge) throw new ChallengeNotFoundException(command.challengeId);

    // Regras de domínio encapsuladas na entidade
    // Lança ChallengeNotActiveException ou AlreadyParticipatingException se inválido
    challenge.syncStatus();
    challenge.addParticipant(command.userId);

    await this.challengeRepository.save(challenge);

    // TODO: publicar ParticipantJoinedEvent → atualizar feed do usuário
  }
}
