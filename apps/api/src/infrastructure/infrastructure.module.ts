import { Global, Module } from '@nestjs/common';
import { PrismaService } from './persistence/prisma.service';
import { RedisService } from './cache/redis.service';
import { RabbitMQService } from './messaging/rabbitmq.service';
import { MessageDeduplicationService } from './messaging/message-deduplication.service';
import { WorkoutEventProducer } from './messaging/producers/workout-event.producer';
import { MediaEventProducer } from './messaging/producers/media-event.producer';

@Global()
@Module({
  providers: [
    PrismaService,
    RedisService,
    RabbitMQService,
    MessageDeduplicationService,
    WorkoutEventProducer,
    MediaEventProducer,
  ],
  exports: [
    PrismaService,
    RedisService,
    RabbitMQService,
    MessageDeduplicationService,
    WorkoutEventProducer,
    MediaEventProducer,
  ],
})
export class InfrastructureModule {}
