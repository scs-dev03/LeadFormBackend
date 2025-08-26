import { Router } from "express";
import { LocationDetailsController } from "../controllers/LocationDetailsController";

const router = Router();
router.post("/locations", LocationDetailsController.create);
export default router;
