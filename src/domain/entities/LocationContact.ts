export class LocationContact {
  constructor(
    public id: number | null,
    public location: number,
    public designation: string,
    public name: string,
    public phone: string | null,
    public email: string | null,
    public createdAt: Date | null,
    public updatedAt: Date | null
  ) {}
}
