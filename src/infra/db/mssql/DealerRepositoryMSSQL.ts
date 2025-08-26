import { IDealerRepository } from "../../../domain/repositories/IDealerRepository";
import { Dealer } from "../../../domain/entities/Dealer";
import { poolPromise, sql } from "../mssql/connection";

export class DealerRepositoryMSSQL implements IDealerRepository {

    // Get all dealers optionally filtered by brandId, businessTypeId, createdBy
    async getDealers(filters?: { brandId?: number; businessTypeId?: number; createdBy?: number }): Promise<Dealer[]> {
        const pool = await poolPromise;

        let query = `
      SELECT d.DealerID AS id,
             d.DealerName AS dealerName,
             d.BrandID AS brandId,
             d.BusinessTypeID AS businessTypeId,
             d.SpokespersonName AS spokespersonName,
             d.SpokespersonEmail AS spokespersonEmail,
             d.SpokespersonPhone AS spokespersonPhone,
             d.StockFile AS stockFile,
             d.CreatedBy AS createdBy,
             d.CreatedAt AS createdAt,
             d.UpdatedAt AS updatedAt
      FROM dbo.Dealer d
      WHERE 1=1
    `;

        const request = pool.request();
        if (filters?.brandId) {
            query += " AND d.BrandID = @brandId";
            request.input("brandId", sql.Int, filters.brandId);
        }
        if (filters?.businessTypeId) {
            query += " AND d.BusinessTypeID = @businessTypeId";
            request.input("businessTypeId", sql.Int, filters.businessTypeId);
        }
        if (filters?.createdBy) {
            query += " AND d.CreatedBy = @createdBy";
            request.input("createdBy", sql.Int, filters.createdBy);
        }

        const rs = await request.query(query);
        return rs.recordset;
    }

    // Get detailed dealer info by dealerId
    async getDetails(dealerId: number): Promise<{
        dealer: Dealer;
        brand: { id: number; name: string };
        businessType: { id: number; name: string };
    } | null> {
        const pool = await poolPromise;

        const rs = await pool.request()
            .input("dealerId", sql.Int, dealerId)
            .query(`
        SELECT 
          d.DealerID, d.DealerName, d.BrandID, d.BusinessTypeID,
          d.SpokespersonName, d.SpokespersonEmail, d.SpokespersonPhone,
          d.StockFile, d.CreatedBy,
          b.BrandID AS BrandID, b.BrandName AS BrandName,
          bt.Business_Type_ID AS BusinessTypeID, bt.Business_Type_Name AS BusinessTypeName
        FROM dbo.Dealer d
        JOIN dbo.UAD_AUD_Brand_Master b ON b.BrandID = d.BrandID
        JOIN dbo.Business_Type bt ON bt.Business_Type_ID = d.BusinessTypeID
        WHERE d.DealerID = @dealerId
      `);

        const row = rs.recordset[0];
        if (!row) return null;

        return {
            dealer: {
                id: row.DealerID,
                dealerName: row.DealerName,
                brandId: row.BrandID,
                businessTypeId: row.BusinessTypeID,
                spokespersonName: row.SpokespersonName,
                spokespersonEmail: row.SpokespersonEmail,
                spokespersonPhone: row.SpokespersonPhone,
                stockFile: row.StockFile,
                createdBy: row.CreatedBy
            },
            brand: { id: row.BrandID, name: row.BrandName },
            businessType: { id: row.BusinessTypeID, name: row.BusinessTypeName }
        };
    }

    // Get basic dealer info by id (for stockFile check)
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
               CreatedBy AS createdBy
        FROM dbo.Dealer
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
            createdBy: row.createdBy
        };
    }

    // Create a new dealer
    async create(dealerData: Omit<Dealer, "id" | "createdAt" | "updatedAt">): Promise<{ id: number }> {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("BrandID", sql.Int, dealerData.brandId)
            .input("DealerName", sql.NVarChar, dealerData.dealerName)
            .input("BusinessTypeID", sql.Int, dealerData.businessTypeId)
            .input("SpokespersonName", sql.NVarChar, dealerData.spokespersonName)
            .input("SpokespersonEmail", sql.NVarChar, dealerData.spokespersonEmail)
            .input("SpokespersonPhone", sql.NVarChar, dealerData.spokespersonPhone)
            .input("StockFile", sql.NVarChar, dealerData.stockFile ?? null)
            .input("CreatedBy", sql.Int, dealerData.createdBy)
            .query(`
        INSERT INTO dbo.Dealer 
          (BrandID, DealerName, BusinessTypeID, SpokespersonName, SpokespersonEmail, SpokespersonPhone, StockFile, CreatedBy)
        VALUES
          (@BrandID, @DealerName, @BusinessTypeID, @SpokespersonName, @SpokespersonEmail, @SpokespersonPhone, @StockFile, @CreatedBy);
        SELECT SCOPE_IDENTITY() AS id;
      `);

        return { id: result.recordset[0].id };
    }
    async getDealersByUser(userId: number): Promise<any[]> {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("UserId", sql.Int, userId)
            .query(`
      SELECT 
    d.DealerID AS dealerId,
	l.Id AS Location_id,
    b.BrandName AS brand,
	it.Industry_Type_ID AS Industry,
	sg.SegmentID AS Segment,
    d.DealerName AS dealerName,
    l.Location_Name AS locationName,
    bt.name AS businessType,
    ac.name AS auditCategory,
    l.Pincode AS pinCode,
    l.City,
    l.State,
    lc.Name Name,
    lc.Phone AS Phone,
    lc.Email AS Email,
    lc.Designation AS Designation,
    COALESCE(d.StockFile, l.Stock_File) AS stockUpload,
	lm.MediaUrl as media_Files
FROM uad_aud_brand_master b
INNER JOIN dealer d ON d.BrandID = b.BrandID
INNER JOIN Location_Details l ON d.DealerID = l.Dealer_Id
INNER JOIN Business_Type bt ON d.BusinessTypeID = bt.id
INNER JOIN Audit_Categories ac ON l.Audit_Id = ac.id
left JOIN Location_Contact lc ON l.Id = lc.Dealer_Location_Id
INNER JOIN UAD_AUD_Segment_Master sg ON  b.SegmentID = sg.SegmentID
INNER JOIN UAD_AUD_Industry_Type_Master it ON sg.Industry_Type_ID = it.Industry_Type_ID
left JOIN LocationMedia lm ON l.id =lm.LocationId
WHERE d.CreatedBy = @UserId
    `);
        return result.recordset;
    }
}
