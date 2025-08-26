import { Router } from "express";
import { LookupController } from "../controllers/lookupController";

const router = Router();

router.post("/industries", LookupController.getIndustries);   
router.post("/segments", LookupController.getSegments);       
router.post("/brands", LookupController.getBrands);          

export default router;
