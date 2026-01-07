import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/ErrorHandler';
import { Logger } from '../core/Logger';

export class ErrorMiddleware {
    public static handle(err: Error, req: Request, res: Response, next: NextFunction): void {
        Logger.error(err.message, err);

        if (err instanceof AppError) {
            res.status(err.statusCode).json({
                status: 'error',
                message: err.message,
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Internal Server Error',
            });
        }
    }
}
