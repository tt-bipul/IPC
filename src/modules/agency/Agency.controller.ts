import { Request, Response } from "express";
import { AgencyService } from "./Agency.service";
import { HttpStatus } from "../../constants/HttpStatus";
import { AppError } from "../../core/ErrorHandler";
import { Logger } from "../../core/Logger";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/AsyncHandler";
import { UserRole } from "../../modules/user/User.types";

export class AgencyController {
  private service = new AgencyService();

  createAgency = asyncHandler(async (req: Request, res: Response) => {
    const id = await this.service.createAgency(req.body);
    Logger.info("Agency created", { agencyId: id });
    ApiResponse.success(
      res,
      { id },
      "Agency created successfully",
      HttpStatus.CREATED,
    );
  });

  updateAgency = asyncHandler(async (req: any, res: Response) => {
    let agencyId;
    if (req.user?.roles?.includes(UserRole.VP)) {
      const id = await this.service.getAgenciesByUserId(req.user.id);
      if (id.length === 0) {
        throw new AppError(
          "VP user has no agency assigned, contact Administrator",
          HttpStatus.FORBIDDEN,
        );
      }
      agencyId = id[0].agency_id;
    }
    if (req.user?.roles?.includes(UserRole.SUPER_ADMIN)) {
      agencyId = req.params.id;
    }
    const updatedAgency = await this.service.updateAgency(agencyId, req.body);

    Logger.info("Agency updated", { agencyId: agencyId });

    ApiResponse.success(
      res,
      updatedAgency,
      "Agency updated successfully",
      HttpStatus.OK,
    );
  });

  deleteAgency = asyncHandler(async (req: Request, res: Response) => {
    await this.service.softDeleteAgency(req.params.id);
    Logger.info("Agency soft deleted", { agencyId: req.params.id });
    ApiResponse.success(
      res,
      null,
      "Agency deleted successfully",
      HttpStatus.OK,
    );
  });

  getAgencyById = asyncHandler(async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === "true";
    const data = await this.service.getAgencyById(
      req.params.id,
      includeInactive,
    );

    if (!data) {
      throw new AppError("Agency not found", HttpStatus.NOT_FOUND);
    }

    ApiResponse.success(res, data);
  });

  assignUser = asyncHandler(async (req: Request, res: Response) => {
    await this.service.assignUserToAgency(req.body);
    Logger.info("User assigned to agency", req.body);
    ApiResponse.success(
      res,
      null,
      "User assigned to agency successfully",
      HttpStatus.OK,
    );
  });

  deactivateUserAgency = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deactivateUserAgency(
      req.params.userId,
      req.params.agencyId,
    );
    Logger.info("User-agency deactivated", {
      userId: req.params.userId,
      agencyId: req.params.agencyId,
    });
    ApiResponse.success(
      res,
      null,
      "User deactivated for agency successfully",
      HttpStatus.OK,
    );
  });

  getAllAgencies = asyncHandler(async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === "true";
    const data = await this.service.getAllAgencies(includeInactive);
    ApiResponse.success(res, data);
  });
}
