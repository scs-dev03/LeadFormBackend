import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { count } from "console";

export class UserService {
  constructor(private userRepo: IUserRepository) {}

  async signup(name: string, phone: string, email:string, country_code:string): Promise<User> {
    const existing = await this.userRepo.findByPhone(phone,country_code);
    if (existing) throw new Error("User already exists");
    return await this.userRepo.createUser(name, phone,email,country_code);
  }

  async login(phone: string,country_code:string): Promise<User> {
    const user = await this.userRepo.findByPhone(phone,country_code);
    if (!user) throw new Error("User not found");
    return user;
  }
}
