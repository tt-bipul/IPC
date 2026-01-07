import { ITenant } from './Tenant.types';

export class Tenant implements ITenant {
    id: string;
    name: string;
    company_email?: string;
    phone_number?: string;
    country?: string;
    address?: string;

    constructor(data: ITenant) {
        this.id = data.id;
        this.name = data.name;
        this.company_email = data.company_email;
        this.phone_number = data.phone_number;
        this.country = data.country;
        this.address = data.address;
    }
}
