import { User } from "../entities/User";

export interface IUserRepository {
  createUser(name: string, phone_number: string): Promise<User>;
  updateUser(phone_number: string, name: string): Promise<User>;
  findByPhone(phone_number: string): Promise<User | undefined>;
}
