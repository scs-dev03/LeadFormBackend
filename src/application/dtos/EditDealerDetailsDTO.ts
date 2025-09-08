export interface EditDealerDetailsDTO {
  dealerId: number;
  locationId: number;
  name?: string;
  email?: string;
  country_code?:string;
  phone?: string;
  designation?: string;
  mediaUrl?: string;
  stockFile?: string;
}
