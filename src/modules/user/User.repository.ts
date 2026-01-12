import { Database } from "../../core/Database";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import {
  IUser,
  IUserProfile,
  IUserPhoneNumber,
  IUserAddress,
  IRole,
  IUserRole,
  IAgency,
  ILocation,
  IAddress,
  IContact,
  IAgencyAddress,
  IAgencyContact,
} from "./User.types";

export class UserRepository {
  private db = Database.getInstance();

  async createUser(
    data: Omit<IUser, "id" | "created_at" | "updated_at">
  ): Promise<string> {
    const id = uuidv4();
    await this.db.query<ResultSetHeader>(
      `INSERT INTO users (id, username, email, password_hash, is_active, is_deleted, last_login_at, password_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.username,
        data.email,
        data.password_hash,
        data.is_active,
        data.is_deleted,
        data.last_login_at,
        data.password_updated_at,
      ]
    );
    return id;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE email=?`,
      [email]
    );
    return rows[0] || null;
  }

  async getUserById(id: string): Promise<IUser | null> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `UPDATE users SET username=?, email=?, password_hash=?, is_active=?, is_deleted=? WHERE id=?`,
      [
        data.username,
        data.email,
        data.password_hash,
        data.is_active,
        data.is_deleted,
        id,
      ]
    );
  }

  async deleteUser(id: string): Promise<void> {
    await this.db.query<ResultSetHeader>(`DELETE FROM users WHERE id = ?`, [
      id,
    ]);
  }

  async upsertUserProfile(data: IUserProfile): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `INSERT INTO user_profiles (user_id, first_name, middle_name, last_name)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), middle_name=VALUES(middle_name), last_name=VALUES(last_name)`,
      [data.user_id, data.first_name, data.middle_name, data.last_name]
    );
  }

  async addUserPhone(data: Omit<IUserPhoneNumber, "id">): Promise<number> {
    const [res]: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO user_phone_numbers (user_id, phone_number) VALUES (?, ?)`,
      [data.user_id, data.phone_number]
    );
    return res.insertId;
  }

  async removeUserPhone(id: number): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `DELETE FROM user_phone_numbers WHERE id=?`,
      [id]
    );
  }

  async addUserAddress(data: Omit<IUserAddress, "id">): Promise<number> {
    const [res]: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO user_addresses (user_id, address, country) VALUES (?, ?, ?)`,
      [data.user_id, data.address, data.country]
    );
    return res.insertId;
  }

  async assignRole(data: IUserRole): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
      [data.user_id, data.role_id]
    );
  }

  async removeRole(data: IUserRole): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `DELETE FROM user_roles WHERE user_id=? AND role_id=?`,
      [data.user_id, data.role_id]
    );
  }

  async createRole(code: string): Promise<number> {
    const res: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO roles (code) VALUES (?)`,
      [code]
    );
    return res.insertId;
  }

  async createAgency(
    data: Omit<IAgency, "id" | "created_at" | "updated_at">
  ): Promise<string> {
    const id = uuidv4();
    await this.db.query<ResultSetHeader>(
      `INSERT INTO agencies (id, agency_name, branch_code, is_active, vp_user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [id, data.agency_name, data.branch_code, data.is_active, data.vp_user_id]
    );
    return id;
  }

  async updateAgency(id: string, data: Partial<IAgency>): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `UPDATE agencies SET agency_name=?, branch_code=?, is_active=?, vp_user_id=? WHERE id=?`,
      [data.agency_name, data.branch_code, data.is_active, data.vp_user_id, id]
    );
  }

  async deleteAgency(id: string): Promise<void> {
    await this.db.query<ResultSetHeader>(`DELETE FROM agencies WHERE id=?`, [
      id,
    ]);
  }

  async createLocation(data: Omit<ILocation, "id">): Promise<number> {
    const [res]: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO locations (city, state, country, pincode) VALUES (?, ?, ?, ?)`,
      [data.city, data.state, data.country, data.pincode]
    );
    return res.insertId;
  }

  async createAddress(data: Omit<IAddress, "id">): Promise<number> {
    const [res]: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO addresses (address_line_1, address_line_2, location_id)
       VALUES (?, ?, ?)`,
      [data.address_line_1, data.address_line_2, data.location_id]
    );
    return res.insertId;
  }

  async createContact(data: Omit<IContact, "id">): Promise<number> {
    const [res]: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO contacts (email, phone_number, alternate_phone_number)
       VALUES (?, ?, ?)`,
      [data.email, data.phone_number, data.alternate_phone_number]
    );
    return res.insertId;
  }

  async linkAgencyAddress(data: IAgencyAddress): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `INSERT INTO agency_addresses (agency_id, address_id) VALUES (?, ?)`,
      [data.agency_id, data.address_id]
    );
  }

  async linkAgencyContact(data: IAgencyContact): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `INSERT INTO agency_contacts (agency_id, contact_id) VALUES (?, ?)`,
      [data.agency_id, data.contact_id]
    );
  }
}
