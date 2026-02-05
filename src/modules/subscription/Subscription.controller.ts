import { Request, Response } from "express";
import { SubscriptionService } from "./Subscription.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/AsyncHandler";
import { AppError } from "../../core/ErrorHandler";

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

  public getUsage = asyncHandler(async (req: Request, res: Response) => {
    const usage = await this.service.getUsage(req.params.agencyId);
    ApiResponse.success(res, usage);
  });
}
