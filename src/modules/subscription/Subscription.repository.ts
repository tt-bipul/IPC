import { Database } from "../../core/Database";
import QueryBuilder from "../../core/QueryBuilder";
import {
  ISubscriptionPlan,
  IAgencySubscription,
  IAgencyDocumentUsage,
  ISubscriptionHistoryItem,
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

  async getHistory(agencyId: string): Promise<ISubscriptionHistoryItem[]> {
    const query = QueryBuilder.selectAll()
      .select([
        "agency_subscriptions.id",
        "agency_subscriptions.agency_id",
        "subscription_plans.name as plan_name",
        "subscription_plans.price",
        "agency_subscriptions.start_date",
        "agency_subscriptions.end_date",
        "agency_subscriptions.is_active",
        "COALESCE(agency_document_usage.documents_processed, 0) as documents_usage",
      ])
      .from("agency_subscriptions")
      .join(
        "subscription_plans",
        "agency_subscriptions.subscription_plan_id",
        "=",
        "subscription_plans.id",
      )
      .join(
        "agency_document_usage",
        "agency_subscriptions.id",
        "=",
        "agency_document_usage.subscription_id",
        "LEFT",
      )
      .where("agency_subscriptions.agency_id", agencyId)
      .orderBy("agency_subscriptions.created_at", "DESC")
      .build();

    const results = await this.db.query<any[]>(query.sql, query.params);

    return results.map((row) => ({
      id: row.id,
      agency_id: row.agency_id,
      plan_name: row.plan_name,
      price: row.price,
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.is_active ? "Active" : "Expired",
      documents_usage: row.documents_usage,
      is_active: Boolean(row.is_active),
    }));
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

  async getAllUsages(options?: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: any[]; total: number }> {
    const { page = 1, limit = 10, search } = options || {};
    const offset = (page - 1) * limit;

    const baseQuery = new QueryBuilder()
      .select([
        "agency_subscriptions.agency_id",
        "subscription_plans.name as plan_name",
        "subscription_plans.max_documents",
        "COALESCE(agency_document_usage.documents_processed, 0) as documents_processed",
        "agency_subscriptions.start_date",
        "agency_subscriptions.end_date",
        "agency_subscriptions.is_active",
      ])
      .from("agency_subscriptions")
      .join(
        "subscription_plans",
        "agency_subscriptions.subscription_plan_id",
        "=",
        "subscription_plans.id",
      )
      .join(
        "agency_document_usage",
        "agency_subscriptions.id",
        "=",
        "agency_document_usage.subscription_id",
        "LEFT",
      )
      .where("agency_subscriptions.is_active", true);

    if (search) {
      baseQuery.whereLike("agency_subscriptions.agency_id", `%${search}%`);
    }

    const countQuery = new QueryBuilder()
      .select(["COUNT(agency_subscriptions.id) as total"])
      .from("agency_subscriptions")
      .where("agency_subscriptions.is_active", true);

    if (search) {
      countQuery.whereLike("agency_subscriptions.agency_id", `%${search}%`);
    }

    const countResult = await this.db.query<any[]>(
      countQuery.build().sql,
      countQuery.build().params,
    );
    const total = countResult[0]?.total || 0;

    const dataQuery = baseQuery.limit(limit).offset(offset).build();
    const data = await this.db.query<any[]>(dataQuery.sql, dataQuery.params);

    return { data, total };
  }
}
