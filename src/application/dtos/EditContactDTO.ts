export interface EditContactDTO {
  locationId: number;
  contactId?: number; 
  name?: string;
  phone?: string;
  email?: string;
  designation?: string;
}