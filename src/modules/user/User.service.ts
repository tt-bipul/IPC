import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "./User.repository";
import {
  IUser,
  IUserProfile,
  IUserRole,
  IUserPhoneNumber,
  IUserAddress,
  IAgency,
} from "./User.types";
import { AppError } from "../../core/ErrorHandler";
import { env } from "../../config/env";

export class UserService {
  private repo = new UserRepository();

  public async register(payload: {
    username: string;
    email: string;
    password: string;
    roles?: number[];
    profile?: IUserProfile;
    phones?: string[];
    addresses?: { address: string; country?: string }[];
  }): Promise<IUser> {
    const existing = await this.repo.getUserByEmail(payload.email);
    if (existing) {
      throw new AppError("Email already exists", 400);
    }

    const password_hash = await bcrypt.hash(payload.password, 10);

    const userId = await this.repo.createUser({
      username: payload.username,
      email: payload.email,
      password_hash,
      is_active: true,
      is_deleted: false,
      last_login_at: null,
      password_updated_at: null,
    });

    if (payload.profile) {
      await this.repo.upsertUserProfile({
        ...payload.profile,
        user_id: userId,
      });
    }

    if (payload.roles) {
      for (const roleId of payload.roles) {
        await this.repo.assignRole({ user_id: userId, role_id: roleId });
      }
    }

    if (payload.phones) {
      for (const phone of payload.phones) {
        await this.repo.addUserPhone({
          user_id: userId,
          phone_number: phone,
        });
      }
    }

    if (payload.addresses) {
      for (const addr of payload.addresses) {
        await this.repo.addUserAddress({
          user_id: userId,
          address: addr.address,
          country: addr.country,
        });
      }
    }

    const user = await this.repo.getUserById(userId);
    if (!user) {
      throw new AppError("User creation failed", 500);
    }

    return user;
  }

  public async login(email: string, password: string) {
    const user = await this.repo.getUserByEmail(email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.is_active || user.is_deleted) {
      throw new AppError("User is inactive or deleted", 403);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, {
      expiresIn: "1d",
    });

    return { user, token };
  }

  public async getUserById(id: string): Promise<IUser> {
    const user = await this.repo.getUserById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  public async updateUser(
    id: string,
    payload: Partial<IUser> & { profile?: IUserProfile }
  ): Promise<void> {
    const user = await this.repo.getUserById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    await this.repo.updateUser(id, payload);

    if (payload.profile) {
      await this.repo.upsertUserProfile({
        ...payload.profile,
        user_id: id,
      });
    }
  }

  public async deleteUser(id: string): Promise<void> {
    const user = await this.repo.getUserById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    await this.repo.deleteUser(id);
  }

  public async createAgency(
    payload: Omit<IAgency, "id" | "created_at" | "updated_at">
  ) {
    return this.repo.createAgency(payload);
  }

  public async updateAgency(id: string, payload: Partial<IAgency>) {
    await this.repo.updateAgency(id, payload);
  }

  public async deleteAgency(id: string) {
    await this.repo.deleteAgency(id);
  }

  public async createRole(code: string): Promise<number> {
    if (!code) {
      throw new AppError("Role code is required", 400);
    }
    return this.repo.createRole(code);
  }

  public async assignRole(data: IUserRole): Promise<void> {
    if (!data.user_id || !data.role_id) {
      throw new AppError("user_id and role_id are required", 400);
    }
    await this.repo.assignRole(data);
  }

  public async removeRole(data: IUserRole): Promise<void> {
    if (!data.user_id || !data.role_id) {
      throw new AppError("user_id and role_id are required", 400);
    }
    await this.repo.removeRole(data);
  }
}
