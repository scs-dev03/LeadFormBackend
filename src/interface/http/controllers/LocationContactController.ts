import { Request, Response } from "express";
import { LocationContactRepositoryMSSQL } from "../../../infra/db/mssql/LocationContactRepositoryMSSQL";
import { LocationContactService } from "../../../application/services/LocationContactService";

const repo = new LocationContactRepositoryMSSQL();
const service = new LocationContactService(repo);

export class LocationContactController {
  static async create(req: Request, res: Response) {
    try {
      if (!Array.isArray(req.body)) {
        return res.status(400).json({ error: "contacts must be an array" });
      }

      const result = await service.createContacts(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      //console.error(err);
      res.status(err.statusCode || 500).json({ error: err.message || "Failed to create contacts" });
    }
  }
}
