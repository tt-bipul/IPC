import { Database } from "../../core/Database";
import QueryBuilder from "../../core/QueryBuilder";
import {
  ISubscriptionPlan,
  IAgencySubscription,
  IAgencyDocumentUsage,
} from "./Subscription.types";

export class SubscriptionRepository {
  private db = Database.getInstance();

  async createPlan(plan: ISubscriptionPlan): Promise<ISubscriptionPlan> {
    const query = QueryBuilder.insert("subscription_plans")
      .data({
        code: plan.code,
        name: plan.name,
        max_documents: plan.max_documents,
        validity_days: plan.validity_days,
        price: plan.price,
        is_active: true,
      })
      .build();

    const result = await this.db.query<any>(query.sql, query.params);
    return { ...plan, id: result.insertId };
  }

  async getAllActivePlans(): Promise<ISubscriptionPlan[]> {
    const query = QueryBuilder.selectAll()
      .from("subscription_plans")
      .where("is_active", true)
      .build();

    return await this.db.query<ISubscriptionPlan[]>(query.sql, query.params);
  }

  async getPlanById(id: number): Promise<ISubscriptionPlan | null> {
    const query = QueryBuilder.selectAll()
      .from("subscription_plans")
      .where("id", id)
      .build();

    const results = await this.db.query<ISubscriptionPlan[]>(
      query.sql,
      query.params,
    );
    return results.length > 0 ? results[0] : null;
  }

  async updatePlan(
    id: number,
    updates: Partial<ISubscriptionPlan>,
  ): Promise<void> {
    const qb = QueryBuilder.update("subscription_plans");

    if (updates.name) qb.set("name", updates.name);
    if (updates.max_documents) qb.set("max_documents", updates.max_documents);
    if (updates.validity_days) qb.set("validity_days", updates.validity_days);
    if (updates.price) qb.set("price", updates.price);
    if (updates.is_active !== undefined) qb.set("is_active", updates.is_active);

    const query = qb.where("id", id).build();
    await this.db.query(query.sql, query.params);
  }

  async createAgencySubscription(
    subscription: IAgencySubscription,
  ): Promise<number> {
    const query = QueryBuilder.insert("agency_subscriptions")
      .data({
        agency_id: subscription.agency_id,
        subscription_plan_id: subscription.subscription_plan_id,
        start_date: subscription.start_date
          .toISOString()
          .slice(0, 19)
          .replace("T", " "),
        end_date: subscription.end_date
          .toISOString()
          .slice(0, 19)
          .replace("T", " "),
        is_active: subscription.is_active,
      })
      .build();

    const result = await this.db.query<any>(query.sql, query.params);
    return result.insertId;
  }

  async deactivateSubscriptions(agencyId: string): Promise<void> {
    const query = QueryBuilder.update("agency_subscriptions")
      .set("is_active", false)
      .where("agency_id", agencyId)
      .where("is_active", true)
      .build();

    await this.db.query(query.sql, query.params);
  }

  async getActiveSubscription(
    agencyId: string,
  ): Promise<IAgencySubscription | null> {
    const query = QueryBuilder.selectAll()
      .from("agency_subscriptions")
      .where("agency_id", agencyId)
      .where("is_active", true)
      .build();

    const results = await this.db.query<IAgencySubscription[]>(
      query.sql,
      query.params,
    );
    return results.length > 0 ? results[0] : null;
  }

  async getHistory(agencyId: string): Promise<IAgencySubscription[]> {
    const query = QueryBuilder.selectAll()
      .from("agency_subscriptions")
      .where("agency_id", agencyId)
      .orderBy("created_at", "DESC")
      .build();

    return await this.db.query<IAgencySubscription[]>(query.sql, query.params);
  }

  async createUsageRecord(usage: IAgencyDocumentUsage): Promise<void> {
    const query = QueryBuilder.insert("agency_document_usage")
      .data({
        agency_id: usage.agency_id,
        subscription_id: usage.subscription_id,
        documents_processed: usage.documents_processed,
        last_processed_at: null,
      })
      .build();

    await this.db.query(query.sql, query.params);
  }

  async getUsage(
    agencyId: string,
    subscriptionId: number,
  ): Promise<IAgencyDocumentUsage | null> {
    const query = QueryBuilder.selectAll()
      .from("agency_document_usage")
      .where("agency_id", agencyId)
      .where("subscription_id", subscriptionId)
      .build();

    const results = await this.db.query<IAgencyDocumentUsage[]>(
      query.sql,
      query.params,
    );
    return results.length > 0 ? results[0] : null;
  }
}
