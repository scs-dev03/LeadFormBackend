import { poolPromise } from "../mssql/connection";
import sql from "mssql";

export class UserRepositoryMSSQL {
  async findByPhone(phone_number: string) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("phone_number", sql.VarChar, phone_number)
      .query(`SELECT * FROM users WHERE phone_number = @phone_number`);
    return result.recordset[0];
  }

  async createUser(name: string, phone_number: string) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("phone_number", sql.VarChar, phone_number)
      .query(`
        INSERT INTO users (name, phone_number, created_at)
        OUTPUT INSERTED.*
        VALUES (@name, @phone_number, GETDATE())
      `);
    return result.recordset[0];
  }

  async updateUser(phone_number: string, name: string) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("phone_number", sql.VarChar, phone_number)
      .input("name", sql.VarChar, name)
      .query(`
        UPDATE users
        SET name = @name,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE phone_number = @phone_number
      `);
    return result.recordset[0]; 
  }
}
