export interface EditDealerDTO {
  dealerId: number;
  brandId?: number;
  businessTypeID?: number;
  dealerName?: string;
  spokespersonName?: string;
  country_code?:string;
  spokespersonPhone?: string;
  spokespersonEmail?: string;
  stockFile?: string;
}
