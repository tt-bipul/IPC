import { Database } from "../../core/Database";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import {
  IAgency,
  ILocation,
  IAddress,
  IContact,
  IUserAgency,
} from "./Agency.types";

export class AgencyRepository {
  private db = Database.getInstance();

  async createAgency(
    data: Omit<IAgency, "id" | "created_at" | "updated_at">,
    conn?: PoolConnection,
  ): Promise<string> {
    const id = uuidv4();
    await this.db.query<ResultSetHeader>(
      `INSERT INTO agencies (id, agency_name, branch_code, is_active)
       VALUES (?, ?, ?, ?)`,
      [id, data.agency_name, data.branch_code ?? null, data.is_active ?? 1],
      conn,
    );
    return id;
  }

  async updateAgency(
    id: string,
    data: Partial<IAgency>,
    conn?: PoolConnection,
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.agency_name !== undefined) {
      fields.push("agency_name=?");
      values.push(data.agency_name);
    }
    if (data.branch_code !== undefined) {
      fields.push("branch_code=?");
      values.push(data.branch_code);
    }
    if (data.is_active !== undefined) {
      fields.push("is_active=?");
      values.push(data.is_active);
    }

    if (!fields.length) return;

    values.push(id);

    await this.db.query<ResultSetHeader>(
      `UPDATE agencies SET ${fields.join(", ")} WHERE id=?`,
      values,
      conn,
    );

