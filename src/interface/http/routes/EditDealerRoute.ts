import express from "express";
import { DealerController } from "../controllers/EditDealerController";
import { upload } from "../../../infra/config/multer";

const router = express.Router();

router.put(
  "/editdetails",
  upload.fields([
    { name: "stockFile"}, 
    { name: "media"},     
  ]),
  DealerController.editDetails
);

// Dealer-level edit (brand, dealer name, business type, SP, stock)
router.put(
  "/edit-dealer",
  upload.single("stockFile"), // only stock file for dealer
  DealerController.editDealer
);

// Location-level edit (location details + stock + media)
router.put(
  "/edit-location",
  upload.fields([
    { name: "stockFile" },
    { name: "media" },
  ]),
  DealerController.editLocation
);

// Location contact edit
router.put(
  "/edit-location-contact",
  DealerController.bulkEditLocationContacts
);

export default router;
