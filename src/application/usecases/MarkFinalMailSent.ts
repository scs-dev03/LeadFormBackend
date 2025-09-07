import { UserMailSent} from "../../infra/db/mssql/UserMailSentRepositoryMSSQL";

export class MarkFinalMailSent {
  constructor(private userRepo: UserMailSent) {}

  async execute(userId: number): Promise<void> {
    await this.userRepo.markFinalMailSent(userId);
  }
}
