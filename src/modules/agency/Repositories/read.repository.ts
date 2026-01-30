import { Database } from "../../../core/Database";
import { PoolConnection, RowDataPacket } from "mysql2/promise";
import { ILocation } from "../Agency.types";
import { AppError } from "../../../core/ErrorHandler";
import { HttpStatus } from "../../../constants/HttpStatus";
import QueryBuilder from "../../../core/QueryBuilder";
import { TABLES } from "../../../core/Database.types";

export class AgencyReadRepository {
  private db = Database.getInstance();

  async existsByBranchCode(
    branchCode: string,
    conn?: PoolConnection,
  ): Promise<boolean> {
    const q = QueryBuilder.selectAll()
      .select(["1"])
      .from(TABLES.AGENCIES)
      .where("branch_code", branchCode)
      .limit(1);
    const { sql, params } = q.build();
    const rows = await this.db.query<RowDataPacket[]>(sql, params, conn);
    return rows.length > 0;
  }

  async getAgencyAggregateById(
    agencyId: string,
    includeInactive = false,
    conn?: PoolConnection,
  ): Promise<RowDataPacket | null> {
    const q = QueryBuilder.selectAll()
      .select([
        "a.id AS agency_id",
        "a.agency_name",
        "a.branch_code",
        "a.is_active",
        "c.email AS email_address",
        "c.phone_number",
        "c.alternate_phone_number AS alternate_phone",
        "ad.address_line_1",
        "ad.address_line_2",
        "l.city",
        "l.state",
        "l.country",
        "l.pincode AS postal_code",
      ])
      .from(`${TABLES.AGENCIES} a`)
      .join("agency_addresses aa", "aa.agency_id", "=", "a.id", "LEFT")
      .join("addresses ad", "ad.id", "=", "aa.address_id", "LEFT")
      .join("locations l", "l.id", "=", "ad.location_id", "LEFT")
      .join("agency_contacts ac", "ac.agency_id", "=", "a.id", "LEFT")
      .join("contacts c", "c.id", "=", "ac.contact_id", "LEFT")
      .where("a.id", agencyId);

    let { sql, params } = q.build();

    if (!includeInactive) {
      sql +=
        " AND a.is_active=1 AND (ad.is_active=1 OR ad.id IS NULL) AND (c.is_active=1 OR c.id IS NULL)";
    }

    const rows = await this.db.query<RowDataPacket[]>(sql, params, conn);
    return rows.length ? rows[0] : null;
  }

  async getAgenciesByUserId(
    userId: string,
    _includeInactive = false,
    conn?: PoolConnection,
  ): Promise<RowDataPacket[]> {
    const q = QueryBuilder.selectAll()
      .from(TABLES.USER_AGENCIES)
      .where("user_id", userId);
    const { sql, params } = q.build();
    return this.db.query<RowDataPacket[]>(sql, params, conn);
  }

  async getAllAgencies(includeInactive = false): Promise<RowDataPacket[]> {
    const q = QueryBuilder.selectAll()
      .select([
        "a.id AS agency_id",
        "a.agency_name",
        "a.branch_code",
        "a.is_active",
        "c.email AS email_address",
        "c.phone_number",
        "c.alternate_phone_number AS alternate_phone",
        "ad.address_line_1",
        "ad.address_line_2",
        "l.city",
        "l.state",
        "l.country",
        "l.pincode AS postal_code",
      ])
      .from(`${TABLES.AGENCIES} a`)
      .join("agency_addresses aa", "aa.agency_id", "=", "a.id", "LEFT")
      .join("addresses ad", "ad.id", "=", "aa.address_id", "LEFT")
      .join("locations l", "l.id", "=", "ad.location_id", "LEFT")
      .join("agency_contacts ac", "ac.agency_id", "=", "a.id", "LEFT")
      .join("contacts c", "c.id", "=", "ac.contact_id", "LEFT");

    let { sql, params } = q.build();

    if (!includeInactive) {
      sql +=
        " WHERE a.is_active=1 AND (ad.is_active=1 OR ad.id IS NULL) AND (c.is_active=1 OR c.id IS NULL)";
    }

    return this.db.query<RowDataPacket[]>(sql, params);
  }

