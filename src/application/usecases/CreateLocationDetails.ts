import { LocationDetailsDTO } from "../dtos/LocationDetailsDTO";
import { ILocationDetailsRepository } from "../../domain/repositories/ILocationDetailsRepository";
import { LocationDetails } from "../../domain/entities/LocationDetails";

export class CreateLocationDetails {
  constructor(private repo: ILocationDetailsRepository) {}

  async execute(dto: LocationDetailsDTO): Promise<LocationDetails> {
    // Fetch dealer details
    const dealer = await this.repo.getDealerById(dto.dealerId);

    const hasLocationStockFile = !!dto.stockFile;
    const hasPartInfo = dto.partLine != null && dto.quantity != null && dto.value != null;

    if (!dealer?.stockFile) {
      // CASE 1: Dealer does NOT have a stock file
      if (!(hasLocationStockFile || hasPartInfo)) {
        throw new Error(
          "Dealer has no stockFile → Location must provide either stockFile OR (partLine, quantity, value)"
        );
      }
    } else {
      // CASE 2: Dealer HAS a stock file
      if (hasLocationStockFile || hasPartInfo) {
        throw new Error(
          "Dealer already has a stockFile → Location should not provide stockFile or partLine+quantity+value"
        );
      }
    }

    //Passed validation → create entity
    const location = new LocationDetails(
      null,                        // id (auto)
      dto.dealerId,
      dto.locationName,
      dto.locationTypeId,
      dto.auditId,
      dto.pincode,
      dto.city,
      dto.state,
      dto.stockFile ?? null,
      dto.media ?? null,           // todo:still nullable for now
      dto.remark ?? null,
      dto.businessTypeId,
      dto.partLine ?? null,
      dto.quantity ?? null,
      dto.value ?? null
    );

    return await this.repo.save(location);
  }
}
