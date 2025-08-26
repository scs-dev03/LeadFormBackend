import { IDealerRepository } from "../../domain/repositories/IDealerRepository";

export class GetDealersByUser {
  constructor(private dealerRepo: IDealerRepository) {}

  async execute(userId: number) {
    return await this.dealerRepo.getDealersByUser(userId);
  }
}