  async getAgencyAssociatedId(
    type: "address_id" | "contact_id" | "location_id",
    agencyId: string,
    conn?: PoolConnection,
  ): Promise<{
    address_id?: number;
    contact_id?: number;
    location_id?: number;
  }> {
    let q: QueryBuilder;
    let resultKey: "address_id" | "contact_id" | "location_id";

    switch (type) {
      case "address_id":
        q = QueryBuilder.selectAll()
          .select(["ad.id"])
          .from("agency_addresses aa")
          .join("addresses ad", "ad.id", "=", "aa.address_id")
          .where("aa.agency_id", agencyId)
          .where("ad.is_active", 1)
          .limit(1);
        resultKey = "address_id";
        break;

      case "contact_id":
        q = QueryBuilder.selectAll()
          .select(["c.id"])
          .from("agency_contacts ac")
          .join("contacts c", "c.id", "=", "ac.contact_id")
          .where("ac.agency_id", agencyId)
          .where("c.is_active", 1)
          .limit(1);
        resultKey = "contact_id";
        break;

      default:
        q = QueryBuilder.selectAll()
          .select(["l.id"])
          .from("agency_addresses aa")
          .join("addresses ad", "ad.id", "=", "aa.address_id")
          .join("locations l", "l.id", "=", "ad.location_id")
          .where("aa.agency_id", agencyId)
          .limit(1);
        resultKey = "location_id";
    }

    const { sql, params } = q.build();
    const rows = await this.db.query<RowDataPacket[]>(sql, params, conn);

    return rows.length ? { [resultKey]: rows[0].id } : {};
  }

  async vp_ID_and_agent_ID_isEqual(
    vpID: string,
    agentID: string,
    conn?: PoolConnection,
  ): Promise<boolean> {
    if (!vpID || !agentID) {
      throw new AppError("Both VP ID and Agent ID are required.");
    }

    // Check if agent ID is actually an agent (role_id = 3)
    const roleQ = QueryBuilder.selectAll()
      .select(["role_id"])
      .from(TABLES.USER_ROLES)
      .where("user_id", agentID)
      .limit(1);
    const { sql: roleSql, params: roleParams } = roleQ.build();
    const isAgentIDIsAgent = await this.db.query<RowDataPacket[]>(
      roleSql,
      roleParams,
    );

    if (isAgentIDIsAgent.length === 0 || isAgentIDIsAgent[0].role_id !== 3) {
      throw new AppError(
        "The provided user is either not available or not an AGENT.",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if both VP and Agent belong to the same agency
    const rows = await this.db.query<RowDataPacket[]>(
      `SELECT 1 FROM ${TABLES.USER_AGENCIES} WHERE user_id=? AND agency_id=(SELECT agency_id FROM ${TABLES.USER_AGENCIES} WHERE user_id=?) LIMIT 1`,
      [agentID, vpID],
      conn,
    );
    return rows.length > 0;
  }

  async getAllLocation(conn?: PoolConnection): Promise<ILocation[]> {
    const q = QueryBuilder.selectAll().from(TABLES.LOCATIONS);
    const { sql, params } = q.build();
    return this.db.query<ILocation[]>(sql, params, conn);
  }

  async existsByContactDetails(
    email: string,
    phone?: string,
    alternatePhone?: string,
    conn?: PoolConnection,
  ): Promise<boolean> {
    let sql = `SELECT 1 FROM ${TABLES.CONTACTS} WHERE email = ?`;
    const params: (string | number | boolean | null)[] = [email];

    if (phone) {
      sql += " OR phone_number = ?";
      params.push(phone);
    }
    if (alternatePhone) {
      sql += " OR alternate_phone_number = ?";
      params.push(alternatePhone);
    }

    sql += " LIMIT 1";

    const rows = await this.db.query<RowDataPacket[]>(sql, params, conn);
    return rows.length > 0;
  }

  async existsByContactDetailsExcludingContactId(
    excludeContactId: number,
    email: string,
    phone?: string,
    alternatePhone?: string,
    conn?: PoolConnection,
  ): Promise<boolean> {
    let sql = `SELECT 1 FROM ${TABLES.CONTACTS} WHERE (email = ?`;
    const params: (string | number | boolean | null)[] = [email];

    if (phone) {
      sql += " OR phone_number = ?";
      params.push(phone);
    }
    if (alternatePhone) {
      sql += " OR alternate_phone_number = ?";
      params.push(alternatePhone);
    }

    sql += ") AND id != ? LIMIT 1";
    params.push(excludeContactId);

    const rows = await this.db.query<RowDataPacket[]>(sql, params, conn);
    return rows.length > 0;
  }
}
