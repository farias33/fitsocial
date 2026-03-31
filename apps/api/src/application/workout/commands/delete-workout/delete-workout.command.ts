export class DeleteWorkoutCommand {
  constructor(
    public readonly workoutId: string,
    public readonly requesterId: string,
  ) {}
}
