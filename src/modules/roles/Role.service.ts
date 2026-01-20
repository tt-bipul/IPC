import { RoleRepository } from "./Role.repository";
import { IRole, IUserRole } from "./Roles.types";
import { AppError } from "../../core/ErrorHandler";

export class RoleService {
  private roleRepo: RoleRepository;

  constructor() {
    this.roleRepo = new RoleRepository();
  }

  public async createRole(code: string): Promise<number> {
    if (!code) {
      throw new AppError("Role code is required", 400);
    }
    const existing = await this.roleRepo.getRole(code);
    if (existing) {
      throw new AppError("Role already exists", 400);
    }
    return this.roleRepo.createRole(code);
  }

  public async getRole(identifier: number | string): Promise<IRole | null> {
    return this.roleRepo.getRole(identifier);
  }

  public async getAllRoles(): Promise<IRole[]> {
    return this.roleRepo.getAllRoles();
  }

  public async updateRole(id: number, code: string): Promise<void> {
    if (!id || !code) {
      throw new AppError("Role ID and code are required", 400);
    }

    const existingRole = await this.roleRepo.getRole(id);
    if (!existingRole) {
      throw new AppError("Role not found", 404);
    }

    const duplicateCheck = await this.roleRepo.getRole(code);
    if (duplicateCheck && duplicateCheck.id !== id) {
      throw new AppError("Role code already exists", 400);
    }

    await this.roleRepo.updateRole(id, code);
  }

  public async assignRole(data: IUserRole): Promise<void> {
    if (!data.user_id || !data.role_id) {
      throw new AppError("user_id and role_id are required", 400);
    }

    // Check if role exists
    const role = await this.roleRepo.getRole(data.role_id);
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    await this.roleRepo.assignRole(data);
  }

  public async removeRole(data: IUserRole): Promise<void> {
    if (!data.user_id || !data.role_id) {
      throw new AppError("user_id and role_id are required", 400);
    }
    await this.roleRepo.removeRole(data);
  }

  public async getUserRoles(userId: string): Promise<string[]> {
    return this.roleRepo.getUserRoles(userId);
  }
}
