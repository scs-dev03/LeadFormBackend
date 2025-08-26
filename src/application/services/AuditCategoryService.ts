import { AuditCategoryRepositoryMSSQL } from "../../infra/db/mssql/AuditCategoryRepositoryMSSQL";
export class AuditCategoryService {
  constructor(private repo = new AuditCategoryRepositoryMSSQL()) {}
  getAll() { return this.repo.getAll(); }
}
