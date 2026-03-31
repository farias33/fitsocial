import { Injectable } from '@nestjs/common';
import { RabbitMQService, EXCHANGES, ROUTING_KEYS } from '../rabbitmq.service';
import { randomUUID } from 'crypto';

export interface MediaUploadedPayload {
  workoutId: string;
  mediaId: string;
  s3Key: string;
  contentType: string;
}

@Injectable()
export class MediaEventProducer {
  constructor(private readonly rabbitmq: RabbitMQService) {}

  async publishMediaUploaded(payload: MediaUploadedPayload): Promise<void> {
    await this.rabbitmq.publish(
      EXCHANGES.MEDIA,
      ROUTING_KEYS.MEDIA_UPLOADED,
      { ...payload, occurredAt: new Date().toISOString() },
      randomUUID(),
    );
  }
}
