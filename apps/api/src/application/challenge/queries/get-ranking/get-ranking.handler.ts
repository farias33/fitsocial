import { Inject, Injectable } from '@nestjs/common';
import { GetRankingQuery } from './get-ranking.query';
import {
  IChallengeRepository,
  CHALLENGE_REPOSITORY,
} from '@domain/challenge/repositories/i-challenge.repository';
import { ChallengeNotFoundException } from '@domain/challenge/errors/challenge.errors';
import { PrismaService } from '@infrastructure/persistence/prisma.service';
import { paginate } from '@shared/utils/pagination';

export interface RankingEntryDto {
  position: number;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  workoutCount: number;
  totalPoints: number;
}

export interface RankingDto {
  challengeId: string;
  challengeName: string;
  entries: RankingEntryDto[];
  pagination: { page: number; limit: number; total: number; hasNext: boolean };
}

@Injectable()
export class GetRankingHandler {
  constructor(
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challengeRepository: IChallengeRepository,
    private readonly prisma: PrismaService,
  ) {}

  async handle(query: GetRankingQuery): Promise<RankingDto> {
    const challenge = await this.challengeRepository.findById(query.challengeId);
    if (!challenge) throw new ChallengeNotFoundException(query.challengeId);

    const { skip, take } = paginate({ page: query.page, limit: query.limit });

    // Query otimizada direto no banco — não precisa passar pelo aggregate
    // EXPLAIN ANALYZE recomendado em produção antes de criar índices adicionais
    const rows = await this.prisma.$queryRaw<
      Array<{
        user_id: string;
        display_name: string;
        username: string;
        avatar_url: string | null;
        workout_count: bigint;
        total_points: bigint;
      }>
    >`
      SELECT
        u.id          AS user_id,
        u.display_name,
        u.username,
        u.avatar_url,
        COUNT(w.id)   AS workout_count,
        COALESCE(SUM(w.points), 0) AS total_points
      FROM participants p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN workouts w
        ON w.user_id = p.user_id
       AND w.challenge_id = ${query.challengeId}
      WHERE p.challenge_id = ${query.challengeId}
      GROUP BY u.id, u.display_name, u.username, u.avatar_url
      ORDER BY total_points DESC, workout_count DESC, u.display_name ASC
      LIMIT ${take} OFFSET ${skip}
    `;

    const total = challenge.participantCount;

    const entries: RankingEntryDto[] = rows.map((row, index) => ({
      position: skip + index + 1,
      userId: row.user_id,
      displayName: row.display_name,
      username: row.username,
      avatarUrl: row.avatar_url,
      workoutCount: Number(row.workout_count),
      totalPoints: Number(row.total_points),
    }));

    return {
      challengeId: challenge.id,
      challengeName: challenge.name,
      entries,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        hasNext: query.page * query.limit < total,
      },
    };
  }
}
