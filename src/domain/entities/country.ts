export class Country {
  id?: number;
  country: string;
  isoCode: string;
  countryCode: string;

  constructor(country: string, isoCode: string, countryCode: string, id?: number) {
    this.id = id;
    this.country = country;
    this.isoCode = isoCode;
    this.countryCode = countryCode;
  }
}
