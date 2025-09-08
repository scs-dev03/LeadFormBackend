import { ILocationContactRepository } from "../../../domain/repositories/ILocationContactRepository";
import { LocationContact } from "../../../domain/entities/LocationContact";
import { poolPromise, sql } from "../mssql/connection";

export class LocationContactRepositoryMSSQL implements ILocationContactRepository {

  async findByLocationId(locationId: number): Promise<LocationContact | null> {
    const pool = await poolPromise;
    const rs = await pool.request()
      .input("locationId", sql.Int, locationId)
      .query(`SELECT * FROM AUD_LDF_contacts WHERE Dealer_Location_Id = @locationId`);

    const row = rs.recordset[0];
    if (!row) return null;

    return new LocationContact(
      row.Id,
      row.Dealer_Location_Id,
      row.Designation,
      row.Name,
      row.Country_Code,
      row.Phone,
      row.Email,
      row.CreatedAt,
      row.UpdatedAt
    );
  }

  async saveBulk(contacts: LocationContact[]): Promise<LocationContact[]> {
    const pool = await poolPromise;
    const inserted: LocationContact[] = [];

    for (const contact of contacts) {
      const rs = await pool.request()
        .input("dealerLocationId", sql.Int, contact.location)
        .input("designation", sql.NVarChar(100), contact.designation)
        .input("name", sql.NVarChar(200), contact.name)
        .input("country_code", sql.NVarChar(10), contact.Country_Code)
        .input("phone", sql.NVarChar(50), contact.phone)
        .input("email", sql.NVarChar(200), contact.email)
        .query(`
          INSERT INTO AUD_LDF_contacts (Dealer_Location_Id, Designation, Name,Country_Code,Phone, Email)
          OUTPUT INSERTED.*
          VALUES (@dealerLocationId, @designation, @name,@Country_Code,@phone, @email)
        `);

      const row = rs.recordset[0];
      inserted.push(new LocationContact(
        row.Id,
        row.Dealer_Location_Id,
        row.Designation,
        row.Name,
        row.Country_Code,
        row.Phone,
        row.Email,
        row.CreatedAt,
        row.UpdatedAt
      ));
    }

    return inserted;
  }
}
