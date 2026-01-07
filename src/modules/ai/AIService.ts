import { IDocument } from '../document/Document.types';

export interface ExtractedData {
    document_type: string;
    confidence: number;
    fields: { [key: string]: any };
}

export class AIService {
    public async extractData(documents: IDocument[]): Promise<ExtractedData[]> {
        return documents.map(doc => ({
            document_type: 'INSURANCE_POLICY',
            confidence: 0.95,
            fields: {
                policy_number: 'POL-123456789',
                policy_holder_name: 'John Doe',
                effective_date: '2025-01-01',
                expiration_date: '2026-01-01',
                premium_amount: 1200.00
            }
        }));
    }
}
