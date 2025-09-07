import sql from "mssql";
import { IUserRepository } from "../../../domain/repositories/IMailRepository";

export class GetUserEmailById implements IUserRepository {
  private pool: sql.ConnectionPool;

  constructor(pool: sql.ConnectionPool) {
    this.pool = pool;
  }

  async getEmailById(userId: number): Promise<string | null> {
    const result = await this.pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT email FROM users WHERE id = @userId");

    if (result.recordset.length === 0) return null;
    return result.recordset[0].email;
  }
}
