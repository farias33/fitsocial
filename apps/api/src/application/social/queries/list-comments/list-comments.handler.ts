import { Inject, Injectable } from '@nestjs/common';
import { ListCommentsQuery } from './list-comments.query';
import {
  ICommentRepository,
  COMMENT_REPOSITORY,
} from '@domain/social/repositories/i-comment.repository';
import { PaginatedResult } from '@shared/utils/pagination';

export interface CommentDto {
  id: string;
  userId: string;
  workoutId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ListCommentsHandler {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async handle(query: ListCommentsQuery): Promise<PaginatedResult<CommentDto>> {
    const { comments, total } = await this.commentRepository.findByWorkout(
      query.workoutId,
      { page: query.page, limit: query.limit },
    );

    return {
      data: comments.map((c) => ({
        id: c.id,
        userId: c.userId,
        workoutId: c.workoutId,
        body: c.body,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        hasNext: query.page * query.limit < total,
      },
    };
  }
}
