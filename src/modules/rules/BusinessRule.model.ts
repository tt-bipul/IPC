import { IBusinessRule, RuleType } from './BusinessRule.types';

export class BusinessRule implements IBusinessRule {
    id: string;
    tenant_id: string;
    agency_id: string;
    field_name: string;
    rule_type: RuleType;
    criteria?: any;
    created_at?: Date;
    updated_at?: Date;

    constructor(data: IBusinessRule) {
        this.id = data.id;
        this.tenant_id = data.tenant_id;
        this.agency_id = data.agency_id;
        this.field_name = data.field_name;
        this.rule_type = data.rule_type;
        this.criteria = data.criteria;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }
}
