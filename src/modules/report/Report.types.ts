export interface IReport {
    id: string;
    agent_id: string;
    status: string;
    extracted_data: string;
    comparison_result: string;
    pdf_path: string;
    created_at?: Date;
}
