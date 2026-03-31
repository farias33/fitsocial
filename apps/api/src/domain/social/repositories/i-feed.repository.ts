export interface FeedWorkout {
  workoutId: string;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  challengeId: string;
  challengeName: string;
  title: string;
  description: string | null;
  points: number;
  thumbnailUrl: string | null;
  reactionCount: number;
  commentCount: number;
  createdAt: string;
}

export interface IFeedRepository {
  getFeed(
    userId: string,
    options: { page: number; limit: number },
  ): Promise<{ items: FeedWorkout[]; total: number }>;
}

export const FEED_REPOSITORY = Symbol('IFeedRepository');
