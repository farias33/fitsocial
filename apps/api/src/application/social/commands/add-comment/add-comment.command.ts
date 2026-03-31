export class AddCommentCommand {
  constructor(
    public readonly userId: string,
    public readonly workoutId: string,
    public readonly body: string,
  ) {}
}
