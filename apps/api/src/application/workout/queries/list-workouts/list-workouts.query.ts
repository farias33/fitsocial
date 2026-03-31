export class ListWorkoutsQuery {
  constructor(
    public readonly challengeId: string,
    public readonly userId?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly requesterId?: string,
  ) {}
}
