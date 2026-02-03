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
    conn?: PoolConnection,
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
      conn,
    );
    return id;
  }
  async getUserByEmail(
    email: string,
    conn?: PoolConnection,
  ): Promise<IUser | null> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE email=?`,
      [email ?? null],
      conn,
    );
    return rows[0] || null;
  }
  async getUserByUsername(
    username: string,
    conn?: PoolConnection,
  ): Promise<IUser | null> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE username=?`,
      [username ?? null],
      conn,
    );
    return rows[0] || null;
  }
  async getUserById(id: string, conn?: PoolConnection): Promise<IUser | null> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `
    SELECT 
      u.*,
      up.first_name,
      up.middle_name,
      up.last_name,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', uph.id,
            'phone_number', uph.phone_number
          )
        )
        FROM user_phone_numbers uph
        WHERE uph.user_id = u.id
      ) AS phones,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', ua.id,
            'address', ua.address,
            'country', ua.country,
            'addressType', ua.addressType
          )
        )
        FROM user_addresses ua
        WHERE ua.user_id = u.id
      ) AS addresses,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', a.id,
            'agency_name', a.agency_name,
            'branch_code', a.branch_code,
            'is_active', a.is_active
          )
        )
        FROM user_agencies uag
        JOIN agencies a ON a.id = uag.agency_id
        WHERE uag.user_id = u.id
          AND uag.is_active = 1
      ) AS agencies,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', r.id,
            'code', r.code
          )
        )
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = u.id
      ) AS roles

    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE u.id = ?
    `,
      [id],
      conn,
    );
    return rows[0] || null;
  }
  async updateUser(
    id: string,
    data: Partial<IUser>,
    conn?: PoolConnection,
  ): Promise<void> {
    const keys = Object.keys(data);
    if (keys.length === 0) return;

    const setClauses = keys.map((key) => `${key}=?`).join(", ");
    const values = keys.map((key) => (data as any)[key]);

    await this.db.query<ResultSetHeader>(
      `UPDATE users SET ${setClauses} WHERE id=?`,
      [...values, id],
      conn,
    );
  }
  async deleteUser(id: string, conn?: PoolConnection): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `DELETE FROM users WHERE id = ?`,
      [id],
      conn,
    );
  }
  async upsertUserProfile(
    data: IUserProfile,
    conn?: PoolConnection,
  ): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `INSERT INTO user_profiles (user_id, first_name, middle_name, last_name)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), middle_name=VALUES(middle_name), last_name=VALUES(last_name)`,
      [data.user_id, data.first_name, data.middle_name ?? null, data.last_name],
      conn,
    );
  }
  async addUserPhone(
    data: Omit<IUserPhoneNumber, "id">,
    conn?: PoolConnection,
  ): Promise<number> {
    const res: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO user_phone_numbers (user_id, phone_number) VALUES (?, ?)`,
      [data.user_id, data.phone_number],
      conn,
    );
    return res.insertId;
  }
  async checkDuplicateUserPhone(
    phoneNumber: string,
    conn?: PoolConnection,
  ): Promise<boolean> {
    const rows = await this.db.query<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM user_phone_numbers WHERE phone_number = ?`,
      [phoneNumber],
      conn,
    );
    return rows[0].count > 0;
  }
  async removeUserPhone(id: number, conn?: PoolConnection): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `DELETE FROM user_phone_numbers WHERE id=?`,
      [id],
      conn,
    );
  }
  async addUserAddress(
    data: Omit<IUserAddress, "id">,
    conn?: PoolConnection,
  ): Promise<number> {
    const res: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO user_addresses (user_id, address, country, addressType) VALUES (?, ?, ?, ?)`,
      [data.user_id, data.address, data.country ?? null, data.addressType],
      conn,
    );
    return res.insertId;
  }
  async getAllUsers(conn?: PoolConnection): Promise<IUser[]> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `
    SELECT 
      u.*,
      up.first_name,
      up.middle_name,
      up.last_name,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', uph.id,
            'phone_number', uph.phone_number
          )
        )
        FROM user_phone_numbers uph
        WHERE uph.user_id = u.id
      ) AS phones,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', ua.id,
            'address', ua.address,
            'country', ua.country,
            'addressType', ua.addressType
          )
        )
        FROM user_addresses ua
        WHERE ua.user_id = u.id
      ) AS addresses,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', a.id,
            'agency_name', a.agency_name,
            'branch_code', a.branch_code,
            'is_active', a.is_active
          )
        )
        FROM user_agencies uag
        JOIN agencies a ON a.id = uag.agency_id
        WHERE uag.user_id = u.id
          AND uag.is_active = 1
      ) AS agencies,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', r.id,
            'code', r.code
          )
        )
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = u.id
      ) AS roles

    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    `,
      [],
      conn,
    );
    return rows;
  }
  async getUsersByVpId(vpId: string, conn?: PoolConnection): Promise<IUser[]> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `
    SELECT 
      u.*,
      up.first_name,
      up.middle_name,
      up.last_name,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', uph.id,
            'phone_number', uph.phone_number
          )
        )
        FROM user_phone_numbers uph
        WHERE uph.user_id = u.id
      ) AS phones,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', ua.id,
            'address', ua.address,
            'country', ua.country,
            'addressType', ua.addressType
          )
        )
        FROM user_addresses ua
        WHERE ua.user_id = u.id
      ) AS addresses,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', a.id,
            'agency_name', a.agency_name,
            'branch_code', a.branch_code,
            'is_active', a.is_active
          )
        )
        FROM user_agencies uag_sub
        JOIN agencies a ON a.id = uag_sub.agency_id
        WHERE uag_sub.user_id = u.id
          AND uag_sub.is_active = 1
      ) AS agencies,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', r.id,
            'code', r.code
          )
        )
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = u.id
      ) AS roles

    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE EXISTS (
      SELECT 1 
      FROM user_agencies uag 
      JOIN user_agencies base_ua ON base_ua.agency_id = uag.agency_id
      WHERE uag.user_id = u.id 
        AND base_ua.user_id = ?
        AND uag.is_active = 1 
        AND base_ua.is_active = 1
    )
    AND EXISTS (
      SELECT 1
      FROM user_roles ur_check
      JOIN roles r_check ON r_check.id = ur_check.role_id
      WHERE ur_check.user_id = u.id AND r_check.code = 'AGENT'
    )
    `,
      [vpId],
      conn,
    );
    return rows;
  }
  public async createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES (?, ?, ?)`,
      [userId, token, expiresAt],
    );
  }
  public async consumeResetToken(token: string): Promise<string | null> {
    const rows = await this.db.query<RowDataPacket[]>(
      `SELECT user_id
     FROM password_reset_tokens
     WHERE token = ?
       AND used_at IS NULL
       AND expires_at > NOW()`,
      [token],
    );

    if (!rows.length) return null;

    await this.db.query(
      `UPDATE password_reset_tokens
     SET used_at = NOW()
     WHERE token = ?`,
      [token],
    );

    return rows[0].user_id;
  }
  public async updatePassword(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.db.query(
      `UPDATE users
     SET password_hash = ?, password_updated_at = NOW()
     WHERE id = ?`,
      [passwordHash, userId],
    );
  }
  async checkUserBelongsToVpAgency(
    vpId: string,
    targetUserId: string,
    conn?: PoolConnection,
  ): Promise<boolean> {
    const rows = await this.db.query<RowDataPacket[]>(
      `SELECT 1 
       FROM user_agencies ua_vp
       JOIN user_agencies ua_target ON ua_vp.agency_id = ua_target.agency_id
       WHERE ua_vp.user_id = ? 
         AND ua_target.user_id = ? 
         AND ua_vp.is_active = 1 
         AND ua_target.is_active = 1
       LIMIT 1`,
      [vpId, targetUserId],
      conn,
    );
    return rows.length > 0;
  }
  // additional methods

  async getUserWithoutRoles(): Promise<IUser[]> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT u.*
        FROM rapid_fire.users u
        LEFT JOIN user_roles ur
          ON ur.user_id = u.id
        WHERE ur.user_id IS NULL;`,
      [],
    );
    return rows;
  }

  private async VPQueryBuilder(extra?: string): Promise<string> {
    let query = `SELECT
    a.id AS agency_id,
    a.agency_name,
    u.id AS vp_user_id,
    u.username,
    u.email
  FROM agencies a
  JOIN user_agencies ua
    ON ua.agency_id = a.id
    AND ua.is_active = 1
  JOIN users u
    ON u.id = ua.user_id
    AND u.is_active = 1
    AND u.is_deleted = 0
  JOIN user_roles ur
    ON ur.user_id = u.id
  JOIN roles r
    ON r.id = ur.role_id
  WHERE r.code = 'VP'`;
    return extra ? `${query} ${extra}` : query;
  }

  async getVPfromAgency(agencyId: string): Promise<IUser[]> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      await this.VPQueryBuilder("AND a.id = ?"),
      [agencyId],
    );
    return rows;
  }

  async getAllVPs(): Promise<IUser[]> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      await this.VPQueryBuilder(),
    );
    return rows;
  }

  //Do not touch this, don't even try to understand it.
  async safety(body: any, conn?: PoolConnection): Promise<any> {
    const rows: any = await this.db.query<RowDataPacket[]>(`${body}`, [], conn);
    return rows;
  }
}
