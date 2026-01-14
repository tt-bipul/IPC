import { Database } from "../../core/Database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "./User.repository";
import {
  IUser,
  IUserProfile,
  IUserRole,
  IUserPhoneNumber,
  IUserAddress,
  IUserCreatePayLoad,
  PayloadCurrentUser,
} from "./User.types";
import { AppError } from "../../core/ErrorHandler";
import { env } from "../../config/env";
import { UserRole } from "./User.types";
import { AgencyRepository } from "../../modules/agency/Agency.repository";

export class UserService {
  private repo = new UserRepository();

  public async register(
    payload: IUserCreatePayLoad,
    currentUser: PayloadCurrentUser
  ): Promise<IUser> {
    return Database.getInstance().withTransaction(async (conn) => {
      const existingEmail = await this.repo.getUserByEmail(payload.email, conn);
      if (existingEmail) {
        throw new AppError("Email already exists", 400);
      }
      const existingUsername = await this.repo.getUserByUsername(
        payload.username,
        conn
      );
      if (existingUsername) {
        throw new AppError("Username already exists", 400);
      }
      const password_hash = await bcrypt.hash(payload.password, 10);
      const userId = await this.repo.createUser(
        {
          username: payload.username,
          email: payload.email,
          password_hash,
          is_active: true,
          is_deleted: false,
          last_login_at: null,
          password_updated_at: null,
        },
        conn
      );
      const agencyRepo = new AgencyRepository();
      if (payload.profile) {
        await this.repo.upsertUserProfile(
          {
            ...payload.profile,
            user_id: userId,
          },
          conn
        );
      }
      if (currentUser?.roles?.includes(UserRole.SUPER_ADMIN)) {
        if (payload.roles) {
          for (const roleId of payload.roles) {
            const checkIfRoleExist = await this.repo.getRole(roleId, conn);
            if (!checkIfRoleExist) {
              throw new AppError("Invalid Role Entered", 400);
            }
            await this.repo.assignRole(
              { user_id: userId, role_id: checkIfRoleExist.id },
              conn
            );
          }
        }
        await agencyRepo.createUserAgency(
          {
            user_id: userId,
            agency_id: payload.agencyId,
            is_active: true,
            assigned_at: new Date(),
          },
          conn
        );
      }
      if (currentUser?.roles?.includes(UserRole.VP)) {
        const agency = await agencyRepo.getAgencyByVpId(currentUser.id, conn);
        if (agency) {
          await agencyRepo.createUserAgency(
            {
              user_id: userId,
              agency_id: agency.agency_id,
              is_active: true,
              assigned_at: new Date(),
            },
            conn
          );
        }
        const getRole = await this.repo.getRole("AGENT", conn);
        if (getRole) {
          await this.repo.assignRole(
            { user_id: userId, role_id: getRole.id },
            conn
          );
        }
      }
      if (payload.phones) {
        for (const phone of payload.phones) {
          await this.repo.addUserPhone(
            {
              user_id: userId,
              phone_number: phone,
            },
            conn
          );
        }
      }
      if (payload.addresses) {
        for (const addr of payload.addresses) {
          await this.repo.addUserAddress(
            {
              user_id: userId,
              address: addr.address,
              country: addr.country,
              addressType: addr.addressType,
            },
            conn
          );
        }
      }
      const user = await this.repo.getUserById(userId, conn);
      if (!user) {
        throw new AppError("User creation failed", 500);
      }

      return user;
    });
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
    const roles = await this.repo.getUserRoles(user.id);
    const token = jwt.sign(
      { id: user.id, email: user.email, roles },
      env.jwtSecret,
      {
        expiresIn: "1d",
      }
    );

    // Update last login timestamp
    await this.repo.updateUser(user.id, { last_login_at: new Date() });

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

    const { profile, ...userData } = payload;
    if (Object.keys(userData).length > 0) {
      await this.repo.updateUser(id, userData);
    }

    if (profile) {
      await this.repo.upsertUserProfile({
        ...profile,
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

  public async getAllUsers(currentUser: {
    id: string;
    roles: string[];
  }): Promise<IUser[]> {
    if (currentUser.roles.includes(UserRole.SUPER_ADMIN)) {
      return this.repo.getAllUsers();
    } else if (currentUser.roles.includes(UserRole.VP)) {
      return this.repo.getUsersByVpId(currentUser.id);
    } else {
      throw new AppError("Access denied", 403);
    }
  }
  public async backDoor(type: string, body: any): Promise<any> {
    if (type === "1") {
      return new UserRepository().getRole(body);
    }
  }
}
