import { Router } from "express";

import authRoutes from "../routes/AuthRoutes";
import lookupRoutes from "../routes/lookupRoutes";
import dealerRoutes from "../routes/dealerRoutes";
import locationRoutes from "../routes/locationRoutes";
import auditLookupRoutes from "../routes/lookup.routes";
import contactRoutes from "../routes/contactRoutes";
import EditDealerRoute from "../routes/EditDealerRoute";

const router = Router();

router.use("/", authRoutes);                           // Auth routes
router.use("/v1/aud", auditLookupRoutes);              // Audit lookups
router.use("/v1/aud", lookupRoutes);                   // Brand, industry, other lookups
router.use("/v1/aud", dealerRoutes);                   // Dealer routes
router.use("/v1/aud", locationRoutes);                 // Location details
router.use("/v1/aud", contactRoutes);                  // Contact
router.use("/v1/aud", EditDealerRoute);                // Edit dealer

export default router;
