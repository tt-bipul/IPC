export interface IAgencyContact {
    id?: string;
    agency_id?: string;
    name: string;
    email: string;
    phone_number: string;
    designation?: string;
    is_primary: boolean;
}

export interface IAgencyAddress {
    id?: string;
    
    
    address_line_1: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    type?: string; 
}

export interface IAgency {
    id: string;
    tenant_id: string;
    vp_user_id?: string;
    agency_name: string;
    branch_code?: string;
    email: string; 
    phone_number?: string;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;

    
    contacts?: IAgencyContact[];
    addresses?: IAgencyAddress[];
}

export interface CreateAgencyDTO {
    tenant_id: string;
    vp_user_id?: string;
    agency_name: string;
    branch_code?: string;
    email: string;
    phone_number?: string;

    contacts?: {
        name: string;
        email: string;
        phone_number: string;
        designation?: string;
        is_primary: boolean;
    }[];

    addresses?: {
        address_line_1: string;
        address_line_2?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
        type?: string;
    }[];
}
