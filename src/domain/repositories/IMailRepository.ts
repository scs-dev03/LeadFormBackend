import { User } from "../entities/MailUser";

export interface IUserRepository {
  getEmailById(userId: number): Promise<string | null>;
}
