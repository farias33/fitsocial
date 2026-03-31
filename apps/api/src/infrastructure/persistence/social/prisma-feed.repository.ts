import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IFeedRepository,
  FeedWorkout,
} from '@domain/social/repositories/i-feed.repository';
import { paginate } from '@shared/utils/pagination';

@Injectable()
export class PrismaFeedRepository implements IFeedRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(
    userId: string,
    options: { page: number; limit: number },
  ): Promise<{ items: FeedWorkout[]; total: number }> {
    const { skip, take } = paginate(options);

    // Feed = treinos de todos os desafios em que o usuário participa, ordenados por data
    // EXPLAIN ANALYZE recomendado em produção — índice em workouts(created_at DESC)
    const [rows, totalResult] = await Promise.all([
      this.prisma.$queryRaw<
        Array<{
          workout_id: string;
          user_id: string;
          display_name: string;
          username: string;
          avatar_url: string | null;
          challenge_id: string;
          challenge_name: string;
          title: string;
          description: string | null;
          points: number;
          thumbnail_url: string | null;
          reaction_count: bigint;
          comment_count: bigint;
          created_at: Date;
        }>
      >`
        SELECT
          w.id              AS workout_id,
          u.id              AS user_id,
          u.display_name,
          u.username,
          u.avatar_url,
          c.id              AS challenge_id,
          c.name            AS challenge_name,
          w.title,
          w.description,
          w.points,
          (
            SELECT wm.thumbnail_url
            FROM workout_media wm
            WHERE wm.workout_id = w.id AND wm.status = 'READY'
            ORDER BY wm.created_at
            LIMIT 1
          )                 AS thumbnail_url,
          (SELECT COUNT(*) FROM reactions r WHERE r.workout_id = w.id)  AS reaction_count,
          (SELECT COUNT(*) FROM comments  cm WHERE cm.workout_id = w.id) AS comment_count,
          w.created_at
        FROM workouts w
        JOIN users u         ON u.id = w.user_id
        JOIN challenges c    ON c.id = w.challenge_id
        WHERE w.challenge_id IN (
          SELECT p.challenge_id
          FROM participants p
          WHERE p.user_id = ${userId}
        )
        ORDER BY w.created_at DESC
        LIMIT ${take} OFFSET ${skip}
      `,

      this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) AS count
        FROM workouts w
        WHERE w.challenge_id IN (
          SELECT p.challenge_id FROM participants p WHERE p.user_id = ${userId}
        )
      `,
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    const items: FeedWorkout[] = rows.map((row) => ({
      workoutId: row.workout_id,
      userId: row.user_id,
      displayName: row.display_name,
      username: row.username,
      avatarUrl: row.avatar_url,
      challengeId: row.challenge_id,
      challengeName: row.challenge_name,
      title: row.title,
      description: row.description,
      points: row.points,
      thumbnailUrl: row.thumbnail_url,
      reactionCount: Number(row.reaction_count),
      commentCount: Number(row.comment_count),
      createdAt: row.created_at.toISOString(),
    }));

    return { items, total };
  }
}
