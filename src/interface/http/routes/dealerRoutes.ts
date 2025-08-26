// dealerRoutes.ts
import express from "express";
import { DealerController } from "../controllers/dealerController";

const router = express.Router();

router.post("/dealerCreate", DealerController.create);
router.get("/dealerDetails", DealerController.getAll);
router.get("/dealerDetails/:id", DealerController.getDetails);

// New POST route (userId in body)
router.post("/dealersByUser", DealerController.getByUser);

export default router;
