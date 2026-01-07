export enum UserRole {
    TENANT_ADMIN = 'TENANT_ADMIN',
    VP = 'VP',
    AGENCY_EXECUTIVE = 'AGENCY_EXECUTIVE'
}

export interface IUser {
    id: string;
    tenant_id?: string;
    agency_id?: string;
    username: string;
    user_role: UserRole;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    phone_number?: string;
    country?: string;
    address?: string;
    password_hash: string;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface CreateUserDTO {
    tenant_id?: string;
    agency_id?: string;
    username: string;
    user_role: UserRole;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    phone_number?: string;
    country?: string;
    address?: string;
    password: string;
}

export interface UserResponseDTO {
    id: string;
    username: string;
    email: string;
    user_role: UserRole;
    first_name: string;
    last_name: string;
    tenant_id?: string;
    agency_id?: string;
    is_active: boolean;
}
