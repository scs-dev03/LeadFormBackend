import { Country } from "../entities/country";

export interface ICountryRepository {
  findAll(): Promise<Country[]>;
}