    if (data.is_active === 0) {
      await this.db.query<ResultSetHeader>(
        `UPDATE user_agencies SET is_active=0 WHERE agency_id=?`,
        [id],
        conn,
      );
    }
  }

  async existsByBranchCode(
    branchCode: string,
    conn?: PoolConnection,
  ): Promise<boolean> {
    const rows = await this.db.query<RowDataPacket[]>(
      `SELECT 1 FROM agencies WHERE branch_code=? LIMIT 1`,
      [branchCode],
      conn,
    );
    return rows.length > 0;
  }

  async softDeleteAgency(id: string, conn?: PoolConnection): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `UPDATE agencies SET is_active=0 WHERE id=?`,
      [id],
      conn,
    );
    await this.db.query<ResultSetHeader>(
      `UPDATE user_agencies SET is_active=0 WHERE agency_id=?`,
      [id],
      conn,
    );
  }

  async createLocation(
    data: Omit<ILocation, "id">,
    conn?: PoolConnection,
  ): Promise<number> {
    const res = await this.db.query<ResultSetHeader>(
      `INSERT INTO locations (city, state, country, pincode)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      [data.city, data.state, data.country, data.pincode],
      conn,
    );
    return res.insertId;
  }

  async createAddress(
    data: Omit<IAddress, "id"> & { is_active?: number },
    conn?: PoolConnection,
  ): Promise<number> {
    const res = await this.db.query<ResultSetHeader>(
      `INSERT INTO addresses (address_line_1, address_line_2, location_id, is_active)
       VALUES (?, ?, ?, ?)`,
      [
        data.address_line_1,
        data.address_line_2 ?? null,
        data.location_id,
        data.is_active ?? 1,
      ],
      conn,
    );
    return res.insertId;
  }

  async softDeleteAddress(id: number, conn?: PoolConnection): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `UPDATE addresses SET is_active=0 WHERE id=?`,
      [id],
      conn,
    );
  }

  async createContact(
    data: Omit<IContact, "id"> & { is_active?: number },
    conn?: PoolConnection,
  ): Promise<number> {
    const res = await this.db.query<ResultSetHeader>(
      `INSERT INTO contacts (email, phone_number, alternate_phone_number, is_active)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         phone_number=VALUES(phone_number),
         alternate_phone_number=VALUES(alternate_phone_number),
         is_active=VALUES(is_active),
         id=LAST_INSERT_ID(id)`,
      [
        data.email,
        data.phone_number ?? null,
        data.alternate_phone_number ?? null,
        data.is_active ?? 1,
      ],
      conn,
    );
    return res.insertId;
  }

  async softDeleteContact(id: number, conn?: PoolConnection): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `UPDATE contacts SET is_active=0 WHERE id=?`,
      [id],
      conn,
    );
  }

  async linkAgencyAddress(
    agencyId: string,
    addressId: number,
    conn?: PoolConnection,
  ): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `INSERT IGNORE INTO agency_addresses (agency_id, address_id)
       VALUES (?, ?)`,
      [agencyId, addressId],
      conn,
    );
  }

  async linkAgencyContact(
    agencyId: string,
    contactId: number,
    conn?: PoolConnection,
  ): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `INSERT IGNORE INTO agency_contacts (agency_id, contact_id)
       VALUES (?, ?)`,
      [agencyId, contactId],
      conn,
    );
  }

  async assignUserToAgency(
    data: IUserAgency,
    conn?: PoolConnection,
  ): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `INSERT INTO user_agencies (user_id, agency_id, is_active)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE is_active=VALUES(is_active)`,
      [data.user_id, data.agency_id, data.is_active ?? 1],
      conn,
    );
  }

  async deactivateUserAgency(
    userId: string,
    agencyId: string,
    conn?: PoolConnection,
  ): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `UPDATE user_agencies SET is_active=0 WHERE user_id=? AND agency_id=?`,
      [userId, agencyId],
      conn,
    );
  }

  async getAgencyAggregateById(
    agencyId: string,
    includeInactive = false,
    conn?: PoolConnection,
  ): Promise<any | null> {
    const agencyRows = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM agencies WHERE id=? ${
        includeInactive ? "" : "AND is_active=1"
      }`,
      [agencyId],
      conn,
    );
    if (!agencyRows.length) return null;

    const addresses = await this.db.query<RowDataPacket[]>(
      `SELECT a.*, l.*
       FROM agency_addresses aa
       JOIN addresses a ON a.id=aa.address_id
       JOIN locations l ON l.id=a.location_id
       WHERE aa.agency_id=? ${includeInactive ? "" : "AND a.is_active=1"}`,
      [agencyId],
      conn,
    );

    const contacts = await this.db.query<RowDataPacket[]>(
      `SELECT c.*
       FROM agency_contacts ac
       JOIN contacts c ON c.id=ac.contact_id
       WHERE ac.agency_id=? ${includeInactive ? "" : "AND c.is_active=1"}`,
      [agencyId],
      conn,
    );

    const users = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM user_agencies WHERE agency_id=? ${
        includeInactive ? "" : "AND is_active=1"
      }`,
      [agencyId],
      conn,
    );

    return {
      ...agencyRows[0],
      addresses,
      contacts,
      users,
    };
  }

  async getAgenciesByUserId(
    userId: string,
    includeInactive = false,
    conn?: PoolConnection,
  ): Promise<any[]> {
    const rows = await this.db.query<RowDataPacket[]>(
      `SELECT a.*, ua.is_active AS user_is_active, ua.assigned_at
       FROM user_agencies ua
       JOIN agencies a ON a.id=ua.agency_id
       WHERE ua.user_id=? ${
         includeInactive ? "" : "AND ua.is_active=1 AND a.is_active=1"
       }`,
      [userId],
      conn,
    );
    return rows;
  }

  async getAllAgencies(includeInactive = false): Promise<any[]> {
    const rows = await this.db.query<RowDataPacket[]>(
      `
    SELECT
      a.id AS agency_id,
      a.agency_name,
      a.branch_code,
      c.email AS email_address,
      c.phone_number,
      c.alternate_phone_number AS alternate_phone,
      ad.address_line_1,
      ad.address_line_2,
      l.city,
      l.state,
      l.country,
      l.pincode AS postal_code
    FROM agencies a
    LEFT JOIN agency_addresses aa ON aa.agency_id = a.id
    LEFT JOIN addresses ad ON ad.id = aa.address_id
    LEFT JOIN locations l ON l.id = ad.location_id
    LEFT JOIN agency_contacts ac ON ac.agency_id = a.id
    LEFT JOIN contacts c ON c.id = ac.contact_id
    ${includeInactive ? "" : "WHERE a.is_active=1 AND (ad.is_active=1 OR ad.id IS NULL) AND (c.is_active=1 OR c.id IS NULL)"}
    `,
    );
    return rows;
  }
}
