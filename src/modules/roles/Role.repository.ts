import { Database } from "../../core/Database";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IRole, IUserRole } from "./Roles.types";
import { PoolConnection } from "mysql2/promise";

export class RoleRepository {
  private db = Database.getInstance();

  public async getRole(
    identifier: number | string,
    conn?: PoolConnection
  ): Promise<IRole | null> {
    const query =
      typeof identifier === "number"
        ? `SELECT * FROM roles WHERE id=? LIMIT 1`
        : `SELECT * FROM roles WHERE code=? LIMIT 1`;

    const rows: any = await this.db.query<RowDataPacket[]>(
      query,
      [identifier],
      conn
    );
    return rows[0] || null;
  }

  public async getAllRoles(conn?: PoolConnection): Promise<IRole[]> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM roles`,
      [],
      conn
    );
    return rows;
  }

  public async createRole(code: string, conn?: PoolConnection): Promise<number> {
    const res: any = await this.db.query<ResultSetHeader>(
      `INSERT INTO roles (code) VALUES (?)`,
      [code],
      conn
    );
    return res.insertId;
  }

  public async updateRole(id: number, code: string, conn?: PoolConnection): Promise<boolean> {
    const res: any = await this.db.query<ResultSetHeader>(
      `UPDATE roles SET code = ? WHERE id = ?`,
      [code, id],
      conn
    );
    return res.affectedRows > 0;
  }

  public async assignRole(data: IUserRole, conn?: PoolConnection): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
      [data.user_id, data.role_id],
      conn
    );
  }

  public async removeRole(data: IUserRole, conn?: PoolConnection): Promise<void> {
    await this.db.query<ResultSetHeader>(
      `DELETE FROM user_roles WHERE user_id=? AND role_id=?`,
      [data.user_id, data.role_id],
      conn
    );
  }

  public async getUserRoles(
    userId: string,
    conn?: PoolConnection
  ): Promise<string[]> {
    const rows: any = await this.db.query<RowDataPacket[]>(
      `SELECT r.code FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [userId],
      conn
    );
    return rows.map((r: any) => r.code);
  }
}
