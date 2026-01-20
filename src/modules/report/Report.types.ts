export interface IReport {
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
}
