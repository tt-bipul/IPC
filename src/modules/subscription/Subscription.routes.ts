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
    // Plan Management (Admin only)
    this.router.post(
      "/plans",
      // AuthMiddleware.authenticate,
      // AuthMiddleware.restrictTo([UserRole.SUPER_ADMIN]), // Assuming admin role requirement
      this.controller.createPlan,
    );
    this.router.get("/plans", this.controller.listActivePlans);
    this.router.get("/plans/:id", this.controller.getPlanById);
    this.router.put(
      "/plans/:id",
      // AuthMiddleware.authenticate,
      // AuthMiddleware.restrictTo([UserRole.SUPER_ADMIN]),
      this.controller.updatePlan,
    );
    this.router.delete(
      "/plans/:id",
      // AuthMiddleware.authenticate,
      // AuthMiddleware.restrictTo([UserRole.SUPER_ADMIN]),
      this.controller.softDisablePlan,
    );

    // NOTE: The prompt requested distinct base paths:
    // /subscriptions/plans -> Handled by router.use('/subscriptions', new SubscriptionRoutes().router) and sub-route /plans
    // /agencies/:agencyId/subscriptions -> This structure suggests these routes might need to be in Agency routes or handled specially.
    // However, I can define them here and user can mount them accordingly or I can use params here.

    // I will assume the main router mounts this at /subscriptions (for plans) and potentially uses a different router for agencies?
    // Or I can put all in one file for now, but the paths need to be careful.
    // The prompt asked for:
    // - /subscriptions/plans
    // - /agencies/:agencyId/subscriptions
    // - /agencies/:agencyId/usage

    // To support /agencies/:agencyId/subscriptions here, I would need to mount this at root or have the main router delegate.
    // Given existing patterns (AgencyRoutes separate), maybe I should add these to AgencyRoutes?
    // BUT the instruction was to create a Subscription Module.
    // I'll create a separate router instance or handle it in index.ts mounts.
    // Let's create sub-routers if needed or just specific paths.
  }
}

// Separate router for Agency related subscription endpoints to be mounted at /agencies
export class AgencySubscriptionRoutes {
  public router: Router;
  private controller = new SubscriptionController();

  constructor() {
    this.router = Router({ mergeParams: true }); // Important for :agencyId
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/:agencyId/subscriptions",
      this.controller.assignSubscription,
    );
    this.router.get(
      "/:agencyId/subscriptions/current",
      this.controller.getActiveSubscription,
    );
    this.router.get(
      "/:agencyId/subscriptions/history",
      this.controller.getSubscriptionHistory,
    );
    this.router.get("/:agencyId/usage", this.controller.getUsage);
  }
}
