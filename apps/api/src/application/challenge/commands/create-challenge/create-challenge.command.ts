export class CreateChallengeCommand {
  constructor(
    public readonly name: string,
    public readonly description: string | null,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly createdById: string,
  ) {}
}
