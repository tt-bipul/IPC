export interface IAgencyManagement {
    id: string;
    agency_id: string; 
    document_limit: number;
    terms_in_days: number;
    start_date: Date;
    end_date: Date;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}
