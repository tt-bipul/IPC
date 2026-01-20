import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import { dbConfig } from '../config/database';
import { Logger } from './Logger';

export class Database {
    private static instance: Database;
    private pool: Pool;

    private constructor() {
        this.pool = mysql.createPool(dbConfig);
        this.testConnection();
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    private async testConnection(): Promise<void> {
        try {
            const connection = await this.pool.getConnection();
            Logger.info('✅ Database connected successfully');
            connection.release();
        } catch (error) {
            Logger.error('❌ Database connection failed', error);
        }
    }

    public async query<T>(sql: string, params?: any[], conn?: PoolConnection): Promise<T> {
        try {
            const executor = conn || this.pool;
            const [rows] = await executor.execute(sql, params);
            return rows as T;
        } catch (error) {
            Logger.error(`Database Query Error: ${sql}`, error);
            throw error;
        }
    }

    public async getConnection(): Promise<PoolConnection> {
        return this.pool.getConnection();
    }

    public async withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
        const conn = await this.getConnection();
        try {
            await conn.beginTransaction();
            const result = await fn(conn);
            await conn.commit();
            return result;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
}
