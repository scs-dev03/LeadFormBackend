import { IBrandRepository } from "../../../domain/repositories/IBrandRepository";
import { poolPromise, sql } from "../mssql/connection";

export class BrandRepositoryMSSQL implements IBrandRepository {

  // Get all brands optionally filtered by segmentId or industryId
  async getBrands(filters: { segmentId?: number; industryId?: number }) {
    const pool = await poolPromise;

    let query = `
      SELECT DISTINCT b.BrandID AS id, b.BrandName AS name
      FROM UAD_AUD_Brand_Master b
      LEFT JOIN UAD_AUD_Segment_Master s ON b.SegmentID = s.SegmentID
      LEFT JOIN UAD_AUD_Industry_Type_Master i ON s.Industry_Type_ID = i.Industry_Type_ID
      WHERE 1=1
    `;

    const request = pool.request();
    if (filters.segmentId) {
      query += " AND b.SegmentID = @segmentId";
      request.input("segmentId", sql.Int, filters.segmentId);
    }
    if (filters.industryId) {
      query += " AND i.Industry_Type_ID = @industryId";
      request.input("industryId", sql.Int, filters.industryId);
    }

    const rs = await request.query(query);
    return rs.recordset;
  }

  // Get detailed brand info by brandId
  async getDetails(brandId: number) {
    const pool = await poolPromise;
    const rs = await pool.request()
      .input("brandId", sql.Int, brandId)
      .query(`
        SELECT 
          b.BrandID, b.BrandName,
          s.SegmentID, s.SegmentName,
          i.Industry_Type_ID, i.Industry_Type_Name
        FROM UAD_AUD_Brand_Master b
        JOIN UAD_AUD_Segment_Master s ON s.SegmentID = b.SegmentID
        JOIN UAD_AUD_Industry_Type_Master i ON i.Industry_Type_ID = s.Industry_Type_ID
        WHERE b.BrandID = @brandId
      `);

    const row = rs.recordset[0];
    if (!row) return null;

    return {
      brand:    { id: row.BrandID, name: row.BrandName },
      segment:  { id: row.SegmentID, name: row.SegmentName },
      industry: { id: row.Industry_Type_ID, name: row.Industry_Type_Name }
    };
  }
}
