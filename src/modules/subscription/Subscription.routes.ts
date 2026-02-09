import { Router } from "express";
import { SubscriptionController } from "./Subscription.controller";
import { AuthMiddleware } from "../../middlewares/AuthMiddleware";
import { UserRole } from "../user/User.types";

export class SubscriptionRoutes {
  public router: Router;
  private controller = new SubscriptionController();

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/plans",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo([UserRole.SUPER_ADMIN]),
      this.controller.createPlan,
    );
    this.router.get(
      "/usage",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN", "VP", "AGENT"]),
      this.controller.getUsage,
    );
    this.router.get("/plans", this.controller.listActivePlans);
    this.router.get("/plans/:id", this.controller.getPlanById);
    this.router.put(
      "/plans/:id",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo([UserRole.SUPER_ADMIN]),
      this.controller.updatePlan,
    );
    this.router.delete(
      "/plans/:id",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo([UserRole.SUPER_ADMIN]),
      this.controller.softDisablePlan,
    );
  }
}
export class AgencySubscriptionRoutes {
  public router: Router;
  private controller = new SubscriptionController();

  constructor() {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/:agencyId/subscriptions",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo([UserRole.SUPER_ADMIN]),
      this.controller.assignSubscription,
    );
    this.router.get(
      "/:agencyId/subscriptions/current",
      AuthMiddleware.authenticate,
      this.controller.getActiveSubscription,
    );
    this.router.get(
      "/:agencyId/subscriptions/history",
      this.controller.getSubscriptionHistory,
    );
    this.router.get("/:agencyId/usage", this.controller.getUsage);
  }
}
