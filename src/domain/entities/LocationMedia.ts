export class LocationMedia {
  constructor(
    public id: number | null,
    public locationId: number,
    public mediaUrl: string,
    public uploadedAt?: Date
  ) {}
}
