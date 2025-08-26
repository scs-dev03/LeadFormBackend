import { ILocationContactRepository } from "../../domain/repositories/ILocationContactRepository";
import { LocationContact } from "../../domain/entities/LocationContact";
import { AppError } from "../../shared/errors/AppError";

export class LocationContactService {
  constructor(private repo: ILocationContactRepository) {}

  async createContacts(contacts: Omit<LocationContact, "id" | "createdAt" | "updatedAt">[]) {
    const toInsert: LocationContact[] = [];

    for (const c of contacts) {
      const existing = await this.repo.findByLocationId(c.dealerLocationId);
      if (existing) {
        throw new AppError(`Contact already exists for locationId ${c.dealerLocationId}`, 400);
      }

      toInsert.push(new LocationContact(
        null,
        c.dealerLocationId,
        c.designation,
        c.name,
        c.phone || null,
        c.email || null,
        null,
        null
      ));
    }

    return await this.repo.saveBulk(toInsert);
  }
}
