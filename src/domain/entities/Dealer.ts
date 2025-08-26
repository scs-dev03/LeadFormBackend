export interface Dealer {
  id: number;
  brandId: number;
  dealerName: string;
  businessTypeId: number;
  spokespersonName: string;
  spokespersonEmail: string;
  spokespersonPhone: string;
  stockFile?: string | null; 
  createdBy: number; 
}
