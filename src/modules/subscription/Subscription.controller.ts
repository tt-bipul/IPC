import { Request, Response } from "express";
import { SubscriptionService } from "./Subscription.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/AsyncHandler";
import { AppError } from "../../core/ErrorHandler";
import { UserRole } from "../user/User.types";
import { AgencyReadRepository } from "../agency/Repositories/read.repository";

export class SubscriptionController {
  private service = new SubscriptionService();

  public createPlan = asyncHandler(async (req: Request, res: Response) => {
    const { code, name, max_documents, validity_days, price } = req.body;

    // Basic validation (could be moved to Joi/Zod validator)
    if (
      !code ||
      !name ||
      max_documents === undefined ||
      validity_days === undefined ||
      price === undefined
    ) {
      throw new AppError("Missing required fields", 400);
    }

    const plan = await this.service.createPlan(req.body);
    ApiResponse.success(res, plan, "Subscription plan created", 201);
  });

  public listActivePlans = asyncHandler(async (req: Request, res: Response) => {
    const plans = await this.service.getAllActivePlans();
    ApiResponse.success(res, plans);
  });

  public getPlanById = asyncHandler(async (req: Request, res: Response) => {
    const plan = await this.service.getPlanById(Number(req.params.id));
    ApiResponse.success(res, plan);
  });

  public updatePlan = asyncHandler(async (req: Request, res: Response) => {
    await this.service.updatePlan(Number(req.params.id), req.body);
    ApiResponse.success(res, null, "Subscription plan updated");
  });

  public softDisablePlan = asyncHandler(async (req: Request, res: Response) => {
    await this.service.softDisablePlan(Number(req.params.id));
    ApiResponse.success(res, null, "Subscription plan disabled");
  });

  public assignSubscription = asyncHandler(
    async (req: Request, res: Response) => {
      const { subscription_plan_id } = req.body;
      const agencyId = req.params.agencyId;

      if (!subscription_plan_id) {
        throw new AppError("subscription_plan_id is required", 400);
      }

      await this.service.assignSubscription(agencyId, subscription_plan_id);
      ApiResponse.success(res, null, "Subscription assigned successfully", 201);
    },
  );

  public getActiveSubscription = asyncHandler(
    async (req: Request, res: Response) => {
      const subscription = await this.service.getActiveSubscription(
        req.params.agencyId,
      );
      ApiResponse.success(res, subscription);
    },
  );

  public getSubscriptionHistory = asyncHandler(
    async (req: Request, res: Response) => {
      const history = await this.service.getHistory(req.params.agencyId);
      ApiResponse.success(res, history);
    },
  );

  public getUsage = asyncHandler(async (req: any, res: Response) => {
    const { agencyId } = req.params;
    const { page, limit, search } = req.query;
    const currentUser = req.user;
    if (agencyId) {
      if (
        currentUser.roles.includes(UserRole.VP) ||
        currentUser.roles.includes(UserRole.AGENT)
      ) {
        const AgencyReadRepo = new AgencyReadRepository();
        const agencies = await AgencyReadRepo.getAgenciesByUserId(
          currentUser.id,
          false,
        );
        if (!agencies || agencies.length === 0) {
          throw new AppError("No agency assigned to this user", 404);
        }
        const vpAgencyId = agencies[0].agency_id;
        if (agencyId !== vpAgencyId) {
          throw new AppError(
            "You are not authorized to view this agency's usage",
            403,
          );
        }
        const usage = await this.service.getUsage(vpAgencyId);
        ApiResponse.success(res, usage);
        return;
      }
      const usage = await this.service.getUsage(agencyId);
      ApiResponse.success(res, usage);
      return;
    }
    if (currentUser.roles.includes(UserRole.SUPER_ADMIN)) {
      const result = await this.service.getAllAgenciesUsage({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search: search as string,
      });
      ApiResponse.success(res, result);
    } else if (
      currentUser.roles.includes(UserRole.VP) ||
      currentUser.roles.includes(UserRole.AGENT)
    ) {
      const AgencyReadRepo = new AgencyReadRepository();
      const agencies = await AgencyReadRepo.getAgenciesByUserId(
        currentUser.id,
        false,
      );

      if (!agencies || agencies.length === 0) {
        throw new AppError("No agency assigned to this VP", 404);
      }

      const vpAgencyId = agencies[0].agency_id;
      const usage = await this.service.getUsage(vpAgencyId);
      ApiResponse.success(res, usage);
    } else {
      throw new AppError("You do not have permission to view usage data", 403);
    }
  });
}
