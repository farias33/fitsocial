import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

// ─── Topologia de exchanges e filas ──────────────────────────────────────────

export const EXCHANGES = {
  WORKOUT: 'workout.exchange',
  MEDIA: 'media.exchange',
  DEAD_LETTER: 'dead.letter.exchange',
} as const;

export const ROUTING_KEYS = {
  WORKOUT_LOGGED: 'workout.logged',
  MEDIA_UPLOADED: 'media.uploaded',
} as const;

export const QUEUES = {
  WORKOUT_RANKING: 'workout.ranking',
  WORKOUT_FEED: 'workout.feed',
  WORKOUT_NOTIFICATIONS: 'workout.notifications',
  MEDIA_PROCESSING: 'media.processing',
  // DLQs
  WORKOUT_RANKING_DLQ: 'workout.ranking.dlq',
  WORKOUT_FEED_DLQ: 'workout.feed.dlq',
  WORKOUT_NOTIFICATIONS_DLQ: 'workout.notifications.dlq',
  MEDIA_PROCESSING_DLQ: 'media.processing.dlq',
} as const;

const MAX_RETRIES = 3;

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
    await this.setupTopology();
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  // ─── Conexão ───────────────────────────────────────────────────────────────

  private async connect(): Promise<void> {
    const url = this.config.getOrThrow<string>('RABBITMQ_URL');
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    this.logger.log('RabbitMQ conectado');
  }

  // ─── Topologia ─────────────────────────────────────────────────────────────

  private async setupTopology(): Promise<void> {
    const ch = this.assertChannel();

    // Exchanges
    await ch.assertExchange(EXCHANGES.WORKOUT, 'topic', { durable: true });
    await ch.assertExchange(EXCHANGES.MEDIA, 'topic', { durable: true });
    await ch.assertExchange(EXCHANGES.DEAD_LETTER, 'direct', { durable: true });

    // Filas com DLQ configurada
    const queuesWithDlq: Array<[string, string]> = [
      [QUEUES.WORKOUT_RANKING, QUEUES.WORKOUT_RANKING_DLQ],
      [QUEUES.WORKOUT_FEED, QUEUES.WORKOUT_FEED_DLQ],
      [QUEUES.WORKOUT_NOTIFICATIONS, QUEUES.WORKOUT_NOTIFICATIONS_DLQ],
      [QUEUES.MEDIA_PROCESSING, QUEUES.MEDIA_PROCESSING_DLQ],
    ];

    for (const [queue, dlq] of queuesWithDlq) {
      // Fila principal com dead-letter routing
      await ch.assertQueue(queue, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': EXCHANGES.DEAD_LETTER,
          'x-dead-letter-routing-key': dlq,
          'x-message-ttl': 30_000, // 30s entre retries
        },
      });
      // DLQ (sem dead-letter — mensagens aqui ficam para análise manual)
      await ch.assertQueue(dlq, { durable: true });
      await ch.bindQueue(dlq, EXCHANGES.DEAD_LETTER, dlq);
    }

    // Bindings: workout.logged → 3 filas
    await ch.bindQueue(QUEUES.WORKOUT_RANKING, EXCHANGES.WORKOUT, ROUTING_KEYS.WORKOUT_LOGGED);
    await ch.bindQueue(QUEUES.WORKOUT_FEED, EXCHANGES.WORKOUT, ROUTING_KEYS.WORKOUT_LOGGED);
    await ch.bindQueue(QUEUES.WORKOUT_NOTIFICATIONS, EXCHANGES.WORKOUT, ROUTING_KEYS.WORKOUT_LOGGED);

    // Binding: media.uploaded → media.processing
    await ch.bindQueue(QUEUES.MEDIA_PROCESSING, EXCHANGES.MEDIA, ROUTING_KEYS.MEDIA_UPLOADED);

    this.logger.log('Topologia RabbitMQ configurada');
  }

  // ─── Produção ──────────────────────────────────────────────────────────────

  async publish(
    exchange: string,
    routingKey: string,
    payload: object,
    messageId: string,
  ): Promise<void> {
    const ch = this.assertChannel();
    ch.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      {
        persistent: true,       // sobrevive restart do broker
        messageId,
        contentType: 'application/json',
        timestamp: Date.now(),
      },
    );
  }

  // ─── Consumo ───────────────────────────────────────────────────────────────

  async consume<T>(
    queue: string,
    handler: (payload: T, msg: amqp.Message) => Promise<void>,
  ): Promise<void> {
    const ch = this.assertChannel();

    // Prefetch 1 — não recebe próxima mensagem antes de ack/nack
    await ch.prefetch(1);

    await ch.consume(queue, async (msg) => {
      if (!msg) return;

      const retryCount = this.getRetryCount(msg);
      let payload: T;

      try {
        payload = JSON.parse(msg.content.toString()) as T;
      } catch {
        this.logger.error(`[${queue}] Payload inválido — enviando para DLQ`);
        ch.nack(msg, false, false); // false, false → não requeue → vai para DLQ
        return;
      }

      try {
        await handler(payload, msg);
        ch.ack(msg);
      } catch (err) {
        this.logger.warn(
          `[${queue}] Falha no processamento (tentativa ${retryCount + 1}/${MAX_RETRIES}): ${(err as Error).message}`,
        );

        if (retryCount >= MAX_RETRIES - 1) {
          this.logger.error(`[${queue}] Máximo de retries atingido — enviando para DLQ`);
          ch.nack(msg, false, false); // → DLQ
        } else {
          ch.nack(msg, false, true); // requeue para retry
        }
      }
    });

    this.logger.log(`Consumer registrado na fila: ${queue}`);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private assertChannel(): amqp.Channel {
    if (!this.channel) throw new Error('RabbitMQ channel não inicializado');
    return this.channel;
  }

  private getRetryCount(msg: amqp.Message): number {
    const deaths = msg.properties.headers?.['x-death'] as Array<{ count: number }> | undefined;
    return deaths?.[0]?.count ?? 0;
  }
}
