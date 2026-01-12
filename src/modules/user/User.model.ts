import {
  IAddress,
  IAgency,
  IAgencyAddress,
  IAgencyContact,
  IContact,
  ILocation,
  IRole,
  IUser,
  IUserAddress,
  IUserPhoneNumber,
  IUserProfile,
  IUserRole,
} from "./User.types";

export class User implements IUser {
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

  constructor(data: IUser) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.is_active = data.is_deleted;
    this.is_deleted = data.is_deleted;
    this.last_login_at = data.last_login_at;
    this.password_updated_at = data.password_updated_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
export class UserProfile implements IUserProfile {
  user_id: string;
  first_name: string;
  middle_name?: string | null | undefined;
  last_name: string;
  constructor(data: IUserProfile) {
    this.user_id = data.user_id;
    this.first_name = data.first_name;
    this.middle_name = data.middle_name;
    this.last_name = data.last_name;
  }
}
export class UserPhoneNumber implements IUserPhoneNumber {
  id: number;
  user_id: string;
  phone_number: string;
  constructor(data: IUserPhoneNumber) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.phone_number = data.phone_number;
  }
}
export class UserAddress implements IUserAddress {
  id: number;
  user_id: string;
  address: string;
  country?: string | null | undefined;
  constructor(data: IUserAddress) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.address = data.address;
    this.country = data.country;
  }
}
export class Role implements IRole {
  id: number;
  code: string;
  constructor(data: IRole) {
    this.id = data.id;
    this.code = data.code;
  }
}
export class UserRoles implements IUserRole {
  user_id: string;
  role_id: number;

  constructor(data: IUserRole) {
    this.user_id = data.user_id;
    this.role_id = data.role_id;
  }
}
export class Agency implements IAgency {
  id: string;
  agency_name: string;
  branch_code?: string | null;
  is_active: boolean;
  vp_user_id?: string | null;
  created_at: Date;
  updated_at: Date;

  constructor(data: IAgency) {
    this.id = data.id;
    this.agency_name = data.agency_name;
    this.branch_code = data.branch_code;
    this.is_active = data.is_active;
    this.vp_user_id = data.vp_user_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
export class Location implements ILocation {
  id: number;
  city: string;
  state: string;
  country: string;
  pincode: string;

  constructor(data: ILocation) {
    this.id = data.id;
    this.city = data.city;
    this.state = data.state;
    this.country = data.country;
    this.pincode = data.pincode;
  }
}
export class Address implements IAddress {
  id: number;
  address_line_1: string;
  address_line_2?: string | null;
  location_id: number;

  constructor(data: IAddress) {
    this.id = data.id;
    this.address_line_1 = data.address_line_1;
    this.address_line_2 = data.address_line_2;
    this.location_id = data.location_id;
  }
}
export class Contact implements IContact {
  id: number;
  email: string;
  phone_number?: string | null;
  alternate_phone_number?: string | null;

  constructor(data: IContact) {
    this.id = data.id;
    this.email = data.email;
    this.phone_number = data.phone_number;
    this.alternate_phone_number = data.alternate_phone_number;
  }
}
export class AgencyAddress implements IAgencyAddress {
  agency_id: string;
  address_id: number;

  constructor(data: IAgencyAddress) {
    this.agency_id = data.agency_id;
    this.address_id = data.address_id;
  }
}
export class AgencyContact implements IAgencyContact {
  agency_id: string;
  contact_id: number;

  constructor(data: IAgencyContact) {
    this.agency_id = data.agency_id;
    this.contact_id = data.contact_id;
  }
}
