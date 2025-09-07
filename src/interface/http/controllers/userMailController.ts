import { Request, Response } from "express";
import { GetUserEmailById } from "../../../application/usecases/GetUserEmailById";

export class UserController {
  constructor(private getUserEmailById: GetUserEmailById) {}

  async getEmail(req: Request, res: Response) {
    const userId=req.body.userId;
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const email = await this.getUserEmailById.execute(userId);

    if (!email) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ email });
  }
}
