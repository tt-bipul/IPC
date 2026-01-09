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
      branch_code: data.branch_code || (null as any),
      phone_number: data.phone_number || (null as any),
      alternate_phone_number: data.alternate_phone_number || (null as any),
      country: data.country || (null as any),
      address_line_1: data.address_line_1 || (null as any),
      address_line_2: data.address_line_2 || (null as any),
      pincode: data.pincode || (null as any),
      state: data.state || (null as any),
      city: data.city || (null as any),
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
