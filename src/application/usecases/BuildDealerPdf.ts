import { IDealerRepository } from "../../domain/repositories/IDealerRepository";
import { IPdfService } from "../../domain/repositories/IpdfService";

export class BuildDealerPdf {
  constructor(
    private repo: IDealerRepository,
    private pdf: IPdfService
  ) {}

  async execute(params: { userId: number; brandId: number; ip?: string }) {
    const data = await this.repo.getDealerByBrand(params.brandId, params.userId);
    if (!data) throw new Error("No dealer found for this brand and user");

    const { filename, buffer } = await this.pdf.buildDealerPdfBuffer(data, {
      ip: params.ip,
      generatedAt: new Date(),
    });

    return { filename, buffer };
  }
}
