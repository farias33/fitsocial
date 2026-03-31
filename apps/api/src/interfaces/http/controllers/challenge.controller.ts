import {
  Body,
  Controller,
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
import { CreateChallengeHandler } from '@application/challenge/commands/create-challenge/create-challenge.handler';
import { CreateChallengeCommand } from '@application/challenge/commands/create-challenge/create-challenge.command';
import { JoinChallengeHandler } from '@application/challenge/commands/join-challenge/join-challenge.handler';
import { JoinChallengeCommand } from '@application/challenge/commands/join-challenge/join-challenge.command';
import { GetChallengeHandler } from '@application/challenge/queries/get-challenge/get-challenge.handler';
import { GetChallengeQuery } from '@application/challenge/queries/get-challenge/get-challenge.query';
import { ListChallengesHandler } from '@application/challenge/queries/list-challenges/list-challenges.handler';
import { ListChallengesQuery } from '@application/challenge/queries/list-challenges/list-challenges.query';
import { GetRankingHandler } from '@application/challenge/queries/get-ranking/get-ranking.handler';
import { GetRankingQuery } from '@application/challenge/queries/get-ranking/get-ranking.query';
import { ChallengeStatus } from '@domain/challenge/entities/challenge.entity';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

const CreateChallengeSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).nullable().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

const ListChallengesSchema = z.object({
  status: z.nativeEnum(ChallengeStatus).optional(),
  mine: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

@Controller('challenges')
export class ChallengeController {
  constructor(
    private readonly createHandler: CreateChallengeHandler,
    private readonly joinHandler: JoinChallengeHandler,
    private readonly getHandler: GetChallengeHandler,
    private readonly listHandler: ListChallengesHandler,
    private readonly rankingHandler: GetRankingHandler,
  ) {}

  /** POST /api/challenges */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: unknown,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const dto = CreateChallengeSchema.parse(body);
    const result = await this.createHandler.handle(
      new CreateChallengeCommand(
        dto.name,
        dto.description ?? null,
        dto.startDate,
        dto.endDate,
        user.sub,
      ),
    );
    return { data: result };
  }

  /** GET /api/challenges */
  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @Query() query: unknown,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const dto = ListChallengesSchema.parse(query);
    return this.listHandler.handle(
      new ListChallengesQuery(
        dto.status,
        dto.mine ? user.sub : undefined,
        dto.page,
        dto.limit,
        user.sub,
      ),
    );
  }

  /** GET /api/challenges/:id */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(
    @Param('id') id: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const result = await this.getHandler.handle(new GetChallengeQuery(id, user.sub));
    return { data: result };
  }

  /** POST /api/challenges/:id/join */
  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async join(
    @Param('id') id: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    await this.joinHandler.handle(new JoinChallengeCommand(id, user.sub));
  }

  /** GET /api/challenges/:id/ranking */
  @Get(':id/ranking')
  @UseGuards(JwtAuthGuard)
  async ranking(
    @Param('id') id: string,
    @Query() query: unknown,
  ) {
    const dto = PaginationSchema.parse(query);
    return this.rankingHandler.handle(new GetRankingQuery(id, dto.page, dto.limit));
  }
}
