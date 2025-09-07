import { GetAllCountriesUseCase } from "../usecases/GetAllCountriesUseCase";
import { Country } from "../../domain/entities/country";

export class CountryService {
  private getAllCountriesUseCase: GetAllCountriesUseCase;

  constructor(getAllCountriesUseCase: GetAllCountriesUseCase) {
    this.getAllCountriesUseCase = getAllCountriesUseCase;
  }

  async getAllCountries(): Promise<Country[]> {
    return this.getAllCountriesUseCase.execute();
  }
}
