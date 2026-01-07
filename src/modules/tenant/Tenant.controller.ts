import { Request, Response, NextFunction } from 'express';
import { TenantService } from './Tenant.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/AsyncHandler';

export class TenantController {
    private tenantService: TenantService;

    constructor() {
        this.tenantService = new TenantService();
    }

    public create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const tenant = await this.tenantService.createTenant(req.body);
        ApiResponse.success(res, tenant, 'Tenant created successfully', 201);
    });

    public getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const tenants = await this.tenantService.getAllTenants();
        ApiResponse.success(res, tenants);
    });

    public getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const tenant = await this.tenantService.getTenantById(req.params.id);
        if (!tenant) {
            ApiResponse.error(res, 'Tenant not found', 404);
            return;
        }
        ApiResponse.success(res, tenant);
    });
}
