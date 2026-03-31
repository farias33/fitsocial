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
import { LogWorkoutHandler } from '@application/workout/commands/log-workout/log-workout.handler';
import { LogWorkoutCommand } from '@application/workout/commands/log-workout/log-workout.command';
import { DeleteWorkoutHandler } from '@application/workout/commands/delete-workout/delete-workout.handler';
import { DeleteWorkoutCommand } from '@application/workout/commands/delete-workout/delete-workout.command';
import { RequestMediaUploadHandler } from '@application/workout/commands/request-media-upload/request-media-upload.handler';
import { RequestMediaUploadCommand } from '@application/workout/commands/request-media-upload/request-media-upload.command';
import { GetWorkoutHandler } from '@application/workout/queries/get-workout/get-workout.handler';
import { GetWorkoutQuery } from '@application/workout/queries/get-workout/get-workout.query';
import { ListWorkoutsHandler } from '@application/workout/queries/list-workouts/list-workouts.handler';
import { ListWorkoutsQuery } from '@application/workout/queries/list-workouts/list-workouts.query';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

const LogWorkoutSchema = z.object({
  challengeId: z.string().uuid(),
  title: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  points: z.number().int().min(1).max(10).default(1),
});

const RequestUploadSchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
});

const ListWorkoutsSchema = z.object({
  challengeId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

@Controller('workouts')
export class WorkoutController {
  constructor(
    private readonly logHandler: LogWorkoutHandler,
    private readonly deleteHandler: DeleteWorkoutHandler,
    private readonly uploadHandler: RequestMediaUploadHandler,
    private readonly getHandler: GetWorkoutHandler,
    private readonly listHandler: ListWorkoutsHandler,
  ) {}

  /** POST /api/workouts */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async log(
    @Body() body: unknown,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const dto = LogWorkoutSchema.parse(body);
    const result = await this.logHandler.handle(
      new LogWorkoutCommand(
        user.sub,
        dto.challengeId,
        dto.title,
        dto.description ?? null,
        dto.points,
      ),
    );
    return { data: result };
  }

  /** GET /api/workouts */
  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @Query() query: unknown,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const dto = ListWorkoutsSchema.parse(query);
    return this.listHandler.handle(
      new ListWorkoutsQuery(dto.challengeId, dto.userId, dto.page, dto.limit, user.sub),
    );
  }

  /** GET /api/workouts/:id */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(
    @Param('id') id: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const result = await this.getHandler.handle(new GetWorkoutQuery(id, user.sub));
    return { data: result };
  }

  /** DELETE /api/workouts/:id */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    await this.deleteHandler.handle(new DeleteWorkoutCommand(id, user.sub));
  }

  /** POST /api/workouts/:id/media/upload-url
   *  Fluxo: cliente solicita presigned URL → faz PUT direto no S3/MinIO → worker processa
   */
  @Post(':id/media/upload-url')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async requestUpload(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const dto = RequestUploadSchema.parse(body);
    const result = await this.uploadHandler.handle(
      new RequestMediaUploadCommand(id, user.sub, dto.contentType),
    );
    return { data: result };
  }
}
