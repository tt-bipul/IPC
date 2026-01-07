import { IReport } from './Report.types';

export class Report implements IReport {
    id: string;
    agent_id: string;
    status: string;
    extracted_data: string;
    comparison_result: string;
    pdf_path: string;
    created_at?: Date;

    constructor(data: IReport) {
        this.id = data.id;
        this.agent_id = data.agent_id;
        this.status = data.status;
        this.extracted_data = data.extracted_data;
        this.comparison_result = data.comparison_result;
        this.pdf_path = data.pdf_path;
        this.created_at = data.created_at;
    }
}
