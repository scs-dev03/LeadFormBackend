export interface DealerDetails {
  dealerId: number;
  dealerName: string;
  brand: { id: number; name: string };
  industry: { id: number; name: string };
  segment: { id: number; name: string };
  businessType: { id: number; name: string };
  spokesperson: { name: string; phone: string; email: string };
  stock: string;
}

export interface LocationDetails {
  locationId: number;
  locationName: string;
  auditCategory: { id: number; name: string };
  locationType: { id: number; name: string };
  pinCode: string;
  city: string;
  state: string;
  remark: string;
  stock: string;
  partline: string | null;
  quantity: number | null;
  value: number | null;
  mediaFiles: { id: number; url: string }[];
}

export interface Contact {
  id: number;
  locationId: number;
  locationName: string;
  name: string;
  phone: string;
  email: string;
  designation: string;
}

export interface DealerApiResponse {
  dealerDetails: DealerDetails;
  locationDetails: LocationDetails[];
  contacts: Contact[];
}
