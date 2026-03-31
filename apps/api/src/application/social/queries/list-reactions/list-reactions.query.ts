export class ListReactionsQuery {
  constructor(
    public readonly workoutId: string,
    public readonly requesterId?: string,
  ) {}
}
