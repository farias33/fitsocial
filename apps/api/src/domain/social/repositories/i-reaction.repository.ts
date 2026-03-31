import { Reaction } from '../entities/reaction.entity';

export interface ReactionSummary {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

export interface IReactionRepository {
  findByUserAndWorkout(userId: string, workoutId: string): Promise<Reaction | null>;
  summarizeByWorkout(workoutId: string, requesterId?: string): Promise<ReactionSummary[]>;
  save(reaction: Reaction): Promise<void>;
  delete(id: string): Promise<void>;
}

export const REACTION_REPOSITORY = Symbol('IReactionRepository');
