import { Injectable } from '@nestjs/common';
import { RedisService } from '../cache/redis.service';

const TTL_SECONDS = 24 * 60 * 60; // 24h — janela de deduplicação

/**
 * Garante idempotência dos consumers.
 * Usa o messageId do RabbitMQ como chave de deduplicação no Redis.
 */
@Injectable()
export class MessageDeduplicationService {
  constructor(private readonly redis: RedisService) {}

  async isAlreadyProcessed(messageId: string): Promise<boolean> {
    return this.redis.exists(`processed_msg:${messageId}`);
  }

  async markAsProcessed(messageId: string): Promise<void> {
    await this.redis.set(`processed_msg:${messageId}`, 1, TTL_SECONDS);
  }
}
