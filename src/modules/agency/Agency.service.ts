import { AgencyRepository } from "./Agency.repository";
import { IAgency, ICreateAgencyPayload } from "./Agency.types";
import { v4 as uuidv4 } from "uuid";

export class AgencyService {
  private repo: AgencyRepository;

  constructor() {
    this.repo = new AgencyRepository();
  }

  public async createAgency(payload: ICreateAgencyPayload) {
    const agencyId = await this.repo.createAgency({
      agency_name: payload.agency_name,
      branch_code: payload.branch_code,
      vp_user_id: payload.vp_user_id,
      is_active: payload.is_active ?? true,
    });

    if (payload.addresses) {
      for (const addr of payload.addresses) {
        const locationId = await this.repo.createLocation(addr.location);
        const addressId = await this.repo.createAddress({
          address_line_1: addr.address_line_1,
          address_line_2: addr.address_line_2,
          location_id: locationId,
        });
        await this.repo.linkAgencyAddress({
          agency_id: agencyId,
          address_id: addressId,
        });
      }
    }

    if (payload.contacts) {
      for (const contact of payload.contacts) {
        const contactId = await this.repo.createContact(contact);
        await this.repo.linkAgencyContact({
          agency_id: agencyId,
          contact_id: contactId,
        });
      }
    }

    return agencyId;
  }

  public async updateAgency(id: string, payload: Partial<IAgency>) {
    await this.repo.updateAgency(id, payload);
  }

  public async deleteAgency(id: string) {
    await this.repo.deleteAgency(id);
  }

  public async getAgencyById(id: string) {
    return this.repo.getAgencyById(id);
  }

  public async assignUserToAgency(
    userId: string,
    agencyId: string
  ): Promise<void> {
    await this.repo.createUserAgency({
      user_id: userId,
      agency_id: agencyId,
      is_active: true,
      assigned_at: new Date(),
    });
  }

  public async removeUserFromAgency(
    userId: string,
    agencyId: string
  ): Promise<void> {
    await this.repo.deleteUserAgency(userId, agencyId);
  }
}
