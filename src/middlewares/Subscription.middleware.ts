import { Request, Response, NextFunction } from "express";
import { SubscriptionRepository } from "../modules/subscription/Subscription.repository";
import { AppError } from "../core/ErrorHandler";
import { asyncHandler } from "../utils/AsyncHandler";

export class SubscriptionMiddleware {
  private static subRepo = new SubscriptionRepository();

  static validateActiveSubscription = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const agencyId = req.params.agencyId || req.body.agency_id;

      if (!agencyId) {
        // If agencyId is not found, we can't validate specific subscription.
        // Depending on route, this might be OK or Error.
        // For now, if we are using this middleware, we expect agencyId.
        return next(
          new AppError("Agency ID required for subscription validation", 400),
        );
      }

      const subscription =
        await SubscriptionMiddleware.subRepo.getActiveSubscription(agencyId);

      if (!subscription) {
        return next(
          new AppError("Agency does not have an active subscription", 403),
        );
      }

      const now = new Date();
      if (now < subscription.start_date || now > subscription.end_date) {
        return next(new AppError("Subscription is expired", 403));
      }

      // Attach subscription to request if needed
      (req as any).subscription = subscription;
      next();
    },
  );
}
