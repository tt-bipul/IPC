export interface ITenantSettings {
    ai_enabled: boolean;
    email_config?: any; 
}

export interface ITenant {
    id: string;
    name: string;
    company_email?: string;
    phone_number?: string;
    country?: string;
    address?: string;
    settings?: ITenantSettings;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface CreateTenantDTO {
    name: string;
    company_email?: string;
    phone_number?: string;
    country?: string;
    address?: string;
    settings?: ITenantSettings;
}
