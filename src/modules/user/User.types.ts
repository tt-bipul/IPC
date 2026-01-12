export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  VP = "VP",
  AGENCY_EXECUTIVE = "AGENCY_EXECUTIVE",
}
export interface IUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  is_deleted: boolean;
  last_login_at: Date | null;
  password_updated_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface IUserProfile {
  user_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
}

export interface IUserPhoneNumber {
  id: number;
  user_id: string;
  phone_number: string;
}

export interface IUserAddress {
  id: number;
  user_id: string;
  address: string;
  country?: string | null;
}

export interface IRole {
  id: number;
  code: string;
}

export interface IUserRole {
  user_id: string;
  role_id: number;
}

export interface IAgency {
  id: string;
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
