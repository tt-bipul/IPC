import { Database } from "../../../core/Database";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import QueryBuilder from "../../../core/QueryBuilder";
import { TABLES } from "../../../core/Database.types";

export class AgencyDeleteRepository {
  private db = Database.getInstance();

  async softDeleteAgency(id: string, conn?: PoolConnection): Promise<void> {
    const q = QueryBuilder.update(TABLES.AGENCIES)
      .data({ is_active: 0 })
      .where("id", id);
    const { sql, params } = q.build();
    await this.db.query<ResultSetHeader>(sql, params, conn);

    const cascadeQ = QueryBuilder.update(TABLES.USER_AGENCIES)
      .data({ is_active: 0 })
      .where("agency_id", id);
    const { sql: cascadeSql, params: cascadeParams } = cascadeQ.build();
    await this.db.query<ResultSetHeader>(cascadeSql, cascadeParams, conn);
  }

  async softDeleteAddress(id: number, conn?: PoolConnection): Promise<void> {
    const q = QueryBuilder.update(TABLES.ADDRESSES)
      .data({ is_active: 0 })
      .where("id", id);
    const { sql, params } = q.build();
    await this.db.query<ResultSetHeader>(sql, params, conn);
  }

  async softDeleteContact(id: number, conn?: PoolConnection): Promise<void> {
    const q = QueryBuilder.update(TABLES.CONTACTS)
      .data({ is_active: 0 })
      .where("id", id);
    const { sql, params } = q.build();
    await this.db.query<ResultSetHeader>(sql, params, conn);
  }

  async deactivateUserAgency(
    userId: string,
    agencyId: string,
    conn?: PoolConnection,
  ): Promise<void> {
    const q = QueryBuilder.update(TABLES.USER_AGENCIES)
      .data({ is_active: 0 })
      .where("user_id", userId)
      .where("agency_id", agencyId);
    const { sql, params } = q.build();
    await this.db.query<ResultSetHeader>(sql, params, conn);
  }
}
