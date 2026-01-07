import { Request, Response, NextFunction } from 'express';
import { UserService } from './User.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/AsyncHandler';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const user = await this.userService.register(req.body);
        ApiResponse.success(res, {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.user_role
            }
        }, 'User registered successfully', 201);
    });

    public login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
        const user = await this.userService.login(email, password);
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username,
            user_role: user.user_role,
            tenant_id: user.tenant_id,
            agency_id: user.agency_id
        }, env.jwtSecret, { expiresIn: '1d' });

        ApiResponse.success(res, { token }, 'Login successful');
    });
}
