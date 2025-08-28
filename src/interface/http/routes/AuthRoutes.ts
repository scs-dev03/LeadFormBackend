import { Router } from "express";
import { signup, signin, updateUser } from "../controllers/authController";

const router = Router();

router.post("/signup", signup);    
router.post("/signin", signin);   
router.put("/update-user", updateUser);

export default router;
