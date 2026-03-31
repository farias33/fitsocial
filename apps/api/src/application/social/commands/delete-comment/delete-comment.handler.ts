import { Inject, Injectable } from '@nestjs/common';
import { DeleteCommentCommand } from './delete-comment.command';
import {
  ICommentRepository,
  COMMENT_REPOSITORY,
} from '@domain/social/repositories/i-comment.repository';
import { CommentNotFoundException } from '@domain/social/errors/social.errors';

@Injectable()
export class DeleteCommentHandler {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async handle(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentRepository.findById(command.commentId);
    if (!comment) throw new CommentNotFoundException(command.commentId);

    comment.assertOwnership(command.requesterId);

    await this.commentRepository.delete(command.commentId);
  }
}
