export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  VP = "VP",
  AGENT = "AGENT",
  TENANT_ADMIN = "TENANT_ADMIN",
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

export type ISafeUser = Omit<
  IUser,
  "password_hash" | "is_deleted" | "password_updated_at"
>;

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
  country: string | null;
  addressType: "Permanent" | "Communication";
}

export interface IRole {
  id: number;
  code: string;
}

export interface IUserRole {
  user_id: string;
  role_id: number;
}

export interface IUserCreatePayLoad {
  username: string;
  email: string;
  password: string;
  roles: (number | string)[];
  agencyId: string;
  profile: IUserProfile;
  phones: string[];
  addresses: {
    address: string;
    country: string;
    addressType: "Permanent" | "Communication";
  }[];
}

export interface PayloadCurrentUser {
  id: string;
  roles: string[];
}

export type UpdateUserPayload = Partial<IUser> & {
  profile?: IUserProfile;
  phone_numbers?: IUserPhoneNumber[];
  addresses?: IUserAddress[];
};
