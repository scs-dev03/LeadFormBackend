import { DealerRepositoryMSSQL } from "../../infra/db/mssql/EditDealerRepositoryMSSQL";
import { EditContactDTO } from "../dtos/EditContactDTO";
import { EditDealerDetailsDTO } from "../dtos/EditDealerDetailsDTO";
import { EditDealerDTO } from "../dtos/EditDealerDTO";
import { EditLocationDTO } from "../dtos/EditLocationDTO";

export class DealerService {
  private dealerRepo: DealerRepositoryMSSQL;

  constructor() {
    this.dealerRepo = new DealerRepositoryMSSQL();
  }
  //view tab edit of free text
  async editDealerDetails(data: EditDealerDetailsDTO): Promise<void> {
    return this.dealerRepo.editDealerDetails(data);
  }
  // dealer-level edit
  async editDealer(data: EditDealerDTO): Promise<void> {
    return this.dealerRepo.editDealer(data);
  }

  // location-level edit
  async editLocation(data: EditLocationDTO): Promise<void> {
    return this.dealerRepo.editLocationDetails(data);
  }

  // contact-level edit
  async editContact(data: EditContactDTO): Promise<void> {
    return this.dealerRepo.editLocationContact(data);
  }
}
