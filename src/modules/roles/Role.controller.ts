import { Request, Response, NextFunction } from "express";
import RoleService from "./Role.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/AsyncHandler";
import { AppError } from "../../core/ErrorHandler";

export class RoleController {
    private roleService: RoleService;

    constructor() {
        this.roleService = new RoleService();
    }

    public create = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const role = await this.roleService.createRole(req.body);
            ApiResponse.success(res, role, "Role created successfully", 201);
        }
    );

    public getRole = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id, role } = req.query;
            if (!id && !role) {
                throw new AppError("Please provide either id or role name", 400);
            }

            const roleData = await this.roleService.getRole({
                id: id as string,
                role: role as string
            });

            if (!roleData) {
                throw new AppError("Role not found", 404);
            }

            ApiResponse.success(res, roleData, "Role fetched successfully");
        }
    );
}
