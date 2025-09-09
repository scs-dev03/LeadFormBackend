import { IDealerRepository } from "../../domain/repositories/IDealerRepository";
import { IPdfService } from "../../domain/repositories/IpdfService";

export class BuildDealerPdf {
  constructor(
    private repo: IDealerRepository,
    private pdf: IPdfService
  ) {}

  async execute(params: { userId: number;dealerId:number, brandId: number; ip?: string }) {
    const data = await this.repo.getDealerByBrand(params.brandId,params.dealerId,params.userId);
    //if (!data) throw new Error("No dealer found for this brand and user");

    if (!data) {
    console.warn(
      `No dealer found for userId=${params.userId}, dealerId=${params.dealerId}, brandId=${params.brandId}`
    );
    return null; // 👈 instead of throwing
  }

    const { filename, buffer } = await this.pdf.buildDealerPdfBuffer(data, {
      ip: params.ip,
      generatedAt: new Date(),
    });

    return { filename, buffer };
  }
}
