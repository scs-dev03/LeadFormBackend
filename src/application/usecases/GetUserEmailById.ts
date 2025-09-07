import { IUserRepository } from "../../domain/repositories/IMailRepository";

export class GetUserEmailById {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: number): Promise<string | null> {
    return await this.userRepository.getEmailById(userId);
  }
}
