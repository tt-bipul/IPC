import { RoleRepository } from "./Role.repository";
import { v4 as uuidv4 } from "uuid";
import { RolesInterface } from "./Roles.types";
import { AppError } from "../../core/ErrorHandler";
import Roles from "./Role.model";

export default class RoleService {
  private RoleRepo: RoleRepository;
  constructor() {
    this.RoleRepo = new RoleRepository();
  }

  public async createRole(roles: RolesInterface): Promise<RolesInterface> {
    if (!roles.role) {
      throw new AppError("Empty Roles not accepted.", 400);
    }
    const checkRole = await this.RoleRepo.findByName(roles.role);
    if (checkRole) {
      throw new AppError("Role already exist.", 400);
    }
    const newRole: Roles = {
      id: uuidv4(),
      role: roles.role,
    };
    try {
      await this.RoleRepo.create(newRole);
      return newRole;
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  public async getRole(data: { id?: string; role?: string }): Promise<RolesInterface | null> {
    if (data.id) {
      return await this.RoleRepo.findById(data.id);
    } else if (data.role) {
      return await this.RoleRepo.findByName(data.role);
    }
    return null;
  }
}
