export class ToggleReactionCommand {
  constructor(
    public readonly userId: string,
    public readonly workoutId: string,
    public readonly emoji: string,
  ) {}
}
