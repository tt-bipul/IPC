// import { BusinessRuleRepository } from './BusinessRule.repository';
import { CreateRuleDTO, IBusinessRule } from './BusinessRule.types';
import { v4 as uuidv4 } from 'uuid';
import { IUser } from '../user/User.types';
import { AppError } from '../../core/ErrorHandler';

// export class BusinessRuleService {
//     private ruleRepository: BusinessRuleRepository;

//     constructor() {
//         this.ruleRepository = new BusinessRuleRepository();
//     }

//     // public async createRule(currentUser: IUser, data: CreateRuleDTO): Promise<IBusinessRule> {
        
        
        

//     //     const newRule: IBusinessRule = {
//     //         id: uuidv4(),
//     //         // tenant_id: currentUser.tenant_id!,
//     //         agency_id: data.agency_id,
//     //         field_name: data.field_name,
//     //         rule_type: data.rule_type,
//     //         criteria: data.criteria || {},
//     //         rule_priority: data.rule_priority || 1,
//     //         version: data.version || 1,
//     //         is_active: true
//     //     };

//     //     await this.ruleRepository.create(newRule);
//     //     return newRule;
//     // }

//     // public async getRulesByAgency(currentUser: IUser, agencyId: string): Promise<IBusinessRule[]> {
        
        
        
//     //     return await this.ruleRepository.findByAgencyId(agencyId);
//     // }

//     // public async removeRule(currentUser: IUser, ruleId: string): Promise<void> {
//     //     await this.ruleRepository.delete(ruleId);
//     // }
// }
