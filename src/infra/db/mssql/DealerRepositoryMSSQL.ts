import { IDealerRepository } from "../../../domain/repositories/IDealerRepository";
import { Dealer } from "../../../domain/entities/Dealer";
import { poolPromise, sql } from "../mssql/connection";
import { count } from "console";

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
             d.Country_Code AS country_code,
             d.SpokespersonPhone AS spokespersonPhone,
             d.StockFile AS stockFile,
             d.CreatedBy AS createdBy,
             d.CreatedAt AS createdAt,
             d.UpdatedAt AS updatedAt
      FROM dbo.AUD_LDF_dealer d
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
          d.SpokespersonName, d.SpokespersonEmail, d.SpokespersonPhone,d.Country_Code,
          d.StockFile, d.CreatedBy,
          b.BrandID AS BrandID, b.BrandName AS BrandName,
          bt.Business_Type_ID AS BusinessTypeID, bt.Business_Type_Name AS BusinessTypeName
        FROM dbo.AUD_LDF_dealer d
        JOIN dbo.AUD_LDF_brandMaster b ON b.BrandID = d.BrandID
        JOIN dbo.AUD_LDF_businessType bt ON bt.Business_Type_ID = d.BusinessTypeID
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
                Country_Code: row.Country_Code,
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
               Country_Code AS country_code,
               StockFile AS stockFile,
               CreatedBy AS createdBy
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
            Country_Code: row.country_code,
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
            .input("Country_Code", sql.NVarChar, dealerData.Country_Code)
            .input("StockFile", sql.NVarChar, dealerData.stockFile ?? null)
            .input("CreatedBy", sql.Int, dealerData.createdBy)
            .query(`
        INSERT INTO dbo.AUD_LDF_dealer
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
    b.BrandID AS brandId,
    b.BrandName AS brand,
	it.Industry_Type_ID AS Industry,
	sg.SegmentID AS Segment,
    d.DealerName AS dealerName,
    l.Location_Name AS locationName,
    bt.name AS businessType,
    /*
    ac.name AS auditCategory,
    */
    ac.AuditCategoryNames AS auditCategory, 
    l.Pincode AS pinCode,
    l.City,
    l.State,
    l.Remark AS locationRemark,
    lc.Name Name,
    lc.Country_Code AS Country_Code,
    lc.Phone AS Phone,
    lc.Email AS Email,
    lc.Designation AS Designation,
    COALESCE(d.StockFile, l.Stock_File) AS stockUpload,
	lm.MediaUrl as media_Files
FROM AUD_LDF_brandMaster b
LEFT JOIN AUD_LDF_dealer d ON d.BrandID = b.BrandID
LEFT JOIN AUD_LDF_locationDetails l ON d.DealerID = l.Dealer_Id
LEFT JOIN AUD_LDF_businessType bt ON d.BusinessTypeID = bt.id
/*
LEFT JOIN AUD_LDF_auditCategories ac ON l.Audit_Id = ac.id
*/
OUTER APPLY (
    SELECT STRING_AGG(ac.name, ', ') AS AuditCategoryNames
    FROM STRING_SPLIT(l.Audit_Id, ',') s
    JOIN AUD_LDF_auditCategories ac 
         ON TRY_CAST(s.value AS INT) = ac.id
) ac

left JOIN AUD_LDF_contacts lc ON l.Id = lc.Dealer_Location_Id
LEFT JOIN AUD_LDF_segmentMaster sg ON  b.SegmentID = sg.SegmentID
LEFT JOIN AUD_LDF_industryMaster it ON sg.Industry_Type_ID = it.Industry_Type_ID
left JOIN AUD_LDF_locationMediaMapping lm ON l.id =lm.LocationId
WHERE d.CreatedBy = @UserId
    `);
        // Group by Location_id
        const grouped: Record<number, any> = {};
        const finalResult: any[] = [];

        result.recordset.forEach(row => {
            if (row.Location_id) {
                // Group rows with Location_id
                if (!grouped[row.Location_id]) {
                    grouped[row.Location_id] = {
                        ...row,
                        media_Files: row.media_Files ? [row.media_Files] : []
                    };
                } else {
                    if (row.media_Files) {
                        grouped[row.Location_id].media_Files.push(row.media_Files);
                    }
                }
            } else {
                // If no Location_id, just keep the row as-is
                finalResult.push({
                    ...row,
                    media_Files: row.media_Files ? [row.media_Files] : []
                });
            }
        });

        // Combine grouped (with Location_id) + standalone rows (without Location_id)
        finalResult.push(...Object.values(grouped));
        return finalResult;

    }
    async getDealerByBrand(brandId: number, dealerId: number, userId: number): Promise<any> {
        const pool = await poolPromise;
        // console.log("Fetching dealer for brandId:", brandId, "and userId:", userId);
        const query = `
        SELECT 
            it.Industry_Type_ID AS IndustryId,
            it.Industry_Type_Name AS IndustryName,
            sg.SegmentID AS SegmentId,
            sg.SegmentName AS SegmentName,
            b.BrandID AS BrandId,
            b.BrandName AS BrandName,
            d.DealerID AS DealerId,
            d.DealerName AS DealerName,
            l.Id AS LocationId,
            l.Location_Name AS LocationName,
            bt.id AS BusinessTypeId,
            bt.name AS BusinessTypeName,
            ac.AuditCategoryIds AS AuditCategoryId,
            ac.AuditCategoryNames AS AuditCategoryName,
            lt.id AS LocationTypeId,
            lt.name AS LocationTypeName,
            d.SpokespersonName,
            d.Country_Code,
            d.SpokespersonPhone,
            d.SpokespersonEmail,
            l.Pincode AS PinCode,
            l.City,
            l.State,
            l.Remark AS LocationRemark,
            l.partline,
            l.quantity,
            l.value,
            lc.Id AS ContactId,
            lc.Name AS ContactName,
            lc.Country_Code AS ContactCountryCode,
            lc.Phone AS ContactPhone,
            lc.Email AS ContactEmail,
            lc.Designation AS ContactDesignation,
            d.StockFile as dealerStockFile,
            l.Stock_File as locationStockFile,
            lm.Id AS MediaId,
            lm.MediaUrl AS MediaFile
        FROM AUD_LDF_brandMaster b
        LEFT JOIN AUD_LDF_dealer d ON d.BrandID = b.BrandID
        LEFT JOIN AUD_LDF_locationDetails l ON d.DealerID = l.Dealer_Id
        LEFT JOIN AUD_LDF_businessType bt ON d.BusinessTypeID = bt.id
        /*LEFT JOIN AUD_LDF_auditCategories ac ON l.Audit_Id = ac.id*/
        OUTER APPLY (
    SELECT STRING_AGG(ac.name, ',') AS AuditCategoryNames,
           STRING_AGG(CAST(ac.id AS VARCHAR), ',') AS AuditCategoryIds
    FROM STRING_SPLIT(l.Audit_Id, ',') s
    JOIN AUD_LDF_auditCategories ac 
         ON TRY_CAST(s.value AS INT) = ac.id
) ac
        LEFT JOIN AUD_LDF_contacts lc ON l.Id = lc.Dealer_Location_Id
        LEFT JOIN AUD_LDF_segmentMaster sg ON b.SegmentID = sg.SegmentID
        LEFT JOIN AUD_LDF_industryMaster it ON sg.Industry_Type_ID = it.Industry_Type_ID
        LEFT JOIN AUD_LDF_locationMediaMapping lm ON l.Id = lm.LocationId
        LEFT JOIN AUD_LDF_locationType lt ON l.Location_Type_Id = lt.id
        WHERE  d.DealerID=@dealerId AND b.BrandID = @brandId AND d.CreatedBy = @UserId;
    `;
        const result = await pool.request()
            .input("brandId", sql.Int, brandId)
            .input("dealerId", sql.Int, dealerId) // Assuming dealerId is same as brandId for this query
            .input("UserId", sql.Int, userId)
            .query(query);
        console.log(result);
        const rows = result.recordset;
        if (!rows.length) return null;

        const first = rows[0];
        console.log(first);
        // console.log( first.dealerStockFile);
        // Dealer-level info
        const dealerDetails = {
            dealerId: first.DealerId,
            dealerName: first.DealerName,
            brand: { id: first.BrandId, name: first.BrandName },
            industry: { id: first.IndustryId, name: first.IndustryName },
            segment: { id: first.SegmentId, name: first.SegmentName },
            businessType: { id: first.BusinessTypeId, name: first.BusinessTypeName },
            spokesperson: {
                name: first.SpokespersonName,
                country_code: first.Country_Code,
                phone: first.SpokespersonPhone,
                email: first.SpokespersonEmail
            },
            stock: first.dealerStockFile
        };

        // Group by location
        const locationsMap = new Map<number, any>();
        const contacts: any[] = [];

        rows.forEach(row => {
            if (!locationsMap.has(row.LocationId)) {
                //const auditIds = row.AuditCategoryId ? row.AuditCategoryId.split(',') : [];
                // const auditNames = row.AuditCategoryName
                //     ? row.AuditCategoryName.split(',').map((n: string) => n.trim())
                //     : [];
                const auditIds = row.AuditCategoryId ? row.AuditCategoryId.split(',') : [];
                locationsMap.set(row.LocationId, {
                    locationId: row.LocationId,
                    locationName: row.LocationName,
                    // auditCategory: { id: row.AuditCategoryId, name: row.AuditCategoryName },
                    //auditCategory: auditIds.map((i: any) => ({
                   //     id: auditIds[i] ? Number(auditIds[i]) : null,
                    //})),
                    auditCategoryIds: auditIds.map((id: any) => Number(id)), // only IDs
                    locationType: { id: row.LocationTypeId, name: row.LocationTypeName },
                    pinCode: row.PinCode,
                    city: row.City,
                    state: row.State,
                    remark: row.LocationRemark,
                    stock: row.locationStockFile,
                    partline: row.partline,
                    quantity: row.quantity,
                    value: row.value,
                    mediaFiles: []
                });
            }

            const loc = locationsMap.get(row.LocationId);

            // Media files
            if (row.MediaId && !loc.mediaFiles.some((m: any) => m.id === row.MediaId)) {
                loc.mediaFiles.push({ id: row.MediaId, url: row.MediaFile });
            }
            // Contacts
            if (row.ContactId) {
                const contactObj = {
                    id: row.ContactId,
                    locationId: row.LocationId,
                    locationName: row.LocationName,
                    name: row.ContactName,
                    country_code: row.ContactCountryCode,
                    phone: row.ContactPhone,
                    email: row.ContactEmail,
                    designation: row.ContactDesignation
                };

                // Add to global contacts
                if (!contacts.some(c => c.id === row.ContactId)) {
                    contacts.push(contactObj);
                }
            }
        });
        return {
            dealerDetails,
            locationDetails: Array.from(locationsMap.values()),
            contacts
        };
    }

    async getBrandIdsByUserId(userId: number): Promise<{ dealerId: number; brandId: number }[]> {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("userId", sql.Int, userId)
            .query(`
        select dealerid , brandid from aud_ldf_dealer where createdby = @userId
      `);

        return result.recordset.map((row: any) => ({
            dealerId: row.dealerid,
            brandId: row.brandid,
        }));
    }
    async getDealerIdsByUserId(userId: number): Promise<number[]> {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("userId", sql.Int, userId)
            .query(`
        select distinct DealerID from AUD_LDF_dealer where CreatedBy= @userId
      `);
        //   console.log(result.recordset);

        return result.recordset;
    }
}
