import { IIndustryRepository } from "../../domain/repositories/IIndustryRepository";

export class IndustryService {
  constructor(private repo: IIndustryRepository) {}

  async getIndustries(filters: { segmentId?: number; brandId?: number }) {
    return this.repo.getIndustries(filters);
  }

  async getSegments(filters: { industryId?: number; brandId?: number }) {
    return this.repo.getSegments(filters);
  }

  async getBrands(filters: { industryId?: number; segmentId?: number }) {
    return this.repo.getBrands(filters);
  }
}
