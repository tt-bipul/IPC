import { IUser, UserRole } from './User.types';

export class User implements IUser {
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

    constructor(data: IUser) {
        this.id = data.id;
        this.tenant_id = data.tenant_id;
        this.agency_id = data.agency_id;
        this.username = data.username;
        this.user_role = data.user_role;
        this.first_name = data.first_name;
        this.middle_name = data.middle_name;
        this.last_name = data.last_name;
        this.email = data.email;
        this.phone_number = data.phone_number;
        this.country = data.country;
        this.address = data.address;
        this.password_hash = data.password_hash;
        this.is_active = data.is_active;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }
}
