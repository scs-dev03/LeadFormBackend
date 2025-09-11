export interface LocationDetailsDTO {
  dealerId: number;
  locationName: string;
  locationTypeId: number;
 // auditId: number;
  auditId: number | number[] | string;
  pincode: string;
  city: string;
  state: string;
  stockFile?: string | null; 
  media?: string | null;      
  remark?: string | null;
  businessTypeId: number;
  partLine?: string | null;
  quantity?: number | null;
  value?: number | null;
}
