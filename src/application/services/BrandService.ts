import { IBrandRepository } from "../../domain/repositories/IBrandRepository";

export class BrandService {
  constructor(private repo: IBrandRepository) {}

  async getBrands(filters: { segmentId?: number; industryId?: number }) {
    return this.repo.getBrands(filters);
  }

  async getDetails(brandId: number) {
    return this.repo.getDetails(brandId);
  }
}
