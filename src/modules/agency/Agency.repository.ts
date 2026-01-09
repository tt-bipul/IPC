import { Database } from "../../core/Database";
import { IAgency } from "./Agency.types";
import { RowDataPacket } from "mysql2";

export class AgencyRepository {
  private db = Database.getInstance();

  public async getAll(): Promise<IAgency[]> {
    const allAgencies = await this.db.query<IAgency[] & RowDataPacket[]>(
      `select * from agencies`
    );
    return allAgencies;
  }

  public async create(agency: IAgency): Promise<void> {
    await this.db.query(
      `INSERT INTO agencies (
                id, tenant_id, agency_name, branch_code, email, 
                phone_number, alternate_phone_number, country, 
                address_line_1, address_line_2, pincode, state, city
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        agency.id,
        agency.tenant_id,
        agency.agency_name,
        agency.branch_code,
        agency.email,
        agency.phone_number,
        agency.alternate_phone_number,
        agency.country,
        agency.address_line_1,
        agency.address_line_2,
        agency.pincode,
        agency.state,
        agency.city,
      ]
    );
  }

  public async findByTenantId(tenantId: string): Promise<IAgency[]> {
    const agencies = await this.db.query<IAgency[] & RowDataPacket[]>(
      "SELECT * FROM agencies WHERE tenant_id = ?",
      [tenantId]
    );
    return agencies;
  }

  public async findById(id: string): Promise<IAgency | null> {
    const agencies = await this.db.query<IAgency[] & RowDataPacket[]>(
      "SELECT * FROM agencies WHERE id = ?",
      [id]
    );
    return agencies.length ? agencies[0] : null;
  }
}
