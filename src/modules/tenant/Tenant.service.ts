import { TenantRepository } from './Tenant.repository';
import { CreateTenantDTO, ITenant } from './Tenant.types';
import { v4 as uuidv4 } from 'uuid';

export class TenantService {
    private tenantRepository: TenantRepository;

    constructor() {
        this.tenantRepository = new TenantRepository();
    }

    public async createTenant(data: CreateTenantDTO): Promise<ITenant> {
        const newTenant: ITenant = {
            id: uuidv4(),
            name: data.name,
            company_email: data.company_email || null as any,
            phone_number: data.phone_number || null as any,
            country: data.country || null as any,
            address: data.address || null as any
        };
        await this.tenantRepository.create(newTenant);
        return newTenant;
    }

    public async getAllTenants(): Promise<ITenant[]> {
        return await this.tenantRepository.findAll();
    }

    public async getTenantById(id: string): Promise<ITenant | null> {
        return await this.tenantRepository.findById(id);
    }
}
