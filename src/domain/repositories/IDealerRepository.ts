import { Dealer } from "../entities/Dealer";

export interface IDealerRepository {
  // Get all dealers, optionally filtered by brandId or businessTypeId
  getDealers(filters?: { brandId?: number; businessTypeId?: number }): Promise<Dealer[]>;

  // Get detailed dealer info by dealerId
  getDetails(dealerId: number): Promise<{
    dealer: Dealer;
    brand: { id: number; name: string };
    businessType: { id: number; name: string };
  } | null>;

  // Get basic dealer info by id (for stockFile check)
  getDealerById(dealerId: number): Promise<Dealer | null>;

  // Create a new dealer
  create(dealerData: Omit<Dealer, "id" | "createdAt" | "updatedAt">): Promise<{ id: number }>;
  getDealersByUser(userId: number): Promise<Dealer[]>;
}
