import { ILocationDetailsRepository } from "../../domain/repositories/ILocationDetailsRepository";
import { AppError } from "../../shared/errors/AppError";
import { LocationDetailsDTO } from "../dtos/LocationDetailsDTO";
import { LocationDetails } from "../../domain/entities/LocationDetails";

export class LocationDetailsService {
    constructor(private repo: ILocationDetailsRepository) { }

    async createLocationDetails(
        data: LocationDetailsDTO & { totalMediaSize?: number; mediaUrls?: string[] }
    ) {
        const dealer = await this.repo.getDealerById(data.dealerId);
        if (!dealer) {
            throw new AppError("Dealer not found", 404);
        }

        const hasLocationStockFile = !!data.stockFile;
        const hasPartInfo =
            !!data.partLine && data.quantity != null && data.value != null;

        if (!dealer.stockFile) {
            if (!(hasLocationStockFile || hasPartInfo)) {
                throw new AppError(
                    "Dealer has no stock file: provide either a location stock file OR (partLine, quantity, value).",
                    400
                );
            }
        } else {
            if (hasLocationStockFile || hasPartInfo) {
                throw new AppError(
                    "Dealer already has a stock file: do not provide location stock file or partLine/quantity/value.",
                    400
                );
            }
        }
        const existingLocation = await this.repo.findByDealerAndName(data.dealerId, data.locationName);
        if (existingLocation) {
            throw new AppError(`Location '${data.locationName}' already exists for this dealer`, 400);
        }
        if (data.totalMediaSize && data.totalMediaSize > 150 * 1024 * 1024) {
            throw new AppError("Total media size cannot exceed 150MB", 400);
        }

        const location = new LocationDetails(
            null,
            data.dealerId,
            data.locationName,
            data.locationTypeId,
            data.auditId,
            data.pincode,
            data.city,
            data.state,
            data.stockFile || null,
            null, // media no longer stored here
            data.remark || null,
            data.businessTypeId,
            data.partLine || null,
            data.quantity || null,
            data.value || null
        );

        // 1. Save location first
        const savedLocation = await this.repo.save(location);

        // 2. Save media mapping if mediaUrls exist
        if (data.mediaUrls && data.mediaUrls.length > 0) {
            await this.repo.saveMedia(savedLocation.id!, data.mediaUrls);
        }

        return savedLocation;
    }
}
