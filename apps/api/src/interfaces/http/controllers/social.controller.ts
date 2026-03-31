import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { JwtAuthGuard } from '../middlewares/jwt-auth.guard';
import { CurrentUser } from '../middlewares/current-user.decorator';
import type { AccessTokenPayload } from '@infrastructure/auth/jwt-token.service';

import { ToggleReactionHandler } from '@application/social/commands/toggle-reaction/toggle-reaction.handler';
import { ToggleReactionCommand } from '@application/social/commands/toggle-reaction/toggle-reaction.command';
import { AddCommentHandler } from '@application/social/commands/add-comment/add-comment.handler';
import { AddCommentCommand } from '@application/social/commands/add-comment/add-comment.command';
import { DeleteCommentHandler } from '@application/social/commands/delete-comment/delete-comment.handler';
import { DeleteCommentCommand } from '@application/social/commands/delete-comment/delete-comment.command';
import { GetFeedHandler } from '@application/social/queries/get-feed/get-feed.handler';
import { GetFeedQuery } from '@application/social/queries/get-feed/get-feed.query';
import { ListReactionsHandler } from '@application/social/queries/list-reactions/list-reactions.handler';
import { ListReactionsQuery } from '@application/social/queries/list-reactions/list-reactions.query';
import { ListCommentsHandler } from '@application/social/queries/list-comments/list-comments.handler';
import { ListCommentsQuery } from '@application/social/queries/list-comments/list-comments.query';
import { ALLOWED_EMOJIS } from '@domain/social/value-objects/reaction-emoji.vo';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

const ReactionSchema = z.object({
  emoji: z.enum(ALLOWED_EMOJIS),
});

const AddCommentSchema = z.object({
  body: z.string().min(1).max(500),
});

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

@Controller()
export class SocialController {
  constructor(
    private readonly toggleReactionHandler: ToggleReactionHandler,
    private readonly addCommentHandler: AddCommentHandler,
    private readonly deleteCommentHandler: DeleteCommentHandler,
    private readonly getFeedHandler: GetFeedHandler,
    private readonly listReactionsHandler: ListReactionsHandler,
    private readonly listCommentsHandler: ListCommentsHandler,
  ) {}

  // ── Feed ──────────────────────────────────────────────────────────────────

  /** GET /api/feed */
  @Get('feed')
  @UseGuards(JwtAuthGuard)
  async getFeed(
    @Query() query: unknown,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const dto = PaginationSchema.parse(query);
    return this.getFeedHandler.handle(new GetFeedQuery(user.sub, dto.page, dto.limit));
  }

  // ── Reactions ─────────────────────────────────────────────────────────────

  /** GET /api/workouts/:workoutId/reactions */
  @Get('workouts/:workoutId/reactions')
  @UseGuards(JwtAuthGuard)
  async listReactions(
    @Param('workoutId') workoutId: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const result = await this.listReactionsHandler.handle(
      new ListReactionsQuery(workoutId, user.sub),
    );
    return { data: result };
  }

  /** POST /api/workouts/:workoutId/reactions — toggle */
  @Post('workouts/:workoutId/reactions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async toggleReaction(
    @Param('workoutId') workoutId: string,
    @Body() body: unknown,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const dto = ReactionSchema.parse(body);
    const action = await this.toggleReactionHandler.handle(
      new ToggleReactionCommand(user.sub, workoutId, dto.emoji),
    );
    return { data: { action } };
  }

  // ── Comments ──────────────────────────────────────────────────────────────

  /** GET /api/workouts/:workoutId/comments */
  @Get('workouts/:workoutId/comments')
  @UseGuards(JwtAuthGuard)
  async listComments(
    @Param('workoutId') workoutId: string,
    @Query() query: unknown,
  ) {
    const dto = PaginationSchema.parse(query);
    return this.listCommentsHandler.handle(
      new ListCommentsQuery(workoutId, dto.page, dto.limit),
    );
  }

  /** POST /api/workouts/:workoutId/comments */
  @Post('workouts/:workoutId/comments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @Param('workoutId') workoutId: string,
    @Body() body: unknown,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const dto = AddCommentSchema.parse(body);
    const result = await this.addCommentHandler.handle(
      new AddCommentCommand(user.sub, workoutId, dto.body),
    );
    return { data: result };
  }

  /** DELETE /api/comments/:id */
  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id') id: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    await this.deleteCommentHandler.handle(new DeleteCommentCommand(id, user.sub));
  }
}
