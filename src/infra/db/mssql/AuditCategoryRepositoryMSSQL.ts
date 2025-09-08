import { poolPromise } from "../mssql/connection";
export class AuditCategoryRepositoryMSSQL {
  async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT id, name FROM AUD_LDF_auditCategories ORDER BY name");
    return result.recordset;
  }
}