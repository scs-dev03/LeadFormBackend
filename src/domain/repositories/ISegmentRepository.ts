import { Segment } from "../entities/Segment";

export interface ISegmentRepository {
  // Get segment by ID
  getById(id: number): Promise<Segment | null>;

  // Get brands under a segment
  getBrands(segmentId: number): Promise<{ BrandID: number; BrandName: string }[]>;

  // Get industry details for a segment
  getIndustry(segmentId: number): Promise<{ id: number; name: string } | null>;

  // Get segments optionally filtered by industryId or brandId
  getSegments(filters?: { industryId?: number; brandId?: number }): Promise<Segment[]>;
}
