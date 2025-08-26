import express from "express";
import { AuditCategoryService } from "../../../application/services/AuditCategoryService";
import { BusinessTypeService } from "../../../application/services/BusinessTypeService";
import { LocationTypeService } from "../../../application/services/LocationTypeService";

const router = express.Router();

const auditSvc = new AuditCategoryService();
const businessSvc = new BusinessTypeService();
const locationSvc = new LocationTypeService();

router.get("/audit-categories", async (_req, res) => {
  try {
    const rows = await auditSvc.getAll();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch audit categories" });
  }
});

router.get("/business-types", async (_req, res) => {
  try {
    const rows = await businessSvc.getAll();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch business types" });
  }
});

router.get("/location-types", async (_req, res) => {
  try {
    const rows = await locationSvc.getAll();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch location types" });
  }
});

router.get("/location-types/:businessTypeId", async (req, res) => {
  try {
    const id = Number(req.params.businessTypeId);
    if (Number.isNaN(id)) return res.status(400).json({ error: "businessTypeId must be a number" });
    const rows = await locationSvc.getByBusinessTypeId(id);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch location types for business type" });
  }
});

export default router;
