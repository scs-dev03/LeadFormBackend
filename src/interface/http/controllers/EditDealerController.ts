import { Request, Response } from "express";
import { DealerService } from "../../../application/services/DealerService";
import { EditDealerDetailsDTO } from "../../../application/dtos/EditDealerDetailsDTO";

const dealerService = new DealerService();

// Define S3 file type for multer-s3
interface S3File extends Express.Multer.File {
  key: string; // S3 object key
}

export class DealerController {
  static async editDetails(req: Request, res: Response): Promise<void> {
    try {
      console.log("FormData body:", req.body);
      console.log("Uploaded files:", req.files);

      // Type files as S3File[]
      const files = req.files as { [fieldname: string]: S3File[] } | undefined;

      // Base S3 URL
      const bucketUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

      // Map files to DTO with full URLs
      const body: EditDealerDetailsDTO = {
        dealerId: Number(req.body.dealerId),
        locationId: Number(req.body.locationId),
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        designation: req.body.designation,
        stockFile: files?.stockFile ? bucketUrl + files.stockFile[0].key : undefined,
        mediaUrl: files?.media ? files.media.map(f => bucketUrl + f.key).join(",") : req.body.mediaUrl,
      };

      // Validate required fields
      if (!body.dealerId || !body.locationId) {
        res.status(400).json({ error: "dealerId and locationId are required" });
        return;
      }

      // Call service to update DB
      await dealerService.editDealerDetails(body);

      res.json({ message: "Dealer details updated successfully" });
    } catch (err: any) {
      console.error("Edit failed:", err);
      res.status(err.statusCode || 500).json({
        error: err.message || "Failed to update dealer details",
      });
    }
  }
}
