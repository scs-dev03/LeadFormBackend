import { DealerRepositoryMSSQL } from "../../infra/db/mssql/EditDealerRepositoryMSSQL";
import { EditDealerDetailsDTO } from "../dtos/EditDealerDetailsDTO";

export class DealerService {
  private dealerRepo: DealerRepositoryMSSQL;

  constructor() {
    this.dealerRepo = new DealerRepositoryMSSQL();
  }

  async editDealerDetails(data: EditDealerDetailsDTO): Promise<void> {
    return this.dealerRepo.editDealerDetails(data);
  }
}
