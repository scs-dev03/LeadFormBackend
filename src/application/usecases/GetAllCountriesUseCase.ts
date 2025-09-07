import { ICountryRepository } from "../../domain/repositories/ICountryRepository";
import { Country } from "../../domain/entities/country";

export class GetAllCountriesUseCase {
  private countryRepository: ICountryRepository;

  constructor(countryRepository: ICountryRepository) {
    this.countryRepository = countryRepository;
  }

  async execute(): Promise<Country[]> {
    return this.countryRepository.findAll();
  }
}
