import { Response } from 'express';

export class ApiResponse {
    public static success(res: Response, data: any, message: string = 'Success', statusCode: number = 200): void {
        res.status(statusCode).json({
            status: 'success',
            message,
            data,
        });
    }
    public static error(res: Response, message: string, statusCode: number = 500): void {
        res.status(statusCode).json({
            status: 'error',
            message,
        });
    }
}
