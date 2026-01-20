export enum RuleType {
    EXACT_MATCH = 'EXACT_MATCH',
    DATE_RANGE = 'DATE_RANGE',
    NOT_EMPTY = 'NOT_EMPTY',
    REGEX = 'REGEX'
}

export interface IBusinessRule {
    id: string;
    tenant_id: string;
    agency_id: string;
    field_name: string;
    rule_type: RuleType;
    criteria?: any;
    rule_priority: number;
    version: number;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface CreateRuleDTO {
    agency_id: string;
    field_name: string;
    rule_type: RuleType;
    criteria?: any;
    rule_priority?: number;
    version?: number;
}
