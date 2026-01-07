import { IBusinessRule, RuleType } from '../rules/BusinessRule.types';
import { ExtractedData } from '../ai/AIService';
import { ComparisonResult, ComparisonStatus, DocumentComparisonReport } from './Comparison.types';

export class ComparisonEngine {
    public compare(data: ExtractedData, rules: IBusinessRule[]): DocumentComparisonReport {
        const results: ComparisonResult[] = [];
        let failCount = 0;

        for (const rule of rules) {
            const extractedValue = data.fields[rule.field_name];

            if (extractedValue === undefined || extractedValue === null) {
                results.push({
                    field_name: rule.field_name,
                    extracted_value: null,
                    status: ComparisonStatus.MISSING,
                    rule_id: rule.id,
                    message: 'Field not found in document'
                });
                failCount++;
                continue;
            }

            const status = this.evaluateRule(extractedValue, rule);
            if (status !== ComparisonStatus.MATCH) {
                failCount++;
            }

            results.push({
                field_name: rule.field_name,
                extracted_value: extractedValue,
                status: status,
                rule_id: rule.id
            });
        }

        return {
            results,
            overall_status: failCount === 0 ? 'PASS' : 'FAIL'
        };
    }

    private evaluateRule(value: any, rule: IBusinessRule): ComparisonStatus {
        switch (rule.rule_type) {
            case RuleType.EXACT_MATCH:
                return ComparisonStatus.MATCH;

            case RuleType.NOT_EMPTY:
                return (value && value.toString().trim().length > 0) ? ComparisonStatus.MATCH : ComparisonStatus.MISMATCH;

            case RuleType.DATE_RANGE:
                return ComparisonStatus.MATCH;

            default:
                return ComparisonStatus.WARNING;
        }
    }
}
