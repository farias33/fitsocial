import { Inject, Injectable } from '@nestjs/common';
import { GetFeedQuery } from './get-feed.query';
import {
  IFeedRepository,
  FEED_REPOSITORY,
  FeedWorkout,
} from '@domain/social/repositories/i-feed.repository';
import { PaginatedResult } from '@shared/utils/pagination';

@Injectable()
export class GetFeedHandler {
  constructor(
    @Inject(FEED_REPOSITORY)
    private readonly feedRepository: IFeedRepository,
  ) {}

  async handle(query: GetFeedQuery): Promise<PaginatedResult<FeedWorkout>> {
    const { items, total } = await this.feedRepository.getFeed(query.userId, {
      page: query.page,
      limit: query.limit,
    });

    return {
      data: items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        hasNext: query.page * query.limit < total,
      },
    };
  }
}
