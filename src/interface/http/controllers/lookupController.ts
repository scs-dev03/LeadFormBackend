import { Request, Response } from "express";
import { IndustryRepositoryMSSQL } from "../../../infra/db/mssql/IndustryRepositoryMSSQL";
import { SegmentRepositoryMSSQL } from "../../../infra/db/mssql/SegmentRepositoryMSSQL";
import { BrandRepositoryMSSQL } from "../../../infra/db/mssql/BrandRepositoryMSSQL";
import { IndustryService } from "../../../application/services/IndustryService";
import { SegmentService } from "../../..//application/services/SegmentService";
import { BrandService } from "../../..//application/services/BrandService";

const industryService = new IndustryService(new IndustryRepositoryMSSQL());
const segmentService = new SegmentService(new SegmentRepositoryMSSQL());
const brandService = new BrandService(new BrandRepositoryMSSQL());

export class LookupController {
  static async getIndustries(req: Request, res: Response) {
    try {
      const { segmentId, brandId } = req.body;
      const industries = await industryService.getIndustries({ segmentId, brandId });
      res.status(200).json(industries);
    } catch (err: any) {
      res.status(500).json({ message: "Error fetching industries", error: err.message });
    }
  }

  static async getSegments(req: Request, res: Response) {
    try {
      const { industryId, brandId } = req.body;
      const segments = await segmentService.getSegments({ industryId, brandId });
      res.status(200).json(segments);
    } catch (err: any) {
      res.status(500).json({ message: "Error fetching segments", error: err.message });
    }
  }

  static async getBrands(req: Request, res: Response) {
    try {
      const { industryId, segmentId } = req.body;
      const brands = await brandService.getBrands({ industryId, segmentId });
      res.status(200).json(brands);
    } catch (err: any) {
      res.status(500).json({ message: "Error fetching brands", error: err.message });
    }
  }
}
