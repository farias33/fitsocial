export class ListCommentsQuery {
  constructor(
    public readonly workoutId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
