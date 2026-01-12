import { AgencyRepository } from "./Agency.repository";
import { CreateAgencyDTO, IAgency } from "./Agency.types";
import { v4 as uuidv4 } from "uuid";

export class AgencyService {
  private agencyRepository: AgencyRepository;

  constructor() {
    this.agencyRepository = new AgencyRepository();
  }

  public async createAgency(data: CreateAgencyDTO): Promise<IAgency> {
    const newAgency: IAgency = {
      id: uuidv4(),
      tenant_id: data.tenant_id,
      agency_name: data.agency_name,
      email: data.email,
      branch_code: data.branch_code,
      phone_number: data.phone_number,
      is_active: true,
      vp_user_id: data.vp_user_id,

      
      contacts: data.contacts?.map(c => ({
        name: c.name,
        email: c.email,
        phone_number: c.phone_number,
        designation: c.designation,
        is_primary: c.is_primary
      })),

      
      addresses: data.addresses?.map(a => ({
        address_line_1: a.address_line_1,
        address_line_2: a.address_line_2,
        city: a.city,
        state: a.state,
        country: a.country,
        pincode: a.pincode,
        type: a.type
      }))
    };
    await this.agencyRepository.create(newAgency);
    return newAgency;
  }
  public async getAllAgencies(): Promise<IAgency[]> {
    return await this.agencyRepository.getAll();
  }
  public async getAgenciesByTenant(tenantId: string): Promise<IAgency[]> {
    return await this.agencyRepository.findByTenantId(tenantId);
  }

  public async getAgencyById(id: string): Promise<IAgency | null> {
    return await this.agencyRepository.findById(id);
  }
}
