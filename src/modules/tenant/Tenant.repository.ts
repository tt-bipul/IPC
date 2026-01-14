import { Database } from "../../core/Database";
import { ITenant } from "./Tenant.types";
import { RowDataPacket } from "mysql2";

export class TenantRepository {
  private db = Database.getInstance();

  public async create(tenant: ITenant): Promise<void> {
    await this.db.query(
      `INSERT INTO tenants (id, name, company_email, phone_number, country, address, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tenant.id,
        tenant.name,
        tenant.company_email,
        tenant.phone_number,
        tenant.country,
        tenant.address,
        tenant.is_active,
      ]
    );
  }

  public async findAll(): Promise<ITenant[]> {
    const tenants = await this.db.query<ITenant[] & RowDataPacket[]>(
      "SELECT * FROM tenants",
      []
    );
    return tenants;
  }

  public async findById(id: string): Promise<ITenant | null> {
    const tenants = await this.db.query<ITenant[] & RowDataPacket[]>(
      "SELECT * FROM tenants WHERE id = ?",
      [id]
    );
    return tenants.length ? tenants[0] : null;
  }
}
