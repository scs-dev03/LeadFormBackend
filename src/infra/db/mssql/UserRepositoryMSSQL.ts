import { poolPromise } from "../mssql/connection";
import sql from "mssql";

export class UserRepositoryMSSQL {
  async findByPhone(phone_number: string,country_code?:string) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("phone_number", sql.VarChar, phone_number)
      .input("country_code", sql.VarChar, country_code)
      .query(`SELECT * FROM AUD_LDF_users WHERE phone_number = @phone_number AND Country_Code=country_code`);
    return result.recordset[0];
  }

  async createUser(name: string, phone_number: string,email:string,country_code:string) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("phone_number", sql.VarChar, phone_number)
      .input("email", sql.VarChar, email)
      .input("country_code", sql.VarChar, country_code)
      .query(`
        INSERT INTO AUD_LDF_users (name, phone_number,email,Country_Code,created_at)
        OUTPUT INSERTED.*
        VALUES (@name, @phone_number,@email,@country_code, GETDATE())
      `);
    return result.recordset[0];
  }

  async updateUser(phone_number: string, name: string,email:string,country_code:string) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("phone_number", sql.VarChar, phone_number)
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("country_code", sql.VarChar, country_code)
      .query(`
        UPDATE AUD_LDF_users
        SET name = @name,
            email = @email,
            Country_Code=@country_code,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE phone_number = @phone_number and Country_Code=@country_code
      `);
    return result.recordset[0]; 
  }
}
