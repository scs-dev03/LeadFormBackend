import { LocationTypeRepositoryMSSQL } from "../../infra/db/mssql/LocationTypeRepositoryMSSQL";
export class LocationTypeService {
  constructor(private repo = new LocationTypeRepositoryMSSQL()) {}
  getAll() { return this.repo.getAll(); }
  getByBusinessTypeId(id: number) { return this.repo.getByBusinessTypeId(id); }
}
