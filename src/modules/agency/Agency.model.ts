import { IAgency } from './Agency.types';

export class Agency implements IAgency {
    id: string;
    tenant_id?: string;
    agency_name: string;
    branch_code?: string | null;
    is_active: boolean;
    vp_user_id?: string | null;
    created_at: Date;
    updated_at: Date;

    constructor(data: IAgency) {
        this.id = data.id;
        this.tenant_id = data.tenant_id; // Note: IAgency doesn't seem to have tenant_id in interface? Checking...
        this.agency_name = data.agency_name;
        this.branch_code = data.branch_code;
        this.is_active = data.is_active;
        this.vp_user_id = data.vp_user_id;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }
}
