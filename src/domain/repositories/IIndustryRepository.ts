import { Industry } from "../entities/Industry";

export interface IIndustryRepository {
  // Get all industries optionally filtered by segmentId or brandId
  getIndustries(filters?: { segmentId?: number; brandId?: number }): Promise<Industry[]>;

  // Get segments optionally filtered by industryId or brandId
  getSegments(filters?: { industryId?: number; brandId?: number }): Promise<{ SegmentID: number; SegmentName: string }[]>;

  // Get brands optionally filtered by industryId or segmentId
  getBrands(filters?: { industryId?: number; segmentId?: number }): Promise<{ BrandID: number; BrandName: string }[]>;
}
