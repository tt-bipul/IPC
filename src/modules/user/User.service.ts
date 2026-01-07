import { UserRepository } from './User.repository';
import { CreateUserDTO, IUser } from './User.types';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../core/ErrorHandler';

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    public async register(userData: CreateUserDTO): Promise<IUser> {
        const existingEmail = await this.userRepository.findByEmail(userData.email);
        if (existingEmail) {
            throw new AppError('User with this email already exists', 400);
        }

        const existingUsername = await this.userRepository.findByUsername(userData.username);
        if (existingUsername) {
            throw new AppError('User with this username already exists', 400);
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const newUser: IUser = {
            id: uuidv4(),
            tenant_id: userData.tenant_id || null as any,
            agency_id: userData.agency_id || null as any,
            username: userData.username,
            user_role: userData.user_role,
            first_name: userData.first_name,
            middle_name: userData.middle_name || null as any,
            last_name: userData.last_name,
            email: userData.email,
            phone_number: userData.phone_number || null as any,
            country: userData.country || null as any,
            address: userData.address || null as any,
            password_hash: hashedPassword,
            is_active: true
        };

        await this.userRepository.create(newUser);
        return newUser;
    }

    public async login(email: string, password: string): Promise<IUser> {
        const user = await this.userRepository.findByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw new AppError('Invalid credentials', 401);
        }
        if (!user.is_active) {
            throw new AppError('User is inactive', 403);
        }
        return user;
    }
}
