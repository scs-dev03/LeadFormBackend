import { ISegmentRepository } from "../../domain/repositories/ISegmentRepository";

export class SegmentService {
  constructor(private repo: ISegmentRepository) {}

  async getSegments(filters: { industryId?: number; brandId?: number }) {
    return this.repo.getSegments(filters);
  }

  async getIndustry(segmentId: number) {
    return this.repo.getIndustry(segmentId);
  }

  async getBrands(segmentId: number) {
    return this.repo.getBrands(segmentId);
  }
}
