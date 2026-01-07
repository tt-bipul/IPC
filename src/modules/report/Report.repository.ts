import { Database } from '../../core/Database';
import { IReport } from './Report.types';
import { RowDataPacket } from 'mysql2';

export class ReportRepository {
    private db = Database.getInstance();

    public async create(report: IReport): Promise<void> {
        await this.db.query(
            `INSERT INTO reports (id, agent_id, status, pdf_path) 
             VALUES (?, ?, ?, ?)`,
            [report.id, report.agent_id, report.status, report.pdf_path]
        );
    }

    public async findByAgent(agentId: string): Promise<IReport[]> {
        return await this.db.query<IReport[] & RowDataPacket[]>(
            'SELECT * FROM reports WHERE agent_id = ?',
            [agentId]
        );
    }
}
