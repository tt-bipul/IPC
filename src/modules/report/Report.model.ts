import { IReport } from './Report.types';

export class Report implements IReport {
    id: string;
    tenant_id: string;
    agency_id: string;
    agent_id: string;
    document_set_id?: string;
    version: number;
    generated_by_ai_version?: string;
    status: string;
    extracted_data: string;
    comparison_result: string;
    pdf_path: string;
    created_at?: Date;
    updated_at?: Date;

    constructor(data: IReport) {
        this.id = data.id;
        this.tenant_id = data.tenant_id;
        this.agency_id = data.agency_id;
        this.agent_id = data.agent_id;
        this.document_set_id = data.document_set_id;
        this.version = data.version;
        this.generated_by_ai_version = data.generated_by_ai_version;
        this.status = data.status;
        this.extracted_data = data.extracted_data;
        this.comparison_result = data.comparison_result;
        this.pdf_path = data.pdf_path;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }
}
