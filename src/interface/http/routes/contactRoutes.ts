import { Router } from "express";
import { LocationContactController } from "../controllers/LocationContactController";

const router = Router();

router.post("/contacts", LocationContactController.create);

export default router;
