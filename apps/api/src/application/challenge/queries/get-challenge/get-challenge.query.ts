export class GetChallengeQuery {
  constructor(
    public readonly challengeId: string,
    public readonly requesterId?: string,
  ) {}
}
