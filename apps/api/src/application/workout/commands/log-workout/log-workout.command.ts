export class LogWorkoutCommand {
  constructor(
    public readonly userId: string,
    public readonly challengeId: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly points: number,
  ) {}
}
