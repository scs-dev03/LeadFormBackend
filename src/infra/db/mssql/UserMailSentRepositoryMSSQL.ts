import { poolPromise } from "./connection";

export class UserMailSent{
  async markFinalMailSent(userId: number): Promise<void> {
    const pool = await poolPromise;
    const query = `
      UPDATE users
      SET 
      isFinalMailSent = 1,
      updated_at = GETDATE()    
      WHERE id = @userId
    `;

    const request = pool.request();
    request.input("userId", userId);
    await request.query(query);
  }
}
