import { Request, Response } from "express";
import { UserService } from "./User.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/AsyncHandler";

export class UserController {
  private service = new UserService();

  public register = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.register(req.body);
    ApiResponse.success(res, user, "User registered", 201);
  });

  public login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.service.login(email, password);
    ApiResponse.success(res, result, "Login successful");
  });

  public getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.getUserById(req.params.id);
    ApiResponse.success(res, user);
  });

  public updateUser = asyncHandler(async (req: Request, res: Response) => {
    await this.service.updateUser(req.params.id, req.body);
    ApiResponse.success(res, null, "User updated");
  });

  public deleteUser = asyncHandler(async (req: Request, res: Response) => {
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
}
