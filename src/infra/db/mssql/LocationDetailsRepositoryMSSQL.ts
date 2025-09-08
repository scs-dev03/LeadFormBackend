import { ILocationDetailsRepository } from "../../../domain/repositories/ILocationDetailsRepository";
import { LocationDetails } from "../../../domain/entities/LocationDetails";
import { Dealer } from "../../../domain/entities/Dealer";
import { poolPromise, sql } from "../mssql/connection";
import { LocationMedia } from "../../../domain/entities/LocationMedia";

export class LocationDetailsRepositoryMSSQL implements ILocationDetailsRepository {

  async save(location: LocationDetails): Promise<LocationDetails> {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("dealerId", sql.Int, location.dealerId)
      .input("locationName", sql.NVarChar(255), location.locationName)
      .input("locationTypeId", sql.Int, location.locationTypeId)
      .input("auditId", sql.Int, location.auditId)
      .input("pincode", sql.NVarChar(20), location.pincode)
      .input("city", sql.NVarChar(100), location.city)
      .input("state", sql.NVarChar(100), location.state)
      .input("stockFile", sql.NVarChar(500), location.stockFile) // nullable
      .input("remark", sql.NVarChar(sql.MAX), location.remark)
      .input("businessTypeId", sql.Int, location.businessTypeId)
      .input("partLine", sql.NVarChar(255), location.partLine)
      .input("quantity", sql.Int, location.quantity)
      .input("value", sql.Decimal(18, 2), location.value)
      .query(`
        INSERT INTO AUD_LDF_locationDetails (
          Dealer_Id, Location_Name, Location_Type_Id, Audit_Id, Pincode, City, State,
          Stock_File, Remark, Business_Type_Id, PartLine, Quantity, Value
        )
        OUTPUT INSERTED.*
        VALUES (
          @dealerId, @locationName, @locationTypeId, @auditId, @pincode, @city, @state,
          @stockFile, @remark, @businessTypeId, @partLine, @quantity, @value
        )
      `);
 
    const row = result.recordset[0];

    return new LocationDetails(
      row.Id,
      row.Dealer_Id,
      row.Location_Name,
      row.Location_Type_Id,
      row.Audit_Id,
      row.Pincode,
      row.City,
      row.State,
      row.Stock_File,
      row.Media,  // legacy field in table, can keep or remove
      row.Remark,
      row.Business_Type_Id,
      row.PartLine,
      row.Quantity,
      row.Value
    );
  }

  // Get dealer info by id for stockFile validation
  async getDealerById(dealerId: number): Promise<Dealer | null> {
    const pool = await poolPromise;

    const rs = await pool.request()
      .input("dealerId", sql.Int, dealerId)
      .query(`
        SELECT DealerID AS id,
               DealerName AS dealerName,
               BrandID AS brandId,
               BusinessTypeID AS businessTypeId,
               SpokespersonName AS spokespersonName,
               SpokespersonEmail AS spokespersonEmail,
               SpokespersonPhone AS spokespersonPhone,
               StockFile AS stockFile,
               CreatedBy
        FROM dbo.AUD_LDF_dealer
        WHERE DealerID = @dealerId
      `);

    const row = rs.recordset[0];
    if (!row) return null;

    return {
      id: row.id,
      dealerName: row.dealerName,
      brandId: row.brandId,
      businessTypeId: row.businessTypeId,
      spokespersonName: row.spokespersonName,
      spokespersonEmail: row.spokespersonEmail,
      spokespersonPhone: row.spokespersonPhone,
      stockFile: row.stockFile,
      createdBy: row.CreatedBy
    };
  }

  async findByDealerAndName(dealerId: number, locationName: string): Promise<LocationDetails | null> {
    const pool = await poolPromise;
    const rs = await pool.request()
      .input("dealerId", sql.Int, dealerId)
      .input("locationName", sql.NVarChar(255), locationName)
      .query(`
        SELECT TOP 1 * 
        FROM AUD_LDF_locationDetails 
        WHERE Dealer_Id = @dealerId AND Location_Name = @locationName
      `);

    const row = rs.recordset[0];
    if (!row) return null;

    return new LocationDetails(
      row.Id,
      row.Dealer_Id,
      row.Location_Name,
      row.Location_Type_Id,
      row.Audit_Id,
      row.Pincode,
      row.City,
      row.State,
      row.Stock_File,
      row.Media,
      row.Remark,
      row.Business_Type_Id,
      row.PartLine,
      row.Quantity,
      row.Value
    );
  }

  async saveMedia(locationId: number, mediaUrls: string[]): Promise<LocationMedia[]> {
    const pool = await poolPromise;
    const inserted: LocationMedia[] = [];

    for (const url of mediaUrls) {
      const rs = await pool.request()
        .input("locationId", sql.Int, locationId)
        .input("mediaUrl", sql.NVarChar(500), url)
        .query(`
          INSERT INTO AUD_LDF_locationMediaMapping (LocationId, MediaUrl)
          OUTPUT INSERTED.*
          VALUES (@locationId, @mediaUrl)
        `);

      const row = rs.recordset[0];
      inserted.push(new LocationMedia(row.Id, row.LocationId, row.MediaUrl, row.UploadedAt));
    }

    return inserted;
  }
}
