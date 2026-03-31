import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService, QUEUES } from '@infrastructure/messaging/rabbitmq.service';
import { MessageDeduplicationService } from '@infrastructure/messaging/message-deduplication.service';

interface WorkoutLoggedPayload {
  workoutId: string;
  userId: string;
  challengeId: string;
  points: number;
  occurredAt: string;
}

/**
 * Stub para MVP — estrutura pronta para integrar push/email na Fase 3.
 * Quando implementado de verdade, irá:
 *   - Buscar participantes do desafio
 *   - Filtrar preferências de notificação
 *   - Enviar push via FCM/APNs ou email via SES/SendGrid
 */
@Injectable()
export class NotificationWorker implements OnModuleInit {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly dedup: MessageDeduplicationService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitmq.consume<WorkoutLoggedPayload>(
      QUEUES.WORKOUT_NOTIFICATIONS,
      this.process.bind(this),
    );
  }

  private async process(payload: WorkoutLoggedPayload, msg: any): Promise<void> {
    const messageId = msg.properties.messageId as string;

    if (await this.dedup.isAlreadyProcessed(messageId)) {
      return;
    }

    // TODO (Fase 3): implementar envio de notificações push/email
    this.logger.log(
      `[notification] Treino ${payload.workoutId} registrado pelo usuário ${payload.userId} ` +
        `no desafio ${payload.challengeId} — notificações pendentes de implementação`,
    );

    await this.dedup.markAsProcessed(messageId);
  }
}
