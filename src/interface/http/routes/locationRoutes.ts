import { Router } from "express";
import { LocationDetailsController } from "../controllers/LocationDetailsController";

const router = Router();
router.post("/create-l", LocationDetailsController.create);
export default router;
