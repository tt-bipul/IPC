import { IDocument } from './Document.types';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../core/ErrorHandler';

export class DocumentService {
    public async processUploads(files: Express.Multer.File[], userId: string): Promise<IDocument[]> {
        if (!files || files.length === 0) {
            throw new AppError('No files uploaded', 400);
        }

        return files.map(file => ({
            id: uuidv4(),
            original_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
            path: file.path,
            uploaded_by: userId
        }));
    }
}
