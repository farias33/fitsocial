export class GetRankingQuery {
  constructor(
    public readonly challengeId: string,
    public readonly page: number = 1,
    public readonly limit: number = 50,
  ) {}
}
