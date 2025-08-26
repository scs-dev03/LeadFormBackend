import { ISegmentRepository } from "../../../domain/repositories/ISegmentRepository";
import { Segment } from "../../../domain/entities/Segment";
import { poolPromise, sql } from "../mssql/connection";

export class SegmentRepositoryMSSQL implements ISegmentRepository {

  //get segment by ID
  async getById(id: number): Promise<Segment | null> {
    const pool = await poolPromise;
    const rs = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT SegmentID AS id, SegmentName AS name, Industry_Type_ID AS industryId
        FROM UAD_AUD_Segment_Master 
        WHERE SegmentID = @id
      `);
    return rs.recordset[0] ?? null;
  }

  // Get brands under a segment
  async getBrands(segmentId: number) {
    const pool = await poolPromise;
    const rs = await pool.request()
      .input("segmentId", sql.Int, segmentId)
      .query(`
        SELECT BrandID AS id, BrandName AS name
        FROM UAD_AUD_Brand_Master
        WHERE SegmentID = @segmentId
        ORDER BY BrandName
      `);
    return rs.recordset;
  }

  // Get industry for a segment
  async getIndustry(segmentId: number) {
    const pool = await poolPromise;
    const rs = await pool.request()
      .input("segmentId", sql.Int, segmentId)
      .query(`
        SELECT i.Industry_Type_ID AS id, i.Industry_Type_Name AS name
        FROM UAD_AUD_Segment_Master s
        JOIN UAD_AUD_Industry_Type_Master i ON i.Industry_Type_ID = s.Industry_Type_ID
        WHERE s.SegmentID = @segmentId
      `);
    return rs.recordset[0] ?? null;
  }

  // get segments optionally filtered by industryId or brandId
  async getSegments(filters?: { industryId?: number; brandId?: number }): Promise<Segment[]> {
    const pool = await poolPromise;

    let query = `
      SELECT DISTINCT s.SegmentID AS id, s.SegmentName AS name
      FROM UAD_AUD_Segment_Master s
      LEFT JOIN UAD_AUD_Brand_Master b ON b.SegmentID = s.SegmentID
      WHERE 1=1
    `;

    const request = pool.request();
    if (filters?.industryId) {
      query += " AND s.Industry_Type_ID = @industryId";
      request.input("industryId", sql.Int, filters.industryId);
    }
    if (filters?.brandId) {
      query += " AND b.BrandID = @brandId";
      request.input("brandId", sql.Int, filters.brandId);
    }

    const rs = await request.query(query);
    return rs.recordset;
  }
}
