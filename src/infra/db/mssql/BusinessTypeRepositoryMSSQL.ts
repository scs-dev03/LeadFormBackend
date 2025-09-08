import { poolPromise } from "../mssql/connection";
export class BusinessTypeRepositoryMSSQL {
  async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT id, name FROM AUD_LDF_businessType ORDER BY name");
    return result.recordset;
  }
}