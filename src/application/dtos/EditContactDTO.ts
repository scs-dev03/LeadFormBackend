export interface EditContactDTO {
  locationId: number;
  contactId?: number; 
  name?: string;
  country_code?:string;
  phone?: string;
  email?: string;
  designation?: string;
}