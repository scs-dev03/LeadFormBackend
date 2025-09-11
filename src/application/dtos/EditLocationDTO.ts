export interface EditLocationDTO {
  locationId: number;
  locationName?: string;
  locationTypeId?: number;      // Location_Type_Id
  businessTypeId?: number;      // Business_Type_Id
  auditId?: number | number[] | string;             // Audit_Id
  pincode?: string;
  city?: string;
  state?: string;
  remark?: string;
  stockFile?: string;
  partLine?: string;            // PartLine
  quantity?: number;
  value?: number;
  media?: string[];
}