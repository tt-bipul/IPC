import { Database } from "../../core/Database";
import { RowDataPacket } from "mysql2";
import { RolesInterface } from "./Roles.types";

export class RoleRepository {
  private db = Database.getInstance();

  public async findByName(roleName: string): Promise<RolesInterface | null> {
    const rows = await this.db.query<RolesInterface[] & RowDataPacket[]>(
      "SELECT * FROM user_roles WHERE role = ? limit 1",
      [roleName]
    );
    return rows.length ? rows[0] : null;
  }

  public async findById(id: string): Promise<RolesInterface | null> {
    const rows = await this.db.query<RolesInterface[] & RowDataPacket[]>(
      "SELECT * FROM user_roles WHERE id = ? limit 1",
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  public async create(roles: RolesInterface): Promise<void> {
    await this.db.query(`INSERT INTO user_roles (id, role) VALUES (?, ?)`, [
      roles.id,
      roles.role,
    ]);
  }
}
