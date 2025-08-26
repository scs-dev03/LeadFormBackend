import { Request, Response } from "express";
import { LocationDetailsService } from "../../../application/services/LocationDetailsService";
import { LocationDetailsRepositoryMSSQL } from "../../../infra/db/mssql/LocationDetailsRepositoryMSSQL";
import { upload } from "../../../infra/config/multer";
import { S3Client } from "@aws-sdk/client-s3";

const repo = new LocationDetailsRepositoryMSSQL();
const service = new LocationDetailsService(repo);

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export class LocationDetailsController {
  static create = [
    upload.fields([
      { name: "stockFile", maxCount: 1 },
      { name: "media", maxCount: 10 },
    ]),
    async (req: Request, res: Response) => {
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Store stockFile URL
        let stockFile: string | null = null;
        if (files?.stockFile?.[0]) {
          stockFile = (files.stockFile[0] as any).location;
        }

        // Store media URLs
        const mediaUrls: string[] = [];
        if (files?.media) {
          for (const file of files.media) {
            const key = (file as any).key;
            const mediaUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
            mediaUrls.push(mediaUrl);
          }
        }

        const totalMediaSize = (files?.media || []).reduce((sum, f) => sum + f.size, 0);

        const data = {
          ...req.body,
          stockFile,
          mediaUrls,
          totalMediaSize,
        };

        const result = await service.createLocationDetails(data);
        res.status(201).json(result);
      } catch (err: any) {
        console.error(err);
        res.status(err.statusCode || 500).json({
          error: err.message || "Failed to create location details",
        });
      }
    },
  ];
}
