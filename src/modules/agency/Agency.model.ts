import { IAgency } from './Agency.types';

export class Agency implements IAgency {
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

    constructor(data: IAgency) {
        this.id = data.id;
        this.tenant_id = data.tenant_id;
        this.agency_name = data.agency_name;
        this.branch_code = data.branch_code;
        this.email = data.email;
        this.phone_number = data.phone_number;
        this.alternate_phone_number = data.alternate_phone_number;
        this.country = data.country;
        this.address_line_1 = data.address_line_1;
        this.address_line_2 = data.address_line_2;
        this.pincode = data.pincode;
        this.state = data.state;
        this.city = data.city;
    }
}
