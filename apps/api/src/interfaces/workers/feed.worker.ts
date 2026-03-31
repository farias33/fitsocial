import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService, QUEUES } from '@infrastructure/messaging/rabbitmq.service';
import { MessageDeduplicationService } from '@infrastructure/messaging/message-deduplication.service';
import { RedisService } from '@infrastructure/cache/redis.service';

interface WorkoutLoggedPayload {
  workoutId: string;
  userId: string;
  challengeId: string;
  points: number;
  occurredAt: string;
}

/**
 * Invalida o cache de feed dos participantes do desafio quando um novo treino é registrado.
 * Para o MVP, o feed é gerado por query — este worker apenas invalida o cache da página 1.
 * Na Fase 3 pode ser expandido para popular uma tabela feed_items denormalizada.
 */
@Injectable()
export class FeedWorker implements OnModuleInit {
  private readonly logger = new Logger(FeedWorker.name);

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly dedup: MessageDeduplicationService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitmq.consume<WorkoutLoggedPayload>(
      QUEUES.WORKOUT_FEED,
      this.process.bind(this),
    );
  }

  private async process(payload: WorkoutLoggedPayload, msg: any): Promise<void> {
    const messageId = msg.properties.messageId as string;

    if (await this.dedup.isAlreadyProcessed(messageId)) {
      return;
    }

    // Invalida cache do feed do usuário que logou o treino
    // Em produção: buscar todos os participantes do desafio e invalidar os caches deles
    await this.redis.delete(`feed:${payload.userId}:p1`);

    await this.dedup.markAsProcessed(messageId);
    this.logger.log(
      `[feed] Cache invalidado para usuário ${payload.userId} após treino ${payload.workoutId}`,
    );
  }
}
