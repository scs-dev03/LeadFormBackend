import express from "express";
import { DealerMailController } from "../controllers/DealerMailController";

const router = express.Router();
router.post("/send-onboarding-mail", DealerMailController.sendOnboardingMail);

export default router;
