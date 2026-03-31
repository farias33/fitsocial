import { Inject, Injectable } from '@nestjs/common';
import { ToggleReactionCommand } from './toggle-reaction.command';
import {
  IReactionRepository,
  REACTION_REPOSITORY,
} from '@domain/social/repositories/i-reaction.repository';
import { Reaction } from '@domain/social/entities/reaction.entity';
import { ReactionEmoji } from '@domain/social/value-objects/reaction-emoji.vo';

export type ToggleReactionResult = 'added' | 'removed' | 'changed';

@Injectable()
export class ToggleReactionHandler {
  constructor(
    @Inject(REACTION_REPOSITORY)
    private readonly reactionRepository: IReactionRepository,
  ) {}

  async handle(command: ToggleReactionCommand): Promise<ToggleReactionResult> {
    const emoji = ReactionEmoji.create(command.emoji);
    const existing = await this.reactionRepository.findByUserAndWorkout(
      command.userId,
      command.workoutId,
    );

    // Mesmo emoji → remove (toggle off)
    if (existing && existing.emoji.equals(emoji)) {
      await this.reactionRepository.delete(existing.id);
      return 'removed';
    }

    // Emoji diferente → substitui
    if (existing) {
      await this.reactionRepository.delete(existing.id);
    }

    const reaction = Reaction.create(command.userId, command.workoutId, emoji);
    await this.reactionRepository.save(reaction);

    // TODO: publicar ReactionAddedEvent → notificar dono do treino

    return existing ? 'changed' : 'added';
  }
}
