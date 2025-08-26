import { Request, Response } from "express";
import { DealerRepositoryMSSQL } from "../../../infra/db/mssql/DealerRepositoryMSSQL";
import { upload } from "../../../infra/config/multer";
import { GetDealersByUser } from "../../../application/services/GetDealersByUser";

const dealerRepo = new DealerRepositoryMSSQL();

export class DealerController {
   static create = [
    upload.single("stockFile"),
    async (req: Request, res: Response) => {
        try {
            const dealerData = req.body;
            if (req.file && (req.file as any).location) {
                dealerData.stockFile = (req.file as any).location;
            }

            const result = await dealerRepo.create(dealerData);
            res.status(201).json({ message: "Dealer created", dealerID: result.id });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ error: err.message || "Failed to create dealer" });
        }
    }
];
    // Get all dealers (optionally filter by brandId / businessTypeId)
    static async getAll(req: Request, res: Response) {
        try {
            const filters = {
                brandId: req.query.brandId ? Number(req.query.brandId) : undefined,
                businessTypeId: req.query.businessTypeId ? Number(req.query.businessTypeId) : undefined
            };
            const dealers = await dealerRepo.getDealers(filters);
            res.status(200).json(dealers);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch dealers" });
        }
    }

    // Get dealer details by ID
    static async getDetails(req: Request, res: Response) {
        try {
            const dealerId = Number(req.params.id);
            const dealerDetails = await dealerRepo.getDetails(dealerId);
            if (!dealerDetails) return res.status(404).json({ error: "Dealer not found" });
            res.status(200).json(dealerDetails);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch dealer details" });
        }
    }
    // DealerController.ts
    static async getByUser(req: Request, res: Response) {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ error: "userId is required in body" });
            }

            const usecase = new GetDealersByUser(dealerRepo);
            const dealers = await usecase.execute(userId);

            res.status(200).json(dealers);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch dealers by user" });
        }
    }
}
