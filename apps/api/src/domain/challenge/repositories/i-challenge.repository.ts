import { Challenge, ChallengeStatus } from '../entities/challenge.entity';

export interface ListChallengesFilter {
  status?: ChallengeStatus;
  userId?: string;   // desafios em que o usuário participa
  page?: number;
  limit?: number;
}

export interface IChallengeRepository {
  findById(id: string): Promise<Challenge | null>;
  findMany(filter: ListChallengesFilter): Promise<{ challenges: Challenge[]; total: number }>;
  save(challenge: Challenge): Promise<void>;
  delete(id: string): Promise<void>;
}

export const CHALLENGE_REPOSITORY = Symbol('IChallengeRepository');
