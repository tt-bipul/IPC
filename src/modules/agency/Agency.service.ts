import { AgencyCreateRepository } from "./Repositories/create.repository";
import { AgencyReadRepository } from "./Repositories/read.repository";
import { AgencyUpdateRepository } from "./Repositories/update.repository";
import { AgencyDeleteRepository } from "./Repositories/delete.repository";
import { AgencyAssociationRepository } from "./Repositories/association.repository";
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

export class AgencyService {
  private createRepo = new AgencyCreateRepository();
  private readRepo = new AgencyReadRepository();
  private updateRepo = new AgencyUpdateRepository();
  private deleteRepo = new AgencyDeleteRepository();
  private associationRepo = new AgencyAssociationRepository();
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
        const exists = await this.readRepo.existsByBranchCode(
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

      const contactExists = await this.readRepo.existsByContactDetails(
        payload.email_address,
        payload.phone_number,
        payload.alternate_phone,
        conn,
      );

      if (contactExists) {
        throw new AppError(
          "Contact details (email or phone) already exist",
          HttpStatus.BAD_REQUEST, // Or CONFLICT
        );
      }

      const agencyId = await this.createRepo.createAgency(
        {
          agency_name: payload.agency_name,
          branch_code: payload.branch_code ?? null,
          is_active: 1,
        },
        conn,
      );

      const locationId = await this.createRepo.createLocation(
        {
          city: payload.city,
          state: payload.state,
          country: payload.country,
          pincode: payload.postal_code,
        },
        conn,
      );

      const addressId = await this.createRepo.createAddress(
        {
          address_line_1: payload.address_line_1,
          address_line_2: payload.address_line_2 ?? null,
          location_id: locationId,
          is_active: 1,
        },
        conn,
      );

      await this.associationRepo.linkAgencyAddress(agencyId, addressId, conn);

      const contactId = await this.createRepo.createContact(
        {
          email: payload.email_address,
          phone_number: payload.phone_number ?? null,
          alternate_phone_number: payload.alternate_phone ?? null,
          is_active: 1,
        },
        conn,
      );

      await this.associationRepo.linkAgencyContact(agencyId, contactId, conn);

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
  ): Promise<any> {
    return this.db.withTransaction(async (conn) => {
      // Check if agency exists
      const existingAgency = await this.readRepo.getAgencyAggregateById(
        agencyId,
        true,
        conn,
      );

      if (!existingAgency) {
        throw new AppError("Agency not found", HttpStatus.NOT_FOUND);
      }

      await this.updateRepo.updateAgency(
        agencyId,
        {
          agency_name: payload.agency_name,
          branch_code: payload.branch_code,
        },
        conn,
      );

      const contactRes = await this.readRepo.getAgencyAssociatedId(
        "contact_id",
        agencyId,
        conn,
      );
      let contactId = contactRes.contact_id;

      // Re-implementing the block properly to handle both Create (if missing) and Update (with check)
      if (
        payload.email_address ||
        payload.phone_number ||
        payload.alternate_phone
      ) {
        if (contactId === undefined) {
          // Check regular duplicates (no ID to exclude)
          const exists = await this.readRepo.existsByContactDetails(
            payload.email_address ?? "NA",
            payload.phone_number,
            payload.alternate_phone,
            conn,
          );
          if (exists)
            throw new AppError(
              "Contact details already exist",
              HttpStatus.BAD_REQUEST,
            );

          contactId = await this.createRepo.createContact(
            {
              email: payload.email_address ?? "NA",
              phone_number: payload.phone_number ?? null,
              alternate_phone_number: payload.alternate_phone ?? null,
              is_active: 1,
            },
            conn,
          );
          await this.associationRepo.linkAgencyContact(
            agencyId,
            contactId,
            conn,
          );
        } else {
          // Check duplicates excluding self
          const exists =
            await this.readRepo.existsByContactDetailsExcludingContactId(
              contactId,
              payload.email_address ?? "NA",
              payload.phone_number,
              payload.alternate_phone,
              conn,
            );

          if (exists)
            throw new AppError(
              "Contact details (email or phone) already exist with another agency",
              HttpStatus.BAD_REQUEST,
            );

          await this.updateRepo.updateContact(
            contactId,
            {
              email: payload.email_address,
              phone_number: payload.phone_number ?? null,
              alternate_phone_number: payload.alternate_phone ?? null,
            },
            conn,
          );
        }
      }

      if (
        payload.address_line_1 ||
        payload.address_line_2 ||
        payload.city ||
        payload.state ||
        payload.country ||
        payload.postal_code
      ) {
        // ALWAYS Create New Strategy
        // We ignore existing addressId/locationId and create fresh ones.

        const locationId = await this.createRepo.createLocation(
          {
            city: payload.city ?? existingAgency.city ?? "NA",
            state: payload.state ?? existingAgency.state ?? "NA",
            country: payload.country ?? existingAgency.country ?? "NA",
            pincode: payload.postal_code ?? existingAgency.postal_code ?? "NA",
          },
          conn,
        );

        const addressId = await this.createRepo.createAddress(
          {
            address_line_1:
              payload.address_line_1 ?? existingAgency.address_line_1 ?? "NA",
            address_line_2:
              payload.address_line_2 ?? existingAgency.address_line_2 ?? null,
            location_id: locationId,
            is_active: 1,
          },
          conn,
        );

        // Link new address to agency (updating the link)
        await this.associationRepo.linkAgencyAddress(agencyId, addressId, conn);
      }

      return this.readRepo.getAgencyAggregateById(agencyId, true, conn);
    });
  }

  public async softDeleteAgency(agencyId: string): Promise<void> {
    await this.deleteRepo.softDeleteAgency(agencyId);
  }

  public async getAgencyById(agencyId: string, includeInactive = false) {
    return this.readRepo.getAgencyAggregateById(agencyId, includeInactive);
  }

  public async assignUserToAgency(data: IUserAgency): Promise<void> {
    await this.associationRepo.assignUserToAgency(data);
  }

  public async deactivateUserAgency(
    userId: string,
    agencyId: string,
  ): Promise<void> {
    await this.deleteRepo.deactivateUserAgency(userId, agencyId);
  }

  public async createAddress(address: Omit<IAddress, "id">): Promise<number> {
    return this.createRepo.createAddress(address);
  }

  public async updateAddress(
    id: number,
    data: Partial<IAddress>,
  ): Promise<void> {
    await this.updateRepo.updateAddress(id, {
      address_line_1: data.address_line_1,
      address_line_2: data.address_line_2,
      is_active: data.is_active,
    });
  }

  public async createContact(contact: Omit<IContact, "id">): Promise<number> {
    return this.createRepo.createContact(contact);
  }

  public async updateContact(
    id: number,
    data: Partial<IContact>,
  ): Promise<void> {
    await this.updateRepo.updateContact(id, {
      email: data.email,
      phone_number: data.phone_number,
      alternate_phone_number: data.alternate_phone_number,
      is_active: data.is_active,
    });
  }

  public async createLocation(
    location: Omit<ILocation, "id">,
  ): Promise<number> {
    return this.createRepo.createLocation(location);
  }

  public async getAllAgencies(includeInactive = false) {
    return this.readRepo.getAllAgencies(includeInactive);
  }

  public async getAgenciesByUserId(userId: string) {
    return this.readRepo.getAgenciesByUserId(userId);
  }
}
