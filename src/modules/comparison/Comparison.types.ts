import { ExtractedData } from '../ai/AIService';
import { IBusinessRule } from '../rules/BusinessRule.types';

export enum ComparisonStatus {
    MATCH = 'MATCH',
    MISMATCH = 'MISMATCH',
    MISSING = 'MISSING',
    WARNING = 'WARNING'
}

export interface ComparisonResult {
    field_name: string;
    extracted_value: any;
    status: ComparisonStatus;
    rule_id?: string;
    message?: string;
}

export interface DocumentComparisonReport {
    document_id?: string;
    results: ComparisonResult[];
    overall_status: 'PASS' | 'FAIL' | 'REVIEW';
}
