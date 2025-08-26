export interface EditDealerDetailsDTO {
  dealerId: number;
  locationId: number;
  name?: string;
  email?: string;
  phone?: string;
  designation?: string;
  mediaUrl?: string;
  stockFile?: string;
}
