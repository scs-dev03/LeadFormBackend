import express from "express";
import { DealerController } from "../controllers/dealerController";

const router = express.Router();

router.post("/create-d", DealerController.create);
// router.get("/getDealerDetails", DealerController.getAll);
// router.get("/getDealerDetails/:id", DealerController.getDetails);

// New POST route (userId in body)
router.post("/view", DealerController.getByUser);
router.post("/viewDealerByBrand", DealerController.viewDealerByBrand);

export default router;
