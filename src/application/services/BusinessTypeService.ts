import { BusinessTypeRepositoryMSSQL } from "../../infra/db/mssql/BusinessTypeRepositoryMSSQL";
export class BusinessTypeService {
  constructor(private repo = new BusinessTypeRepositoryMSSQL()) {}
  getAll() { return this.repo.getAll(); }
}
