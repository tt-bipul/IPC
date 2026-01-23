import { AgencyRepository } from "./Agency.repository";
import {
  IAgency,
  IAddress,
  IContact,
  ILocation,
  IUserAgency,
} from "./Agency.types";
import { Database } from "../../core/Database";
import { HttpStatus } from "../../constants/HttpStatus";
import { AppError } from "../../core/ErrorHandler";
import { ADDRGETNETWORKPARAMS } from "dns";

export class AgencyService {
  private repo = new AgencyRepository();
  private db = Database.getInstance();

  public async createAgency(payload: {
    agency_name: string;
    branch_code?: string;
    email_address: string;
    phone_number?: string;
    alternate_phone?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  }): Promise<string> {
    return this.db.withTransaction(async (conn) => {
      if (payload.branch_code) {
        const exists = await this.repo.existsByBranchCode(
          payload.branch_code,
          conn,
        );

        if (exists) {
          throw new AppError(
            "Branch code already exists",
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const agencyId = await this.repo.createAgency(
        {
          agency_name: payload.agency_name,
          branch_code: payload.branch_code ?? null,
          is_active: 1,
        },
        conn,
      );

      const locationId = await this.repo.createLocation(
        {
          city: payload.city,
          state: payload.state,
          country: payload.country,
          pincode: payload.postal_code,
        },
        conn,
      );

      const addressId = await this.repo.createAddress(
        {
          address_line_1: payload.address_line_1,
          address_line_2: payload.address_line_2 ?? null,
          location_id: locationId,
          is_active: 1,
        },
        conn,
      );

      await this.repo.linkAgencyAddress(agencyId, addressId, conn);

      const contactId = await this.repo.createContact(
        {
          email: payload.email_address,
          phone_number: payload.phone_number ?? null,
          alternate_phone_number: payload.alternate_phone ?? null,
          is_active: 1,
        },
        conn,
      );

      await this.repo.linkAgencyContact(agencyId, contactId, conn);

      return agencyId;
    });
  }

  public async updateAgency(
    agencyId: string,
    payload: {
      agency_name?: string;
      branch_code?: string;
      email_address?: string;
      phone_number?: string;
      alternate_phone?: string;
      address_line_1?: string;
      address_line_2?: string;
      city?: string;
      state?: string;
      country?: string;
      postal_code?: string;
    },
  ): Promise<void> {
    return this.db.withTransaction(async (conn) => {
      await this.repo.updateAgency(
        agencyId,
        {
          agency_name: payload.agency_name,
          branch_code: payload.branch_code,
        },
        conn,
      );

      const addressRes = await this.repo.getAgencyAssociatedId(
        "address_id",
        agencyId,
        conn,
      );

      const locationRes = await this.repo.getAgencyAssociatedId(
        "location_id",
        agencyId,
        conn,
      );

      const contactRes = await this.repo.getAgencyAssociatedId(
        "contact_id",
        agencyId,
        conn,
      );

      let addressId = addressRes.address_id;
      let locationId = locationRes.location_id;
      let contactId = contactRes.contact_id;

      if (
        payload.address_line_1 ||
        payload.address_line_2 ||
        payload.city ||
        payload.state ||
        payload.country ||
        payload.postal_code
      ) {
        if (locationId === undefined) {
          locationId = await this.repo.createLocation(
            {
              city: payload.city ?? "NA",
              state: payload.state ?? "NA",
              country: payload.country ?? "NA",
              pincode: payload.postal_code ?? "NA",
            },
            conn,
          );
        } else {
          await this.db.query(
            `UPDATE locations SET city=?, state=?, country=?, pincode=? WHERE id=?`,
            [
              payload.city,
              payload.state,
              payload.country,
              payload.postal_code,
              locationId,
            ],
            conn,
          );
        }

        if (addressId === undefined) {
          addressId = await this.repo.createAddress(
            {
              address_line_1: payload.address_line_1 ?? "NA",
              address_line_2: payload.address_line_2 ?? null,
              location_id: locationId,
              is_active: 1,
            },
            conn,
          );
          await this.repo.linkAgencyAddress(agencyId, addressId, conn);
        } else {
          await this.db.query(
            `UPDATE addresses SET address_line_1=?, address_line_2=? WHERE id=?`,
            [payload.address_line_1, payload.address_line_2 ?? null, addressId],
            conn,
          );
        }
      }

      if (
        payload.email_address ||
        payload.phone_number ||
        payload.alternate_phone
      ) {
        if (contactId === undefined) {
          contactId = await this.repo.createContact(
            {
              email: payload.email_address ?? "NA",
              phone_number: payload.phone_number ?? null,
              alternate_phone_number: payload.alternate_phone ?? null,
              is_active: 1,
            },
            conn,
          );
          await this.repo.linkAgencyContact(agencyId, contactId, conn);
        } else {
          await this.db.query(
            `UPDATE contacts SET email=?, phone_number=?, alternate_phone_number=? WHERE id=?`,
            [
              payload.email_address,
              payload.phone_number ?? null,
              payload.alternate_phone ?? null,
              contactId,
            ],
            conn,
          );
        }
      }
    });
  }

  public async softDeleteAgency(agencyId: string): Promise<void> {
    await this.repo.softDeleteAgency(agencyId);
  }

  public async getAgencyById(agencyId: string, includeInactive = false) {
    return this.repo.getAgencyAggregateById(agencyId, includeInactive);
  }

  public async assignUserToAgency(data: IUserAgency): Promise<void> {
    await this.repo.assignUserToAgency(data);
  }

  public async deactivateUserAgency(
    userId: string,
    agencyId: string,
  ): Promise<void> {
    await this.repo.deactivateUserAgency(userId, agencyId);
  }

  public async createAddress(address: Omit<IAddress, "id">): Promise<number> {
    return this.repo.createAddress(address);
  }

  public async updateAddress(
    id: number,
    data: Partial<IAddress>,
  ): Promise<void> {
    await this.db.query(
      `UPDATE addresses SET address_line_1=?, address_line_2=?, is_active=? WHERE id=?`,
      [data.address_line_1, data.address_line_2 ?? null, data.is_active, id],
    );
  }

  public async createContact(contact: Omit<IContact, "id">): Promise<number> {
    return this.repo.createContact(contact);
  }

  public async updateContact(
    id: number,
    data: Partial<IContact>,
  ): Promise<void> {
    await this.db.query(
      `UPDATE contacts SET email=?, phone_number=?, alternate_phone_number=?, is_active=? WHERE id=?`,
      [
        data.email,
        data.phone_number ?? null,
        data.alternate_phone_number ?? null,
        data.is_active,
        id,
      ],
    );
  }

  public async createLocation(
    location: Omit<ILocation, "id">,
  ): Promise<number> {
    return this.repo.createLocation(location);
  }

  public async getAllAgencies(includeInactive = false) {
    return this.repo.getAllAgencies(includeInactive);
  }

  public async getAgenciesByUserId(userId: string) {
    return this.repo.getAgenciesByUserId(userId);
  }
}
