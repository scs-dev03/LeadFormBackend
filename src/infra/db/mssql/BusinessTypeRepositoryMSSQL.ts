import { poolPromise } from "../mssql/connection";
export class BusinessTypeRepositoryMSSQL {
  async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT id, name FROM Business_Type ORDER BY name");
    return result.recordset;
  }
}