import { Request, Response } from "express";
import { CountryService } from "../../../application/services/CountryService";

export class CountryController {
  private countryService: CountryService;

  constructor(countryService: CountryService) {
    this.countryService = countryService;
  }

  async getAllCountries(req: Request, res: Response): Promise<void> {
    try {
      const countries = await this.countryService.getAllCountries();
      res.json(countries);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
}
