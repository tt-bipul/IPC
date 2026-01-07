import { Request, Response, NextFunction } from 'express';
import { DocumentService } from './Document.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/AsyncHandler';
import { AuthRequest } from '../../middlewares/AuthMiddleware';

export class DocumentController {
    private documentService: DocumentService;

    constructor() {
        this.documentService = new DocumentService();
    }

    public upload = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthRequest;
        const files = req.files as Express.Multer.File[];
        const documents = await this.documentService.processUploads(files, authReq.user.id);
        ApiResponse.success(res, documents, 'Documents uploaded successfully', 201);
    });
}
