import { Comment } from '../entities/comment.entity';

export interface ICommentRepository {
  findById(id: string): Promise<Comment | null>;
  findByWorkout(
    workoutId: string,
    options: { page: number; limit: number },
  ): Promise<{ comments: Comment[]; total: number }>;
  save(comment: Comment): Promise<void>;
  delete(id: string): Promise<void>;
}

export const COMMENT_REPOSITORY = Symbol('ICommentRepository');
