export const TABLES = {
  ADDRESSES: "addresses",
  AGENCIES: "agencies",
  AGENCY_ADDRESSES: "agency_addresses",
  AGENCY_CONTACTS: "agency_contacts",
  CONTACTS: "contacts",
  LOCATIONS: "locations",
  PASSWORD_RESET_TOKENS: "password_reset_tokens",
  ROLES: "roles",
  USER_ADDRESSES: "user_addresses",
  USER_AGENCIES: "user_agencies",
  USER_PHONE_NUMBERS: "user_phone_numbers",
  USER_PROFILES: "user_profiles",
  USER_ROLES: "user_roles",
  USERS: "users"
} as const

export const COLUMNS = {
  ADDRESSES: {
    ID: "id",
    ADDRESS_LINE_1: "address_line_1",
    ADDRESS_LINE_2: "address_line_2",
    LOCATION_ID: "location_id",
    IS_ACTIVE: "is_active"
  },
  AGENCIES: {
    ID: "id",
    AGENCY_NAME: "agency_name",
    BRANCH_CODE: "branch_code",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at"
  },
  AGENCY_ADDRESSES: {
    AGENCY_ID: "agency_id",
    ADDRESS_ID: "address_id"
  },
  AGENCY_CONTACTS: {
    AGENCY_ID: "agency_id",
    CONTACT_ID: "contact_id"
  },
  CONTACTS: {
    ID: "id",
    EMAIL: "email",
    PHONE_NUMBER: "phone_number",
    ALTERNATE_PHONE_NUMBER: "alternate_phone_number",
    IS_ACTIVE: "is_active"
  },
  LOCATIONS: {
    ID: "id",
    CITY: "city",
    STATE: "state",
    COUNTRY: "country",
    PINCODE: "pincode"
  },
  PASSWORD_RESET_TOKENS: {
    ID: "id",
    USER_ID: "user_id",
    TOKEN: "token",
    EXPIRES_AT: "expires_at",
    USED_AT: "used_at",
    CREATED_AT: "created_at"
  },
  ROLES: {
    ID: "id",
    CODE: "code"
  },
  USER_ADDRESSES: {
    ID: "id",
    USER_ID: "user_id",
    ADDRESS: "address",
    COUNTRY: "country",
    ADDRESS_TYPE: "addressType"
  },
  USER_AGENCIES: {
    USER_ID: "user_id",
    AGENCY_ID: "agency_id",
    IS_ACTIVE: "is_active",
    ASSIGNED_AT: "assigned_at"
  },
  USER_PHONE_NUMBERS: {
    ID: "id",
    USER_ID: "user_id",
    PHONE_NUMBER: "phone_number"
  },
  USER_PROFILES: {
    USER_ID: "user_id",
    FIRST_NAME: "first_name",
    MIDDLE_NAME: "middle_name",
    LAST_NAME: "last_name"
  },
  USER_ROLES: {
    USER_ID: "user_id",
    ROLE_ID: "role_id"
  },
  USERS: {
    ID: "id",
    USERNAME: "username",
    EMAIL: "email",
    PASSWORD_HASH: "password_hash",
    IS_ACTIVE: "is_active",
    IS_DELETED: "is_deleted",
    LAST_LOGIN_AT: "last_login_at",
    PASSWORD_UPDATED_AT: "password_updated_at",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at"
  }
} as const

export type TableName = typeof TABLES[keyof typeof TABLES]
export type ColumnMap = typeof COLUMNS
export type ColumnName<T extends keyof ColumnMap> = ColumnMap[T][keyof ColumnMap[T]]

