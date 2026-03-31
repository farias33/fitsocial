import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService, QUEUES } from '@infrastructure/messaging/rabbitmq.service';
import { MessageDeduplicationService } from '@infrastructure/messaging/message-deduplication.service';
import { RedisService } from '@infrastructure/cache/redis.service';
import { PrismaService } from '@infrastructure/persistence/prisma.service';

interface WorkoutLoggedPayload {
  workoutId: string;
  userId: string;
  challengeId: string;
  points: number;
  occurredAt: string;
}

const RANKING_CACHE_TTL = 2 * 60; // 2 minutos — conforme CLAUDE.md

@Injectable()
export class RankingUpdateWorker implements OnModuleInit {
  private readonly logger = new Logger(RankingUpdateWorker.name);

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly dedup: MessageDeduplicationService,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitmq.consume<WorkoutLoggedPayload>(
      QUEUES.WORKOUT_RANKING,
      this.process.bind(this),
    );
  }

  private async process(payload: WorkoutLoggedPayload, msg: any): Promise<void> {
    const messageId = msg.properties.messageId as string;

    // Idempotência — não reprocessar a mesma mensagem
    if (await this.dedup.isAlreadyProcessed(messageId)) {
      this.logger.debug(`[ranking] Mensagem ${messageId} já processada — ignorando`);
      return;
    }

    this.logger.log(
      `[ranking] Atualizando ranking do desafio ${payload.challengeId}`,
    );

    // Recalcula top 50 e cacheia no Redis com isolamento REPEATABLE READ
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
        u.id            AS user_id,
        u.display_name,
        u.username,
        u.avatar_url,
        COUNT(w.id)     AS workout_count,
        COALESCE(SUM(w.points), 0) AS total_points
      FROM participants p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN workouts w
        ON w.user_id = p.user_id
       AND w.challenge_id = ${payload.challengeId}
      WHERE p.challenge_id = ${payload.challengeId}
      GROUP BY u.id, u.display_name, u.username, u.avatar_url
      ORDER BY total_points DESC, workout_count DESC
      LIMIT 50
    `;

    const ranking = rows.map((row, idx) => ({
      position: idx + 1,
      userId: row.user_id,
      displayName: row.display_name,
      username: row.username,
      avatarUrl: row.avatar_url,
      workoutCount: Number(row.workout_count),
      totalPoints: Number(row.total_points),
    }));

    const cacheKey = `ranking:${payload.challengeId}`;
    await this.redis.set(cacheKey, ranking, RANKING_CACHE_TTL);

    await this.dedup.markAsProcessed(messageId);
    this.logger.log(
      `[ranking] Cache atualizado para desafio ${payload.challengeId} (${ranking.length} participantes)`,
    );
  }
}
