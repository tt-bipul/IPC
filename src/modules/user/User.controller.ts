import { Request, Response } from "express";
import { UserService } from "./User.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/AsyncHandler";
import { AppError } from "../../core/ErrorHandler";
import { sanitizeUser } from "./User.utils";

export class UserController {
  private service = new UserService();

  public register = asyncHandler(async (req: any, res: Response) => {
    const currentUser = req.user;
    const { roles } = req.body;
    if (currentUser?.roles && !currentUser.roles.includes("SUPER_ADMIN")) {
      if (roles && roles.length > 0) {

      }
    }
    const user = await this.service.register(req.body, currentUser);
    ApiResponse.success(res, sanitizeUser(user), "User registered", 201);
  });

  public login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.service.login(email, password);
    ApiResponse.success(res, { ...result, user: sanitizeUser(result.user) }, "Login successful");
  });

  public getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.getUserById(req.params.id);
    ApiResponse.success(res, sanitizeUser(user));
  });

  public updateUser = asyncHandler(async (req: any, res: Response) => {
    const currentUser = req.user;
    if (
      currentUser.id !== req.params.id &&
      !currentUser.roles.includes('SUPER_ADMIN')
    ) {





      throw new AppError("You can only update your own profile", 403);
    }
    await this.service.updateUser(req.params.id, req.body);
    ApiResponse.success(res, null, "User updated");
  });

  public deleteUser = asyncHandler(async (req: any, res: Response) => {





    const currentUser = req.user;
    if (!currentUser.roles.includes('SUPER_ADMIN')) {
      throw new AppError("Only SUPER_ADMIN can delete users", 403);
    }
    await this.service.deleteUser(req.params.id);
    ApiResponse.success(res, null, "User deleted");
  });

  public createAgency = asyncHandler(async (req: Request, res: Response) => {
    const id = await this.service.createAgency(req.body);
    ApiResponse.success(res, { id }, "Agency created", 201);
  });

  public updateAgency = asyncHandler(async (req: Request, res: Response) => {
    await this.service.updateAgency(req.params.id, req.body);
    ApiResponse.success(res, null, "Agency updated");
  });

  public deleteAgency = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteAgency(req.params.id);
    ApiResponse.success(res, null, "Agency deleted");
  });

  public createRole = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    const roleId = await this.service.createRole(code);
    ApiResponse.success(res, { role_id: roleId }, "Role created", 201);
  });

  public assignRole = asyncHandler(async (req: Request, res: Response) => {
    const { user_id, role_id } = req.body;
    await this.service.assignRole({ user_id, role_id });
    ApiResponse.success(res, null, "Role assigned");
  });

  public removeRole = asyncHandler(async (req: Request, res: Response) => {
    const { user_id, role_id } = req.body;
    await this.service.removeRole({ user_id, role_id });
    ApiResponse.success(res, null, "Role removed");
  });

  public assignUserToAgency = asyncHandler(async (req: Request, res: Response) => {
    const { user_id, agency_id } = req.body;
    await this.service.assignUserToAgency(user_id, agency_id);
    ApiResponse.success(res, null, "User assigned to agency");
  });

  public removeUserFromAgency = asyncHandler(async (req: Request, res: Response) => {
    const { user_id, agency_id } = req.body;
    await this.service.removeUserFromAgency(user_id, agency_id);
    ApiResponse.success(res, null, "User removed from agency");
  });

  public getAllUsers = asyncHandler(async (req: any, res: Response) => {
    const users = await this.service.getAllUsers(req.user);
    ApiResponse.success(res, users.map(sanitizeUser));
  });
}
