import { Inject, Injectable } from '@nestjs/common';
import { AddCommentCommand } from './add-comment.command';
import {
  ICommentRepository,
  COMMENT_REPOSITORY,
} from '@domain/social/repositories/i-comment.repository';
import { Comment } from '@domain/social/entities/comment.entity';

export interface AddCommentResult {
  commentId: string;
}

@Injectable()
export class AddCommentHandler {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async handle(command: AddCommentCommand): Promise<AddCommentResult> {
    const comment = Comment.create(command.userId, command.workoutId, command.body);
    await this.commentRepository.save(comment);

    // TODO: publicar CommentAddedEvent → notificar dono do treino

    return { commentId: comment.id };
  }
}
