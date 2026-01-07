export interface ITenant {
    id: string;
    name: string;
    company_email?: string;
    phone_number?: string;
    country?: string;
    address?: string;
}

export interface CreateTenantDTO {
    name: string;
    company_email?: string;
    phone_number?: string;
    country?: string;
    address?: string;
}
