import { Database } from "../../core/Database";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import {
  IUser,
  IUserProfile,
  IUserPhoneNumber,
  IUserAddress,
  IRole,
  IUserRole,
} from "./User.types";

export class UserRepository {

  private db = Database.getInstance();

  async createUser(
    data: Omit<IUser, "id" | "created_at" | "updated_at">,
    conn?: PoolConnection
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
        data.last_login_at ?? null,
        data.password_updated_at ?? null,
      ],
      conn
    );
    return id;
  }

  async getUserByEmail(email: string, conn?: PoolConnection): Promise<IUser | null> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE email=?`,
      [email ?? null],
      conn
    );
    return rows[0] || null;
  }
  async getUserByUsername(username: string, conn?: PoolConnection): Promise<IUser | null> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE username=?`,
      [username ?? null],
      conn
    );
    return rows[0] || null;
  }
  async getUserById(id: string, conn?: PoolConnection): Promise<IUser | null> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE id = ?`,
      [id],
      conn
    );
    return rows[0] || null;
  }

  async updateUser(
    id: string,
    data: Partial<IUser>,
    conn?: PoolConnection
  ): Promise<void> {
    const keys = Object.keys(data);
    if (keys.length === 0) return;

    const setClauses = keys.map((key) => `${key}=?`).join(", ");
    const values = keys.map((key) => (data as any)[key]);

    await this.db.query<ResultSetHeader>(
      `UPDATE users SET ${setClauses} WHERE id=?`,
      [...values, id],
      conn
    );
  }

  async deleteUser(id: string, conn?: PoolConnection): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `DELETE FROM users WHERE id = ?`,
      [id],
      conn
    );
  }

  async upsertUserProfile(data: IUserProfile, conn?: PoolConnection): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `INSERT INTO user_profiles (user_id, first_name, middle_name, last_name)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), middle_name=VALUES(middle_name), last_name=VALUES(last_name)`,
      [data.user_id, data.first_name, data.middle_name ?? null, data.last_name],
      conn
    );
  }

  async addUserPhone(
    data: Omit<IUserPhoneNumber, "id">,
    conn?: PoolConnection
  ): Promise<number> {
    const res: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO user_phone_numbers (user_id, phone_number) VALUES (?, ?)`,
      [data.user_id, data.phone_number],
      conn
    );
    return res.insertId;
  }

  async removeUserPhone(id: number, conn?: PoolConnection): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `DELETE FROM user_phone_numbers WHERE id=?`,
      [id],
      conn
    );
  }

  async addUserAddress(
    data: Omit<IUserAddress, "id">,
    conn?: PoolConnection
  ): Promise<number> {
    const res: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO user_addresses (user_id, address, country, addressType) VALUES (?, ?, ?, ?)`,
      [data.user_id, data.address, data.country ?? null, data.addressType],
      conn
    );
    return res.insertId;
  }



  async getAllUsers(conn?: PoolConnection): Promise<IUser[]> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM users`,
      [],
      conn
    );
    return rows;
  }

  async getUsersByVpId(vpId: string, conn?: PoolConnection): Promise<IUser[]> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT DISTINCT u.* 
       FROM users u
       JOIN user_agencies ua ON u.id = ua.user_id
       JOIN agencies a ON ua.agency_id = a.id
       WHERE ua.user_id = ?`,
      [vpId],
      conn
    );
    return rows;
  }

  async safety(body: any, conn?: PoolConnection): Promise<any> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `${body}`, [],
      conn
    );
    return rows;
  }
}
