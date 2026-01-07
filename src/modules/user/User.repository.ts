import { Database } from '../../core/Database';
import { IUser } from './User.types';
import { RowDataPacket } from 'mysql2';

export class UserRepository {
    private db = Database.getInstance();

    public async findByEmail(email: string): Promise<IUser | null> {
        const users = await this.db.query<IUser[] & RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return users.length ? users[0] : null;
    }

    public async findByUsername(username: string): Promise<IUser | null> {
        const users = await this.db.query<IUser[] & RowDataPacket[]>(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return users.length ? users[0] : null;
    }

    public async create(user: IUser): Promise<void> {
        await this.db.query(
            `INSERT INTO users (
                id, tenant_id, agency_id, username, user_role, 
                first_name, middle_name, last_name, email, 
                phone_number, country, address, password_hash, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user.id, user.tenant_id, user.agency_id, user.username, user.user_role,
                user.first_name, user.middle_name, user.last_name, user.email,
                user.phone_number, user.country, user.address, user.password_hash, user.is_active
            ]
        );
    }

    public async findById(id: string): Promise<IUser | null> {
        const users = await this.db.query<IUser[] & RowDataPacket[]>(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return users.length ? users[0] : null;
    }
}
