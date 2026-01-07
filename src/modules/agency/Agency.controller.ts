import { Request, Response, NextFunction } from 'express';
import { AgencyService } from './Agency.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/AsyncHandler';

export class AgencyController {
    private agencyService: AgencyService;

    constructor() {
        this.agencyService = new AgencyService();
    }

    public create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const agency = await this.agencyService.createAgency(req.body);
        ApiResponse.success(res, agency, 'Agency created successfully', 201);
    });

    public getByTenant = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const agencies = await this.agencyService.getAgenciesByTenant(req.params.tenantId);
        ApiResponse.success(res, agencies);
    });

    public getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const agency = await this.agencyService.getAgencyById(req.params.id);
        if (!agency) {
            ApiResponse.error(res, 'Agency not found', 404);
            return;
        }
        ApiResponse.success(res, agency);
    });
}
