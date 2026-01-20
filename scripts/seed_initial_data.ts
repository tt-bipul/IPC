import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    ssl: process.env.DB_SSL_MODE === 'NOT_REQUIRED' ? undefined : { rejectUnauthorized: true },
    multipleStatements: true
};

async function main() {
    console.log('Connecting to database...');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Database: ${dbConfig.database}`);

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected successfully.');

        // 1. Check for all tables
        console.log('\n--- Checking Tables ---');
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Existing Tables:', tables);

        // 2. Add Roles
        console.log('\n--- Adding Roles ---');
        const roles = ['SUPER_ADMIN', 'VP', 'AGENCY_EXECUTIVE'];
        const roleIds: Record<string, number> = {};

        for (const roleCode of roles) {
            // Check if role exists
            const [existingRole]: any = await connection.query('SELECT * FROM roles WHERE code = ?', [roleCode]);

            if (existingRole.length > 0) {
                console.log(`Role ${roleCode} already exists. ID: ${existingRole[0].id}`);
                roleIds[roleCode] = existingRole[0].id;
            } else {
                console.log(`Creating role ${roleCode}...`);
                const [result]: any = await connection.query('INSERT INTO roles (code) VALUES (?)', [roleCode]);
                console.log(`Role ${roleCode} created. ID: ${result.insertId}`);
                roleIds[roleCode] = result.insertId;
            }
        }

        // 3. Add User with Dummy Credentials
        console.log('\n--- Adding User ---');
        const dummyUser = {
            username: 'dummy_superadmin',
            email: 'superadmin@example.com',
            password: 'SecurePassword123!',
            is_active: true,
            is_deleted: false
        };

        // Check if user exists
        const [existingUser]: any = await connection.query('SELECT * FROM users WHERE email = ?', [dummyUser.email]);
        let userId: string;

        if (existingUser.length > 0) {
            console.log(`User ${dummyUser.email} already exists. ID: ${existingUser[0].id}`);
            userId = existingUser[0].id;
        } else {
            console.log(`Creating user ${dummyUser.email}...`);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(dummyUser.password, salt);
            userId = uuidv4();

            await connection.query(
                `INSERT INTO users (id, username, email, password_hash, is_active, is_deleted, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [userId, dummyUser.username, dummyUser.email, hashedPassword, dummyUser.is_active, dummyUser.is_deleted]
            );
            console.log(`User created. ID: ${userId}`);
            console.log(`Username: ${dummyUser.username}`);
            console.log(`Password (plain): ${dummyUser.password}`);
            console.log(`Password (hash): ${hashedPassword}`);
        }

        // 4. Assign SUPER_ADMIN role
        console.log('\n--- Assigning Role ---');
        const superAdminRoleId = roleIds['SUPER_ADMIN'];
        if (!superAdminRoleId) {
            throw new Error('SUPER_ADMIN role ID not found!');
        }

        // Check if role already assigned
        const [existingAssignment]: any = await connection.query(
            'SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?',
            [userId, superAdminRoleId]
        );

        if (existingAssignment.length > 0) {
            console.log('User already has SUPER_ADMIN role.');
        } else {
            console.log('Assigning SUPER_ADMIN role to user...');
            await connection.query(
                'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
                [userId, superAdminRoleId]
            );
            console.log('Role assigned successfully.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nConnection closed.');
        }
    }
}

main();
