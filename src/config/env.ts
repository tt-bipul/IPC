import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
    serviceUri: string;
    jwtSecret: string;
    port: number;
    db: {
        host: string;
        user: string;
        pass: string;
        name: string;
        port: number;
        sslMode: string;
    }
}

export const env: EnvConfig = {
    serviceUri: process.env.SERVICE_URI || '',
    jwtSecret: process.env.JWT_SECRET || 'default_secret',
    port: parseInt(process.env.PORT || '3000'),
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        pass: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'insurance_policy_app',
        port: parseInt(process.env.DB_PORT || '3306'),
        sslMode: process.env.DB_SSL_MODE || 'REQUIRED'
    }
};
