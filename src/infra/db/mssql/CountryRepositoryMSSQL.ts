import sql from "mssql";
import { ICountryRepository } from "../../../domain/repositories/ICountryRepository";
import { Country } from "../../../domain/entities/country";
import { poolPromise } from "./connection";

export class CountryRepositoryMSSQL implements ICountryRepository {
  async findAll(): Promise<Country[]> {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Countries");
    return result.recordset.map(
      (row: any) => new Country(row.Country, row.IsoCode, row.CountryCode, row.Id)
    );
  }
}
