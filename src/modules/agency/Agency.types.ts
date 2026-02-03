export interface IAgency {
  id: string;
  agency_name: string;
  branch_code: string | null;
  is_active: number;
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
  address_line_2: string | null;
  location_id: number;
  is_active: number;
}

export interface IContact {
  id: number;
  email: string;
  phone_number: string | null;
  alternate_phone_number: string | null;
  is_active: number;
}

export interface IAgencyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  includeInactive?: boolean;
  city?: string;
  state?: string;
}

export interface IUserAgency {
  user_id: string;
  agency_id: string;
  is_active: number;
  assigned_at?: Date;
}

export interface IAgencyAddressAggregate extends IAddress {
  location: ILocation;
}

export interface IAgencyAggregate extends IAgency {
  addresses: IAgencyAddressAggregate[];
  contacts: IContact[];
  users: IUserAgency[];
}

export interface IUserAgencyAggregate {
  agency: IAgency;
  user_is_active: number;
  assigned_at: Date;
}
