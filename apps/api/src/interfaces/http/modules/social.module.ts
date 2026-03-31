import { Module } from '@nestjs/common';
import { REACTION_REPOSITORY } from '@domain/social/repositories/i-reaction.repository';
import { COMMENT_REPOSITORY } from '@domain/social/repositories/i-comment.repository';
import { FEED_REPOSITORY } from '@domain/social/repositories/i-feed.repository';
import { PrismaReactionRepository } from '@infrastructure/persistence/social/prisma-reaction.repository';
import { PrismaCommentRepository } from '@infrastructure/persistence/social/prisma-comment.repository';
import { PrismaFeedRepository } from '@infrastructure/persistence/social/prisma-feed.repository';
import { ToggleReactionHandler } from '@application/social/commands/toggle-reaction/toggle-reaction.handler';
import { AddCommentHandler } from '@application/social/commands/add-comment/add-comment.handler';
import { DeleteCommentHandler } from '@application/social/commands/delete-comment/delete-comment.handler';
import { GetFeedHandler } from '@application/social/queries/get-feed/get-feed.handler';
import { ListReactionsHandler } from '@application/social/queries/list-reactions/list-reactions.handler';
import { ListCommentsHandler } from '@application/social/queries/list-comments/list-comments.handler';
import { SocialController } from '../controllers/social.controller';
import { IdentityModule } from './identity.module';

@Module({
  imports: [IdentityModule],
  controllers: [SocialController],
  providers: [
    { provide: REACTION_REPOSITORY, useClass: PrismaReactionRepository },
    { provide: COMMENT_REPOSITORY, useClass: PrismaCommentRepository },
    { provide: FEED_REPOSITORY, useClass: PrismaFeedRepository },
    ToggleReactionHandler,
    AddCommentHandler,
    DeleteCommentHandler,
    GetFeedHandler,
    ListReactionsHandler,
    ListCommentsHandler,
  ],
})
export class SocialModule {}
