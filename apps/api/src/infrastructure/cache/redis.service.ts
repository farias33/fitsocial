import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis(this.config.getOrThrow<string>('REDIS_URL'));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  /** Sliding window rate limiter — retorna true se a requisição é permitida */
  async isRateLimited(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - windowMs;

    await this.client
      .multi()
      .zremrangebyscore(key, '-inf', windowStart)
      .zadd(key, now, `${now}-${Math.random()}`)
      .expire(key, Math.ceil(windowMs / 1000))
      .exec();

    const count = await this.client.zcard(key);
    return count > limit;
  }
}
