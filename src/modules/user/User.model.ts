import {

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
  country: string | null;
  addressType: "Permanent" | "Communication";
  constructor(data: IUserAddress) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.address = data.address;
    this.country = data.country;
    this.addressType = data.addressType;
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

