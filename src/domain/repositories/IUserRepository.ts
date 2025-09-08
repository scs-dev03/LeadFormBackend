import { User } from "../entities/User";

export interface IUserRepository {
  createUser(name: string, phone_number: string,email:string,country_code:string): Promise<User>;
  updateUser(phone_number: string, name: string,email:string,country_code:string): Promise<User>;
  findByPhone(phone_number: string,country_code:string): Promise<User | undefined>;
}
