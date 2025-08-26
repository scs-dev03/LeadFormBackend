import { poolPromise, sql } from "../mssql/connection";
import { EditDealerDetailsDTO } from "../../../application/dtos/EditDealerDetailsDTO";

export class DealerRepositoryMSSQL {
    async editDealerDetails(data: EditDealerDetailsDTO): Promise<void> {
        const { dealerId, locationId, name, email, phone, designation, mediaUrl, stockFile } = data;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        await transaction.begin();

        try {
            const request = transaction.request();
            if (name || email || phone || designation) {
                await request
                    .input("locationId", sql.Int, locationId)
                    .input("name", sql.NVarChar, name ?? null)
                    .input("email", sql.NVarChar, email ?? null)
                    .input("phone", sql.NVarChar, phone ?? null)
                    .input("designation", sql.NVarChar, designation ?? null)
                    .query(`
            UPDATE Location_Contact
            SET 
              Name = COALESCE(@name, Name),
              Email = COALESCE(@email, Email),
              Phone = COALESCE(@phone, Phone),
              Designation = COALESCE(@designation, Designation),
              UpdatedAt = GETDATE()
            WHERE Dealer_Location_Id = @locationId
          `);
            }
            if (stockFile) {
                const dealerStock = await transaction.request()
                    .input("dealerId", sql.Int, dealerId)
                    .query("SELECT StockFile FROM Dealer WHERE DealerID = @dealerId");

                if (dealerStock.recordset[0]?.StockFile) {
                    // Update Dealer
                    await transaction.request()
                        .input("dealerId", sql.Int, dealerId)
                        .input("stockFile", sql.NVarChar, stockFile)
                        .query(`
              UPDATE Dealer
              SET StockFile = @stockFile, UpdatedAt = GETDATE()
              WHERE DealerID = @dealerId
            `);
                } else {
                    await transaction.request()
                        .input("locationId", sql.Int, locationId)
                        .input("stockFile", sql.NVarChar, stockFile)
                        .query(`
              UPDATE Location_Details
              SET Stock_File = @stockFile, UpdatedAt = GETDATE()
              WHERE Id = @locationId
            `);
                }
            }
            if (mediaUrl) {
                const mediaArray = mediaUrl.split(",");
                await transaction.request()
                    .input("locationId", sql.Int, locationId)
                    .query(`
      DELETE FROM LocationMedia
      WHERE LocationId = @locationId
    `);
                for (const media of mediaArray) {
                    await transaction.request()
                        .input("locationId", sql.Int, locationId)
                        .input("mediaUrl", sql.NVarChar, media)
                        .query(`
        INSERT INTO LocationMedia (LocationId, MediaUrl, CreatedAt, UpdatedAt)
        VALUES (@locationId, @mediaUrl, GETDATE(), GETDATE())
      `);
                }
            }
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
}
