import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../core/ErrorHandler';

export interface AuthRequest extends Request {
    user?: any;
}

export class AuthMiddleware {
    public static authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new AppError('Authentication failed: No token provided', 401);
            }

            const decoded = jwt.verify(token, env.jwtSecret);
            req.user = decoded;
            next();
        } catch (error) {
            next(new AppError('Authentication failed: Invalid token', 401));
        }
    }

    public static restrictTo(roles: string[]) {
        return (req: AuthRequest, res: Response, next: NextFunction) => {
            if (!req.user || !roles.includes(req.user.user_role)) {
                return next(new AppError('You do not have permission to perform this action', 403));
            }
            next();
        };
    }
}
