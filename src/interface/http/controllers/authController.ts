import { Request, Response } from "express";
import { UserRepositoryMSSQL } from "../../../infra/db/mssql/UserRepositoryMSSQL";

const userRepo = new UserRepositoryMSSQL();

// Signup: create a new user
export const signup = async (req: Request, res: Response) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  try {
    const existingUser = await userRepo.findByPhone(phone);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = await userRepo.createUser(name, phone);
    return res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error("Error in signup:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Signin: only existing user can sign in
export const signin = async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone is required" });
  }

  try {
    const existingUser = await userRepo.findByPhone(phone);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found. Please signup first." });
    }

    return res.status(200).json({ message: "Signin successful", user: existingUser });
  } catch (err) {
    console.error("Error in signin:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  const { phone, name } = req.body;

  if (!phone || !name) {
    return res.status(400).json({ message: "Phone and name are required" });
  }

  try {
    const updatedUser = await userRepo.updateUser(phone, name);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (err) {
    console.error("Error in updateUser:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
