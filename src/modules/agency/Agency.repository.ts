import { Database } from "../../core/Database";
import { IAgency, IAgencyAddress, IAgencyContact } from "./Agency.types";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { v4 as uuidv4 } from 'uuid';

export class AgencyRepository {
  private db = Database.getInstance();

  public async getAll(): Promise<IAgency[]> {
    const [rows] = await this.db.query<any[]>(
      `SELECT a.* FROM agencies a WHERE a.is_deleted = FALSE`
    );
    
    
    return rows as IAgency[];
  }

  public async findById(id: string): Promise<IAgency | null> {
    const [rows] = await this.db.query<any[]>(
      "SELECT * FROM agencies WHERE id = ? AND is_deleted = FALSE",
      [id]
    );
    if (!rows.length) return null;

    const agency = rows[0] as IAgency;
    await this.loadRelatedData(agency);
    return agency;
  }

  public async create(agency: IAgency): Promise<void> {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      
      await connection.query(
        `INSERT INTO agencies (
                id, tenant_id, agency_name, branch_code, email, 
                phone_number, is_active, vp_user_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          agency.id, agency.tenant_id, agency.agency_name, agency.branch_code, agency.email,
          agency.phone_number, agency.is_active, agency.vp_user_id, new Date(), new Date()
        ]
      );

      
      if (agency.contacts && agency.contacts.length > 0) {
        for (const contact of agency.contacts) {
          
          const contactId = uuidv4();
          await connection.query(
            `INSERT INTO contacts (id, name, email, phone_number, designation, is_primary) VALUES (?, ?, ?, ?, ?, ?)`,
            [contactId, contact.name, contact.email, contact.phone_number, contact.designation, contact.is_primary]
          );
          
          await connection.query(
            `INSERT INTO agency_contacts (agency_id, contact_id) VALUES (?, ?)`,
            [agency.id, contactId]
          );
        }
      }

      
      if (agency.addresses && agency.addresses.length > 0) {
        for (const addr of agency.addresses) {
          
          
          
          
          const [locRows] = await connection.query<RowDataPacket[]>(
            `SELECT id FROM locations WHERE pincode = ? AND city = ?`,
            [addr.pincode, addr.city]
          );

          let locationId;
          if (locRows.length > 0) {
            locationId = locRows[0].id;
          } else {
            locationId = uuidv4();
            await connection.query(
              `INSERT INTO locations (id, city, state, country, pincode) VALUES (?, ?, ?, ?, ?)`,
              [locationId, addr.city, addr.state, addr.country, addr.pincode]
            );
          }

          
          const addressId = uuidv4();
          await connection.query(
            `INSERT INTO addresses (id, location_id, address_line_1, address_line_2, type) VALUES (?, ?, ?, ?, ?)`,
            [addressId, locationId, addr.address_line_1, addr.address_line_2, addr.type]
          );

          
          await connection.query(
            `INSERT INTO agency_addresses (agency_id, address_id) VALUES (?, ?)`,
            [agency.id, addressId]
          );
        }
      }

      await connection.commit();
    } catch (e) {
      await connection.rollback();
      throw e;
    } finally {
      connection.release();
    }
  }

  public async findByTenantId(tenantId: string): Promise<IAgency[]> {
    const [rows] = await this.db.query<any[]>(
      "SELECT * FROM agencies WHERE tenant_id = ? AND is_deleted = FALSE",
      [tenantId]
    );
    return rows as IAgency[];
  }

  private async loadRelatedData(agency: IAgency) {
    
    
    const [contacts] = await this.db.query<any[]>(
      `SELECT c.* FROM contacts c 
           JOIN agency_contacts ac ON c.id = ac.contact_id 
           WHERE ac.agency_id = ?`,
      [agency.id]
    );
    agency.contacts = contacts as IAgencyContact[];

    
    
    const [addresses] = await this.db.query<any[]>(
      `SELECT a.id, a.address_line_1, a.address_line_2, a.type,
                  l.city, l.state, l.country, l.pincode
           FROM addresses a
           JOIN locations l ON a.location_id = l.id
           JOIN agency_addresses aa ON a.id = aa.address_id
           WHERE aa.agency_id = ?`,
      [agency.id]
    );
    agency.addresses = addresses as IAgencyAddress[];
  }
}
