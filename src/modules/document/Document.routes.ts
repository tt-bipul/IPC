import { Router } from 'express';
import multer from 'multer';
import { DocumentController } from './Document.controller';
import { AuthMiddleware } from '../../middlewares/AuthMiddleware';
import { UserRole } from '../user/User.types';
import path from 'path';
import fs from 'fs';




export class DocumentRoutes {
    public router: Router;
    private documentController: DocumentController;
    private upload!: multer.Multer;

    constructor() {
        this.router = Router();
        this.documentController = new DocumentController();
        this.initializeStorage();
        this.initializeRoutes();
    }

    private initializeStorage() {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            }
        });

        this.upload = multer({
            storage: storage,
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (req, file, cb) => {
                const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type. Only PDF and Images are allowed.'));
                }
            }
        });
    }

    private initializeRoutes() {

        this.router.post('/upload',
            AuthMiddleware.authenticate,
            AuthMiddleware.restrictTo([UserRole.AGENCY_EXECUTIVE]),
            this.upload.array('documents', 3),
            this.documentController.upload
        );
    }
}
