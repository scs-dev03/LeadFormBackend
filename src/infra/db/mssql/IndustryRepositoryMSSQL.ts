import { IIndustryRepository } from "../../../domain/repositories/IIndustryRepository";
import { Industry } from "../../../domain/entities/Industry";
import { poolPromise, sql } from "../mssql/connection";

export class IndustryRepositoryMSSQL implements IIndustryRepository {

  // Get industries optionally filtered by segmentId or brandId
  async getIndustries(filters: { segmentId?: number; brandId?: number }): Promise<Industry[]> {
    const pool = await poolPromise;

    let query = `
      SELECT DISTINCT i.Industry_Type_ID AS id, i.Industry_Type_Name AS name
      FROM UAD_AUD_Industry_Type_Master i
      LEFT JOIN UAD_AUD_Segment_Master s ON s.Industry_Type_ID = i.Industry_Type_ID
      LEFT JOIN UAD_AUD_Brand_Master b ON b.SegmentID = s.SegmentID
      WHERE 1=1
    `;

    const request = pool.request();
    if (filters.segmentId) {
      query += " AND s.SegmentID = @segmentId";
      request.input("segmentId", sql.Int, filters.segmentId);
    }
    if (filters.brandId) {
      query += " AND b.BrandID = @brandId";
      request.input("brandId", sql.Int, filters.brandId);
    }

    const rs = await request.query(query);
    return rs.recordset as Industry[];
  }

  // Get segments optionally filtered by industryId or brandId
  async getSegments(filters: { industryId?: number; brandId?: number }) {
    const pool = await poolPromise;

    let query = `
      SELECT DISTINCT s.SegmentID AS id, s.SegmentName AS name
      FROM UAD_AUD_Segment_Master s
      LEFT JOIN UAD_AUD_Brand_Master b ON b.SegmentID = s.SegmentID
      WHERE 1=1
    `;

    const request = pool.request();
    if (filters.industryId) {
      query += " AND s.Industry_Type_ID = @industryId";
      request.input("industryId", sql.Int, filters.industryId);
    }
    if (filters.brandId) {
      query += " AND b.BrandID = @brandId";
      request.input("brandId", sql.Int, filters.brandId);
    }

    const rs = await request.query(query);
    return rs.recordset;
  }

  // Get brands optionally filtered by industryId or segmentId
  async getBrands(filters: { industryId?: number; segmentId?: number }) {
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
}
