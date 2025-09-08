import { Router } from "express";
import { UserRepositoryMSSQL } from "../../infra/db/mssql/UserRepositoryMSSQL";
import { UserService } from "../../application/services/UserService";

const router = Router();
const userService = new UserService(new UserRepositoryMSSQL());

router.post("/signup", async (req, res) => {
  try {
    const { name, phone,email,country_code } = req.body;
    const user = await userService.signup(name, phone,email,country_code);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone,country_code } = req.body;
    const user = await userService.login(phone,country_code);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
