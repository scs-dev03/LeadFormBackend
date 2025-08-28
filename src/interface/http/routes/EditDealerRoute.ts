import express from "express";
import { DealerController } from "../controllers/EditDealerController";
import { upload } from "../../../infra/config/multer"; // your multer-s3 setup

const router = express.Router();

// Use multer.fields() to handle multiple files
router.put(
  "/editdetails",
  upload.fields([
    { name: "stockFile"}, 
    { name: "media"},     
  ]),
  DealerController.editDetails
);

export default router;
