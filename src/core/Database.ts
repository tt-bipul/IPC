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

    public async query<T>(sql: string, params?: any[]): Promise<T> {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows as T;
        } catch (error) {
            Logger.error(`Database Query Error: ${sql}`, error);
            throw error;
        }
    }

    public async getConnection(): Promise<PoolConnection> {
        return this.pool.getConnection();
    }
}
