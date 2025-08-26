import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";

export class UserService {
  constructor(private userRepo: IUserRepository) {}

  async signup(name: string, phone: string): Promise<User> {
    const existing = await this.userRepo.findByPhone(phone);
    if (existing) throw new Error("User already exists");
    return await this.userRepo.createUser(name, phone);
  }

  async login(phone: string): Promise<User> {
    const user = await this.userRepo.findByPhone(phone);
    if (!user) throw new Error("User not found");
    return user;
  }
}
