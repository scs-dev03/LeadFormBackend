import { LocationContact } from "../entities/LocationContact";

export interface ILocationContactRepository {
  saveBulk(contacts: LocationContact[]): Promise<LocationContact[]>;
  findByLocationId(locationId: number): Promise<LocationContact | null>;
}
