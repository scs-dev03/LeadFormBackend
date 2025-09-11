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

      const body: EditDealerDetailsDTO = {
        dealerId: Number(req.body.dealerId),
        locationId: Number(req.body.locationId),
        businessTypeID: Number(req.body.businessTypeId),
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
      //console.error("Edit failed:", err);
      res.status(err.statusCode || 500).json({
        error: err.message || "Failed to update dealer details",
      });
    }
  }
  static async editDealer(req: Request, res: Response) {
    try {
      console.log("FormData body:", req.body);
      console.log("Uploaded file:", req.file);
      const file = req.file as S3File | undefined;
      const bucketUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

      await dealerService.editDealer({
        dealerId: Number(req.body.dealerId),
        brandId: req.body.brandId ? Number(req.body.brandId) : undefined,
        dealerName: req.body.dealerName,
        businessTypeID: req.body.businessTypeID
          ? Number(req.body.businessTypeID)
          : req.body.businessType
            ? Number(req.body.businessType)
            : undefined,
        spokespersonName: req.body.spokespersonName,
        country_code: req.body.country_code,
        spokespersonPhone: req.body.spokespersonPhone,
        spokespersonEmail: req.body.spokespersonEmail,
        stockFile: file ? bucketUrl + file.key : undefined,
      });

      res.json({ message: "Dealer details updated successfully" });
    } catch (err: any) {
      //console.error(err);
      res.status(500).json({ error: "Failed to update dealer details" });
    }
  }

  // 2. Location edit
  static async editLocation(req: Request, res: Response) {
    try {
      console.log("FormData body:", req.body);
      console.log("Uploaded files:", req.files);
      const files = req.files as any;
      const bucketUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
      const stockFile = files?.stockFile ? bucketUrl + files.stockFile[0].key : undefined;
      const media = files?.media ? files.media.map((f: any) => bucketUrl + f.key) : undefined;

      await dealerService.editLocation({
        locationId: Number(req.body.locationId),
        locationName: req.body.locationName,
        locationTypeId: req.body.locationTypeId,
        businessTypeId: req.body.businessTypeId,
        auditId: req.body.auditId,
        pincode: req.body.pincode,
        city: req.body.city,
        state: req.body.state,
        remark: req.body.remark,
        partLine: req.body.partline,
        quantity: req.body.quantity,
        value: req.body.value,
        stockFile,
        media
      });

      res.json({ message: "Location details updated successfully" });
    } catch (err: any) {
      // console.error(err);
      res.status(500).json({ error: "Failed to update location details" });
    }
  }

  // 3. Location contact edit
  static async editLocationContact(req: Request, res: Response) {
    try {
      console.log("FormData body:", req.body);
      await dealerService.editContact({
        locationId: Number(req.body.locationId),
        name: req.body.name,
        country_code: req.body.country_code,
        phone: req.body.phone,
        email: req.body.email,
        designation: req.body.designation
      });

      res.json({ message: "Location contact updated successfully" });
    } catch (err: any) {
      //console.error(err);
      res.status(500).json({ error: "Failed to update contact details" });
    }
  }

  static async bulkEditLocationContacts(req: Request, res: Response) {
    try {
      // Map incoming payload to the expected format
      console.log("Bulk edit contacts body:", req.body);
      const contacts = (req.body as any[]).map(contact => ({
        locationId: contact.location,
        name: contact.name,
        phone: contact.phone,
        country_code: contact.country_code || contact.Country_Code, 
        email: contact.email,
        designation: contact.designation
      }));

      await dealerService.bulkEditContacts(contacts);
      console.log("Bulk contacts updated:", contacts);
      res.json({ message: "Bulk location contacts updated successfully" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to bulk update contact details" });
    }
  }

}
