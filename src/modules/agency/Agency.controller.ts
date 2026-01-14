import { Request, Response, NextFunction } from "express";
import { AgencyService } from "./Agency.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/AsyncHandler";
import { AppError } from "../../core/ErrorHandler";

export class AgencyController {
  private service: AgencyService;

  constructor(agencyService?: AgencyService) {
    this.service = agencyService || new AgencyService();
  }

  public createAgency = asyncHandler(async (req: Request, res: Response) => {
    const id = await this.service.createAgency(req.body);
    ApiResponse.success(res, { id }, "Agency created", 201);
  });

  public updateAgency = asyncHandler(async (req: Request, res: Response) => {
    await this.service.updateAgency(req.params.id, req.body);
    ApiResponse.success(res, null, "Agency updated");
  });

  public deleteAgency = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteAgency(req.params.id);
    ApiResponse.success(res, null, "Agency deleted");
  });

  public assignUserToAgency = asyncHandler(
    async (req: Request, res: Response) => {
      const { user_id, agency_id } = req.body;
      await this.service.assignUserToAgency(user_id, agency_id);
      ApiResponse.success(res, null, "User assigned to agency");
    }
  );

  public removeUserFromAgency = asyncHandler(
    async (req: Request, res: Response) => {
      const { user_id, agency_id } = req.body;
      await this.service.removeUserFromAgency(user_id, agency_id);
      ApiResponse.success(res, null, "User removed from agency");
    }
  );
}
