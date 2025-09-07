import { DealerApiResponse } from "../entities/Mail";

export interface BuildPdfMeta {
  ip?: string;
  generatedAt?: Date;
}

export interface IPdfService {
  buildDealerPdfBuffer(
    data: DealerApiResponse,
    meta?: BuildPdfMeta
  ): Promise<{ filename: string; buffer: Buffer }>;
}
