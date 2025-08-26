import { LocationDetails } from "../entities/LocationDetails";
import { Dealer } from "../entities/Dealer";
import { LocationMedia } from "../entities/LocationMedia";
import { LocationContact } from "../entities/LocationContact";

export interface ILocationDetailsRepository {
  // Save a new LocationDetails record
  save(location: LocationDetails): Promise<LocationDetails>;
  // Get dealer info by id (to check stockFile)
  getDealerById(dealerId: number): Promise<Dealer | null>;
  // Save media mapping
  saveMedia(locationId: number, mediaUrls: string[]): Promise<LocationMedia[]>;
  findByDealerAndName(dealerId: number, locationName: string): Promise<LocationDetails | null>;
}
