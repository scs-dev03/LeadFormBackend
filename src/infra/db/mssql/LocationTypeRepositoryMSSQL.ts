import { poolPromise } from "../mssql/connection";
import sql from "mssql";

export class LocationTypeRepositoryMSSQL {
  async getByBusinessTypeId(businessTypeId: number) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("businessTypeId", sql.Int, businessTypeId)
      .query(`
        SELECT lt.id, lt.name, lt.business_type_id
        FROM AUD_LDF_locationType lt
        WHERE lt.business_type_id = @businessTypeId
        ORDER BY lt.name
      `);
    return result.recordset;
  }

  async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT lt.id, lt.name, lt.business_type_id, bt.name AS business_type_name
      FROM AUD_LDF_locationType lt
      JOIN AUD_LDF_businessType bt ON bt.id = lt.business_type_id
      ORDER BY bt.name, lt.name
    `);
    return result.recordset;
  }
}
