export interface IAgency {
  id: string;
  tenant_id?: string; // Made optional as it might be missing in some contexts or added later
  agency_name: string;
  branch_code?: string | null;
  is_active: boolean;
  vp_user_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ILocation {
  id: number;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface IAddress {
  id: number;
  address_line_1: string;
  address_line_2?: string | null;
  location_id: number;
}

export interface IContact {
  id: number;
  email: string;
  phone_number?: string | null;
  alternate_phone_number?: string | null;
}

export interface IAgencyAddress {
  agency_id: string;
  address_id: number;
}

export interface IAgencyContact {
  agency_id: string;
  contact_id: number;
}

export interface ILocationPayload {
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface IAgencyAddressPayload {
  address_line_1: string;
  address_line_2?: string | null;
  location: ILocationPayload;
}

export interface IContactPayload {
  email: string;
  phone_number?: string | null;
  alternate_phone_number?: string | null;
}

export interface ICreateAgencyPayload {
  agency_name: string;
  branch_code?: string | null;
  vp_user_id?: string | null;
  is_active?: boolean;
  addresses?: IAgencyAddressPayload[];
  contacts?: IContactPayload[];
}

export interface IUserAgency {
  user_id: string;
  agency_id: string;
  is_active: boolean;
  assigned_at: Date;
}