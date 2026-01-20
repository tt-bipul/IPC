import { Request, Response, NextFunction } from "express";
import { RoleService } from "./Role.service";
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
            const roleId = await this.roleService.createRole(req.body.code);
            ApiResponse.success(res, { id: roleId }, "Role created successfully", 201);
        }
    );

    public getRole = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id, code } = req.query;

            if (!id && !code) {
                const roles = await this.roleService.getAllRoles();
                return ApiResponse.success(res, roles, "Roles fetched successfully");
            }

            const roleData = await this.roleService.getRole(id ? Number(id) : (code as string));

            if (!roleData) {
                throw new AppError("Role not found", 404);
            }

            ApiResponse.success(res, roleData, "Role fetched successfully");
        }
    );

    public updateRole = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const { code } = req.body;
            await this.roleService.updateRole(Number(id), code);
            ApiResponse.success(res, null, "Role updated successfully");
        }
    );

    public assignRole = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            await this.roleService.assignRole(req.body);
            ApiResponse.success(res, null, "Role assigned successfully");
        }
    );

    public removeRole = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            await this.roleService.removeRole(req.body);
            ApiResponse.success(res, null, "Role removed successfully");
        }
    );
}
