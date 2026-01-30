import { Database } from "../../../core/Database";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import { IUserAgency } from "../Agency.types";
import QueryBuilder from "../../../core/QueryBuilder";
import { TABLES } from "../../../core/Database.types";

export class AgencyAssociationRepository {
  private db = Database.getInstance();

  async linkAgencyAddress(
    agencyId: string,
    addressId: number,
    conn?: PoolConnection,
  ): Promise<void> {
    // Delete existing links to avoid duplicates and ensure a clean single-address state
    await this.db.query<ResultSetHeader>(
      `DELETE FROM ${TABLES.AGENCY_ADDRESSES} WHERE agency_id = ?`,
      [agencyId],
      conn,
    );

    // Insert the new link
    const insertQ = QueryBuilder.insert(TABLES.AGENCY_ADDRESSES).data({
      agency_id: agencyId,
      address_id: addressId,
    });

    const { sql: insertSql, params: insertParams } = insertQ.build();
    await this.db.query<ResultSetHeader>(insertSql, insertParams, conn);
  }

  async linkAgencyContact(
    agencyId: string,
    contactId: number,
    conn?: PoolConnection,
  ): Promise<void> {
    const q = QueryBuilder.insert(TABLES.AGENCY_CONTACTS)
      .data({ agency_id: agencyId, contact_id: contactId })
      .onDuplicate(["agency_id=agency_id"]); // IGNORE equivalent
    const { sql, params } = q.build();
    await this.db.query<ResultSetHeader>(sql, params, conn);
  }

  async assignUserToAgency(
    data: IUserAgency,
    conn?: PoolConnection,
  ): Promise<void> {
    const q = QueryBuilder.insert(TABLES.USER_AGENCIES)
      .data({
        user_id: data.user_id,
        agency_id: data.agency_id,
        is_active: data.is_active ?? 1,
      })
      .onDuplicate(["is_active=VALUES(is_active)"]);
    const { sql, params } = q.build();
    await this.db.query<ResultSetHeader>(sql, params, conn);
  }
}
