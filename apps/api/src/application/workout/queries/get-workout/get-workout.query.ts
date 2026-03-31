export class GetWorkoutQuery {
  constructor(
    public readonly workoutId: string,
    public readonly requesterId?: string,
  ) {}
}
