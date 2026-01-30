import { Database } from "../../../core/Database";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import { IAgency, ILocation, IAddress, IContact } from "../Agency.types";
import QueryBuilder from "../../../core/QueryBuilder";
import { TABLES } from "../../../core/Database.types";

export class AgencyCreateRepository {
  private db = Database.getInstance();

  async createAgency(
    data: Omit<IAgency, "id" | "created_at" | "updated_at">,
    conn?: PoolConnection,
  ): Promise<string> {
    const id = uuidv4();
    const q = QueryBuilder.insert(TABLES.AGENCIES).data({
      id,
      agency_name: data.agency_name,
      branch_code: data.branch_code ?? null,
      is_active: data.is_active ?? 1,
    });
    const { sql, params } = q.build();
    await this.db.query<ResultSetHeader>(sql, params, conn);
    return id;
  }

  async createLocation(
    data: Omit<ILocation, "id">,
    conn?: PoolConnection,
  ): Promise<number> {
    const q = QueryBuilder.insert(TABLES.LOCATIONS)
      .data({
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
      })
      .onDuplicate(["id=LAST_INSERT_ID(id)"]);
    const { sql, params } = q.build();
    const res = await this.db.query<ResultSetHeader>(sql, params, conn);
    return res.insertId;
  }

  async createAddress(
    data: Omit<IAddress, "id"> & { is_active?: number },
    conn?: PoolConnection,
  ): Promise<number> {
    const q = QueryBuilder.insert(TABLES.ADDRESSES).data({
      address_line_1: data.address_line_1,
      address_line_2: data.address_line_2 ?? null,
      location_id: data.location_id,
      is_active: data.is_active ?? 1,
    });
    const { sql, params } = q.build();
    const res = await this.db.query<ResultSetHeader>(sql, params, conn);
    return res.insertId;
  }

  async createContact(
    data: Omit<IContact, "id"> & { is_active?: number },
    conn?: PoolConnection,
  ): Promise<number> {
    const q = QueryBuilder.insert(TABLES.CONTACTS)
      .data({
        email: data.email,
        phone_number: data.phone_number ?? null,
        alternate_phone_number: data.alternate_phone_number ?? null,
        is_active: data.is_active ?? 1,
      })
      .onDuplicate([
        "phone_number=VALUES(phone_number)",
        "alternate_phone_number=VALUES(alternate_phone_number)",
        "is_active=VALUES(is_active)",
        "id=LAST_INSERT_ID(id)",
      ]);
    const { sql, params } = q.build();
    const res = await this.db.query<ResultSetHeader>(sql, params, conn);
    return res.insertId;
  }
}
