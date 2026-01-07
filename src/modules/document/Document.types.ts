export interface IDocument {
    id: string;
    original_name: string;
    mime_type: string;
    size: number;
    path: string;
    uploaded_by: string;
    created_at?: Date;
}
