import { Module } from '@nestjs/common';
import { CHALLENGE_REPOSITORY } from '@domain/challenge/repositories/i-challenge.repository';
import { PrismaChallengeRepository } from '@infrastructure/persistence/challenge/prisma-challenge.repository';
import { CreateChallengeHandler } from '@application/challenge/commands/create-challenge/create-challenge.handler';
import { JoinChallengeHandler } from '@application/challenge/commands/join-challenge/join-challenge.handler';
import { GetChallengeHandler } from '@application/challenge/queries/get-challenge/get-challenge.handler';
import { ListChallengesHandler } from '@application/challenge/queries/list-challenges/list-challenges.handler';
import { GetRankingHandler } from '@application/challenge/queries/get-ranking/get-ranking.handler';
import { ChallengeController } from '../controllers/challenge.controller';
import { IdentityModule } from './identity.module';

@Module({
  imports: [IdentityModule],
  controllers: [ChallengeController],
  providers: [
    { provide: CHALLENGE_REPOSITORY, useClass: PrismaChallengeRepository },
    CreateChallengeHandler,
    JoinChallengeHandler,
    GetChallengeHandler,
    ListChallengesHandler,
    GetRankingHandler,
  ],
})
export class ChallengeModule {}
