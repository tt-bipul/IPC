import { Request, Response, NextFunction } from "express";
import { AgencyService } from "./Agency.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/AsyncHandler";
import { AppError } from "../../core/ErrorHandler";

export class AgencyController {
  private agencyService: AgencyService;

  constructor(agencyService?: AgencyService) {
    this.agencyService = agencyService || new AgencyService();
  }

  public create = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const agency = await this.agencyService.createAgency(req.body);
      ApiResponse.success(res, agency, "Agency created successfully", 201);
    }
  );

  public getByTenant = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const agencies = await this.agencyService.getAgenciesByTenant(
        req.params.tenantId
      );
      ApiResponse.success(res, agencies);
    }
  );

  public getAllAgencies = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const agencies = await this.agencyService.getAllAgencies();
      if (!agencies) {
        ApiResponse.error(res, "No agencies found", 404);
      }
      ApiResponse.success(res, agencies);
    }
  );

  public getById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      const userRoles = user?.roles || [];
      if (
        userRoles.includes("VP") &&
        user.vp_agency_id !== req.params.id
      ) {
        return next(new AppError("You do not have permission to view this agency", 403));
      }
      const agency = await this.agencyService.getAgencyById(req.params.id);
      if (!agency) {
        ApiResponse.error(res, "Agency not found", 404);
        return;
      }
      ApiResponse.success(res, agency);
    }
  );
}
