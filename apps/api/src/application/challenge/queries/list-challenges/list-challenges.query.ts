import { ChallengeStatus } from '@domain/challenge/entities/challenge.entity';

export class ListChallengesQuery {
  constructor(
    public readonly status?: ChallengeStatus,
    public readonly userId?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly requesterId?: string,
  ) {}
}
