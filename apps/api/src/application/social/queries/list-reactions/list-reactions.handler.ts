import { Inject, Injectable } from '@nestjs/common';
import { ListReactionsQuery } from './list-reactions.query';
import {
  IReactionRepository,
  REACTION_REPOSITORY,
  ReactionSummary,
} from '@domain/social/repositories/i-reaction.repository';

@Injectable()
export class ListReactionsHandler {
  constructor(
    @Inject(REACTION_REPOSITORY)
    private readonly reactionRepository: IReactionRepository,
  ) {}

  async handle(query: ListReactionsQuery): Promise<ReactionSummary[]> {
    return this.reactionRepository.summarizeByWorkout(query.workoutId, query.requesterId);
  }
}
