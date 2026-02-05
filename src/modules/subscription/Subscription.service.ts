import { SubscriptionRepository } from "./Subscription.repository";
import {
  ISubscriptionPlan,
  IAgencySubscription,
  AgencyUsageStats,
} from "./Subscription.types";
import { AppError } from "../../core/ErrorHandler";

export class SubscriptionService {
  private repository = new SubscriptionRepository();

  async createPlan(plan: ISubscriptionPlan): Promise<ISubscriptionPlan> {
    return await this.repository.createPlan(plan);
  }

  async getAllActivePlans(): Promise<ISubscriptionPlan[]> {
    return await this.repository.getAllActivePlans();
  }

  async getPlanById(id: number): Promise<ISubscriptionPlan> {
    const plan = await this.repository.getPlanById(id);
    if (!plan) {
      throw new AppError("Subscription plan not found", 404);
    }
    return plan;
  }

  async updatePlan(
    id: number,
    updates: Partial<ISubscriptionPlan>,
  ): Promise<void> {
    await this.getPlanById(id); // Ensure exists
    await this.repository.updatePlan(id, updates);
  }

  async softDisablePlan(id: number): Promise<void> {
    await this.getPlanById(id); // Ensure exists
    await this.repository.updatePlan(id, { is_active: false });
  }

  async assignSubscription(agencyId: string, planId: number): Promise<void> {
    const plan = await this.getPlanById(planId);
    if (!plan.is_active) {
      throw new AppError("Cannot assign an inactive plan", 400);
    }

    // Deactivate existing subscriptions
    await this.repository.deactivateSubscriptions(agencyId);

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.validity_days);

    // Create new subscription
    const subscription: IAgencySubscription = {
      agency_id: agencyId,
      subscription_plan_id: planId,
      start_date: startDate,
      end_date: endDate,
      is_active: true,
    };

    const subscriptionId =
      await this.repository.createAgencySubscription(subscription);

    // Create usage record
    await this.repository.createUsageRecord({
      agency_id: agencyId,
      subscription_id: subscriptionId,
      documents_processed: 0,
      last_processed_at: null as any,
    });
  }

  async getActiveSubscription(
    agencyId: string,
  ): Promise<IAgencySubscription | null> {
    return await this.repository.getActiveSubscription(agencyId);
  }

  async getHistory(agencyId: string): Promise<IAgencySubscription[]> {
    return await this.repository.getHistory(agencyId);
  }

  async getUsage(agencyId: string): Promise<AgencyUsageStats> {
    const subscription = await this.repository.getActiveSubscription(agencyId);
    if (!subscription) {
      throw new AppError("No active subscription found for this agency", 404);
    }

    const plan = await this.getPlanById(subscription.subscription_plan_id);
    const usage = await this.repository.getUsage(agencyId, subscription.id!); // subscription.id should exist after DB fetch

    if (!usage) {
      // Should not happen if business rules are followed
      throw new AppError("Usage record missing for active subscription", 500);
    }

    return {
      documents_processed: usage.documents_processed,
      max_documents: plan.max_documents,
      remaining_documents: plan.max_documents - usage.documents_processed,
      subscription_start_date: subscription.start_date,
      subscription_end_date: subscription.end_date,
    };
  }
}
