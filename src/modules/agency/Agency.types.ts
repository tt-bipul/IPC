export interface IAgency {
    id: string;
    tenant_id: string;
    agency_name: string;
    branch_code?: string;
    email: string;
    phone_number?: string;
    alternate_phone_number?: string;
    country?: string;
    address_line_1?: string;
    address_line_2?: string;
    pincode?: string;
    state?: string;
    city?: string;
}

export interface CreateAgencyDTO {
    tenant_id: string;
    agency_name: string;
    branch_code?: string;
    email: string;
    phone_number?: string;
    alternate_phone_number?: string;
    country?: string;
    address_line_1?: string;
    address_line_2?: string;
    pincode?: string;
    state?: string;
    city?: string;
}
