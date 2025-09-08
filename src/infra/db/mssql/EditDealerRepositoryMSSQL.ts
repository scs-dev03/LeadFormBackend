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
                    .input("country_code", sql.NVarChar, data.country_code ?? null)
                    .input("phone", sql.NVarChar, phone ?? null)
                    .input("designation", sql.NVarChar, designation ?? null)
                    .query(`
            UPDATE Location_Contact
            SET 
              Name = COALESCE(@name, Name),
              Email = COALESCE(@email, Email),
              Country_Code=COALESCE(@country_code,Country_Code),
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
  // 1. Dealer-level edit
 async editDealer(data: any): Promise<void> {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        // Update dealer fields
        await transaction.request()
            .input("dealerId", sql.Int, data.dealerId)
            .input("brandId", sql.Int, data.brandId || null)
            .input("dealerName", sql.NVarChar, data.dealerName || null)
            .input("businessTypeID", sql.Int, data.businessTypeID || null)
            .input("spokespersonName", sql.NVarChar, data.spokespersonName || null)
            .input("country_code", sql.NVarChar, data.country_code || null)
            .input("spokespersonPhone", sql.NVarChar, data.spokespersonPhone || null)
            .input("spokespersonEmail", sql.NVarChar, data.spokespersonEmail || null)
            .query(`
                UPDATE Dealer
                SET 
                  BrandID = COALESCE(@brandId, BrandID),
                  DealerName = COALESCE(@dealerName, DealerName),
                  BusinessTypeID = COALESCE(@businessTypeID, BusinessTypeID),
                  SpokespersonName = COALESCE(@spokespersonName, SpokespersonName),
                  Country_Code=COALESCE(@country_code,Country_Code),
                  SpokespersonPhone = COALESCE(@spokespersonPhone, SpokespersonPhone),
                  SpokespersonEmail = COALESCE(@spokespersonEmail, SpokespersonEmail),
                  UpdatedAt = GETDATE()
                WHERE DealerID = @dealerId
            `);

        // Handle stockFile logic
        if (data.stockFile) {
            const dealerStock = await transaction.request()
                .input("dealerId", sql.Int, data.dealerId)
                .query("SELECT StockFile FROM Dealer WHERE DealerID = @dealerId");

            if (dealerStock.recordset[0]?.StockFile) {
                // Update Dealer.StockFile
                await transaction.request()
                    .input("dealerId", sql.Int, data.dealerId)
                    .input("stockFile", sql.NVarChar, data.stockFile)
                    .query(`
                        UPDATE Dealer
                        SET StockFile = @stockFile, UpdatedAt = GETDATE()
                        WHERE DealerID = @dealerId
                    `);
            } 
        }
        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}
  // 2. Location-level edit
  async editLocationDetails(data: any): Promise<void> {
    const pool = await poolPromise;
    await pool.request()
  .input("locationId", sql.Int, data.locationId)
  .input("locationName", sql.NVarChar, data.locationName || null)
  .input("pincode", sql.NVarChar, data.pincode || null)
  .input("city", sql.NVarChar, data.city || null)
  .input("state", sql.NVarChar, data.state || null)
  .input("stockFile", sql.NVarChar, data.stockFile || null)
  .input("media", sql.NVarChar, data.media ? data.media.join(",") : null)
  .input("remark", sql.NVarChar, data.remark || null)
  .input("locationTypeId", sql.Int, data.locationTypeId || null)
  .input("businessTypeId", sql.Int, data.businessTypeId || null)
  .input("auditId", sql.Int, data.auditId || null)
  .input("partLine", sql.NVarChar, data.partline || null)
  .input("quantity", sql.Int, data.quantity || null)
  .input("value", sql.Decimal, data.value || null)
  .query(`
    UPDATE Location_Details
    SET 
      Location_Name = COALESCE(@locationName, Location_Name),
      Pincode = COALESCE(@pincode, Pincode),
      City = COALESCE(@city, City),
      State = COALESCE(@state, State),
      Stock_File = COALESCE(@stockFile, Stock_File),
      Media = COALESCE(@media, Media),
      Remark = COALESCE(@remark, Remark),
      Location_Type_Id = COALESCE(@locationTypeId, Location_Type_Id),
      Business_Type_Id = COALESCE(@businessTypeId, Business_Type_Id),
      Audit_Id = COALESCE(@auditId, Audit_Id),
      PartLine = COALESCE(@partLine, PartLine),
      Quantity = COALESCE(@quantity, Quantity),
      Value = COALESCE(@value, Value),
      UpdatedAt = GETDATE()
    WHERE Id = @locationId
  `);

    // Media replacement logic
    if (data.media && data.media.length > 0) {
      await pool.request()
        .input("locationId", sql.Int, data.locationId)
        .query(`DELETE FROM LocationMedia WHERE locationId = @locationId`);

      for (const m of data.media) {
        await pool.request()
          .input("locationId", sql.Int, data.locationId)
          .input("url", sql.NVarChar, m)
          .query(`INSERT INTO LocationMedia (LocationId, MediaUrl) VALUES (@locationId, @url)`);
      }
    }
  }

  // 3. Location contact edit
  async editLocationContact(data: any): Promise<void> {
    const pool = await poolPromise;
    await pool.request()
      .input("locationId", sql.Int, data.locationId)
      .input("name", sql.NVarChar, data.name || null)
      .input("country_code", sql.NVarChar, data.country_code || null)
      .input("phone", sql.NVarChar, data.phone || null)
      .input("email", sql.NVarChar, data.email || null)
      .input("designation", sql.NVarChar, data.designation || null)
      .query(`
        UPDATE Location_Contact
        SET 
          Name = COALESCE(@name, Name),
          Country_Code=COALESCE(@country_code,Country_Code),
          Phone = COALESCE(@phone, Phone),
          Email = COALESCE(@email, Email),
          Designation = COALESCE(@designation, Designation),
          UpdatedAt = GETDATE()
        WHERE Dealer_Location_Id = @locationId
      `);
  }
}

