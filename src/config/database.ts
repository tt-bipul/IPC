import { env } from './env';
import { PoolOptions } from 'mysql2/promise';

export const dbConfig: PoolOptions = {
    host: env.db.host,
    user: env.db.user,
    password: env.db.pass,
    database: env.db.name,
    port: env.db.port,
    ssl: env.db.sslMode === 'REQUIRED' ? { rejectUnauthorized: true } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
};
