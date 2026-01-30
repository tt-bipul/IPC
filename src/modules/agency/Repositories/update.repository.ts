import { Database } from "../../../core/Database";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import { IAgency } from "../Agency.types";
import QueryBuilder from "../../../core/QueryBuilder";
import { TABLES } from "../../../core/Database.types";

export class AgencyUpdateRepository {
  private db = Database.getInstance();

  async updateAgency(
    id: string,
    data: Partial<IAgency>,
    conn?: PoolConnection,
  ): Promise<void> {
    const updateData: Record<string, string | number | boolean | null> = {};

    if (data.agency_name !== undefined)
      updateData.agency_name = data.agency_name;
    if (data.branch_code !== undefined)
      updateData.branch_code = data.branch_code;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    if (Object.keys(updateData).length === 0) return;

    const q = QueryBuilder.update(TABLES.AGENCIES)
      .data(updateData)
      .where("id", id);
    const { sql, params } = q.build();
    await this.db.query<ResultSetHeader>(sql, params, conn);

    // Cascade deactivation to user_agencies
    if (data.is_active === 0) {
      const cascadeQ = QueryBuilder.update(TABLES.USER_AGENCIES)
        .data({ is_active: 0 })
        .where("agency_id", id);
      const { sql: cascadeSql, params: cascadeParams } = cascadeQ.build();
      await this.db.query<ResultSetHeader>(cascadeSql, cascadeParams, conn);
    }
  }

  async updateLocation(
    id: number,
    data: {
      city?: string;
      state?: string;
      country?: string;
      pincode?: string;
    },
    conn?: PoolConnection,
  ): Promise<void> {
    const updateData: Record<string, string | number | boolean | null> = {};
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.pincode !== undefined) updateData.pincode = data.pincode;

    if (Object.keys(updateData).length === 0) return;

    const q = QueryBuilder.update(TABLES.LOCATIONS)
      .data(updateData)
      .where("id", id);
    const { sql, params } = q.build();
    await this.db.query<ResultSetHeader>(sql, params, conn);
  }

  async updateAddress(
    id: number,
    data: {
      address_line_1?: string;
      address_line_2?: string | null;
      is_active?: number;
    },
    conn?: PoolConnection,
  ): Promise<void> {
    const updateData: Record<string, string | number | boolean | null> = {};
    if (data.address_line_1 !== undefined)
      updateData.address_line_1 = data.address_line_1;
    if (data.address_line_2 !== undefined)
      updateData.address_line_2 = data.address_line_2;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    if (Object.keys(updateData).length === 0) return;

    const q = QueryBuilder.update(TABLES.ADDRESSES)
      .data(updateData)
      .where("id", id);
    const { sql, params } = q.build();
    await this.db.query<ResultSetHeader>(sql, params, conn);
  }

  async updateContact(
    id: number,
    data: {
      email?: string;
      phone_number?: string | null;
      alternate_phone_number?: string | null;
      is_active?: number;
    },
    conn?: PoolConnection,
  ): Promise<void> {
    const updateData: Record<string, string | number | boolean | null> = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone_number !== undefined)
      updateData.phone_number = data.phone_number;
    if (data.alternate_phone_number !== undefined)
      updateData.alternate_phone_number = data.alternate_phone_number;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    if (Object.keys(updateData).length === 0) return;

    const q = QueryBuilder.update(TABLES.CONTACTS)
      .data(updateData)
      .where("id", id);
    const { sql, params } = q.build();
    await this.db.query<ResultSetHeader>(sql, params, conn);
  }
}
