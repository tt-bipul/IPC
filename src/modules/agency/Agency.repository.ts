import { Database } from "../../core/Database";
import {
  IAddress,
  IAgency,
  IAgencyAddress,
  IAgencyContact,
  IContact,
  ILocation,
  IUserAgency,
} from "./Agency.types";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";

export class AgencyRepository {
  private db = Database.getInstance();
  async createAgency(
    data: Omit<IAgency, "id" | "created_at" | "updated_at">,
    conn?: PoolConnection
  ): Promise<string> {
    const id = uuidv4();
    await this.db.query<ResultSetHeader>(
      `INSERT INTO agencies (id, agency_name, branch_code, is_active, vp_user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        data.agency_name,
        data.branch_code ?? null,
        data.is_active,
        data.vp_user_id ?? null,
      ],
      conn
    );
    return id;
  }

  async updateAgency(
    id: string,
    data: Partial<IAgency>,
    conn?: PoolConnection
  ): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `UPDATE agencies SET agency_name=?, branch_code=?, is_active=?, vp_user_id=? WHERE id=?`,
      [
        data.agency_name,
        data.branch_code ?? null,
        data.is_active,
        data.vp_user_id ?? null,
        id,
      ],
      conn
    );
  }

  async deleteAgency(id: string, conn?: PoolConnection): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `DELETE FROM agencies WHERE id=?`,
      [id],
      conn
    );
  }

  async createLocation(
    data: Omit<ILocation, "id">,
    conn?: PoolConnection
  ): Promise<number> {
    const res: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO locations (city, state, country, pincode) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      [data.city, data.state, data.country, data.pincode],
      conn
    );
    return res.insertId;
  }

  async createAddress(
    data: Omit<IAddress, "id">,
    conn?: PoolConnection
  ): Promise<number> {
    const res: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO addresses (address_line_1, address_line_2, location_id)
       VALUES (?, ?, ?)`,
      [data.address_line_1, data.address_line_2 ?? null, data.location_id],
      conn
    );
    return res.insertId;
  }

  async createContact(
    data: Omit<IContact, "id">,
    conn?: PoolConnection
  ): Promise<number> {
    const res: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO contacts (email, phone_number, alternate_phone_number)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), phone_number=VALUES(phone_number), alternate_phone_number=VALUES(alternate_phone_number)`,
      [
        data.email,
        data.phone_number ?? null,
        data.alternate_phone_number ?? null,
      ],
      conn
    );
    return res.insertId;
  }

  async linkAgencyAddress(
    data: IAgencyAddress,
    conn?: PoolConnection
  ): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `INSERT INTO agency_addresses (agency_id, address_id) VALUES (?, ?)`,
      [data.agency_id, data.address_id],
      conn
    );
  }

  async linkAgencyContact(
    data: IAgencyContact,
    conn?: PoolConnection
  ): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `INSERT INTO agency_contacts (agency_id, contact_id) VALUES (?, ?)`,
      [data.agency_id, data.contact_id],
      conn
    );
  }

  // associating user to agency

  async createUserAgency(
    data: IUserAgency,
    conn?: PoolConnection
  ): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `INSERT INTO user_agencies (user_id, agency_id, is_active) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE is_active=VALUES(is_active)`,
      [data.user_id, data.agency_id, data.is_active],
      conn
    );
  }

  async deleteUserAgency(
    userId: string,
    agencyId: string,
    conn?: PoolConnection
  ): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `DELETE FROM user_agencies WHERE user_id=? AND agency_id=?`,
      [userId, agencyId],
      conn
    );
  }

  async getUserAgencies(
    userId: string,
    conn?: PoolConnection
  ): Promise<IUserAgency[]> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM user_agencies WHERE user_id=?`,
      [userId],
      conn
    );
    return rows;
  }

  async getAgencyByVpId(
    vpId: string,
    conn?: PoolConnection
  ): Promise<IUserAgency | null> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM user_agencies WHERE user_id=? LIMIT 1`,
      [vpId],
      conn
    );
    return rows[0] || null;
  }

  async getAgencyById(id: string, conn?: PoolConnection): Promise<IAgency | null> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM agencies WHERE id=? LIMIT 1`,
      [id],
      conn
    );
    return rows[0] || null;
  }
}
