export class LocationDetails {
  constructor(
    public id: number | null,
    public dealerId: number,
    public locationName: string,
    public locationTypeId: number,
    public auditId: number,
    public pincode: string,
    public city: string,
    public state: string,
    public stockFile: string | null,   
    public media: string | null,      
    public remark: string | null,
    public businessTypeId: number,
    public partLine: string | null,
    public quantity: number | null,
    public value: number | null
  ) {}
}
