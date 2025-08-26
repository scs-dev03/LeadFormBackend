import { Brand } from "../entities/Brand";

export interface IBrandRepository {
  // Get all brands optionally filtered by segmentId or industryId
  getBrands(filters?: { segmentId?: number; industryId?: number }): Promise<{ id: number; name: string }[]>;

  // Get detailed brand info by brandId
  getDetails(brandId: number): Promise<{
    brand: { id: number; name: string };
    segment: { id: number; name: string };
    industry: { id: number; name: string };
  } | null>;
}
