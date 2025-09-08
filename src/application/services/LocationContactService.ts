import { ILocationContactRepository } from "../../domain/repositories/ILocationContactRepository";
import { LocationContact } from "../../domain/entities/LocationContact";
import { AppError } from "../../shared/errors/AppError";

export class LocationContactService {
  constructor(private repo: ILocationContactRepository) {}

  async createContacts(contacts: Omit<LocationContact, "id" | "createdAt" | "updatedAt">[]) {
    const toInsert: LocationContact[] = [];

    for (const c of contacts) {
      const existing = await this.repo.findByLocationId(c.location);
      if (existing) {
        throw new AppError(`Contact already exists for locationId ${c.location}`, 400);
      }

      toInsert.push(new LocationContact(
        null,
        c.location,
        c.designation,
        c.name,
        c.Country_code,
        c.phone || null,
        c.email || null,
        null,
        null
      ));
    }

    return await this.repo.saveBulk(toInsert);
  }
}
