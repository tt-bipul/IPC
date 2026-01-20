import { Database } from '../../core/Database';
import { IBusinessRule } from './BusinessRule.types';
import { RowDataPacket } from 'mysql2';

// export class BusinessRuleRepository {
//     private db = Database.getInstance();

//     public async create(rule: IBusinessRule): Promise<void> {
//         await this.db.query(
//             `INSERT INTO business_rules (id, tenant_id, agency_id, field_name, rule_type, criteria, rule_priority, version, is_active) 
//              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [rule.id, rule.tenant_id, rule.agency_id, rule.field_name, rule.rule_type, JSON.stringify(rule.criteria), rule.rule_priority, rule.version, rule.is_active]
//         );
//     }

//     public async findByAgencyId(agencyId: string): Promise<IBusinessRule[]> {
//         const rules = await this.db.query<IBusinessRule[] & RowDataPacket[]>(
//             'SELECT * FROM business_rules WHERE agency_id = ?',
//             [agencyId]
//         );
//         return rules;
//     }

//     public async delete(id: string): Promise<void> {
//         await this.db.query('DELETE FROM business_rules WHERE id = ?', [id]);
//     }
// }
