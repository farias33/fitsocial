import { Injectable } from '@nestjs/common';
import { RabbitMQService, EXCHANGES, ROUTING_KEYS } from '../rabbitmq.service';
import { WorkoutLoggedEvent } from '@domain/workout/events/workout-logged.event';

@Injectable()
export class WorkoutEventProducer {
  constructor(private readonly rabbitmq: RabbitMQService) {}

  async publishWorkoutLogged(event: WorkoutLoggedEvent): Promise<void> {
    await this.rabbitmq.publish(
      EXCHANGES.WORKOUT,
      ROUTING_KEYS.WORKOUT_LOGGED,
      {
        workoutId: event.workoutId,
        userId: event.userId,
        challengeId: event.challengeId,
        points: event.points,
        occurredAt: event.occurredAt.toISOString(),
      },
      event.id, // messageId para deduplicação
    );
  }
}
