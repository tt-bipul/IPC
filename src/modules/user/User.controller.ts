import { Request, Response } from "express";
import { UserService } from "./User.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/AsyncHandler";
import { AppError } from "../../core/ErrorHandler";
import { sanitizeUser } from "./User.utils";
import { validateUserCreatePayload } from "./validators/createUser.validator";

export class UserController {
  private service = new UserService();

  public register = asyncHandler(async (req: any, res: Response) => {
    const currentUser = req.user;
    validateUserCreatePayload(req.body, currentUser);
    const user = await this.service.register(req.body, currentUser);
    ApiResponse.success(res, sanitizeUser(user), "User registered", 201);
  });

  public login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.service.login(email, password);
    ApiResponse.success(
      res,
      { ...result, user: sanitizeUser(result.user) },
      "Login successful",
    );
  });

  public getUser = asyncHandler(async (req: Request, res: Response) => {
    console.log("Getting user with ID:", req.params.id);
    const user = await this.service.getUserById(req.params.id);
    ApiResponse.success(res, sanitizeUser(user));
  });

  public updateUser = asyncHandler(async (req: any, res: Response) => {
    const currentUser = req.user;
    if (
      currentUser.id !== req.params.id &&
      !currentUser.roles.includes("SUPER_ADMIN")
    ) {
      throw new AppError("You can only update your own profile", 403);
    }
    await this.service.updateUser(req.params.id, req.body);
    ApiResponse.success(res, null, "User updated");
  });

  public deleteUser = asyncHandler(async (req: any, res: Response) => {
    const currentUser = req.user;
    if (!currentUser.roles.includes("SUPER_ADMIN")) {
      throw new AppError("Only SUPER_ADMIN can delete users", 403);
    }
    await this.service.deleteUser(req.params.id);
    ApiResponse.success(res, null, "User deleted");
  });

  public getAllUsers = asyncHandler(async (req: any, res: Response) => {
    console.log("UserController.getAllUsers called by user ID:", req.user.id);
    const users = await this.service.getAllUsers(req.user);
    ApiResponse.success(res, users.map(sanitizeUser));
  });

  public forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await this.service.forgotPassword(email);
    ApiResponse.success(
      res,
      null,
      "If the account exists, a reset link has been sent",
    );
  });

  public resetPasswordWithToken = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { token, new_password } = req.body;
      await this.service.resetPasswordWithToken(token, new_password);
      ApiResponse.success(res, null, "Password reset successful");
    },
  );
  public resetPasswordByAdmin = asyncHandler(
    async (req: any, res: Response) => {
      const { user_id, new_password } = req.body;
      const currentUser = req.user;
      await this.service.resetPasswordByAdmin(
        user_id,
        new_password,
        currentUser,
      );
      ApiResponse.success(res, null, "Password reset successful");
    },
  );

  public backDoor = asyncHandler(async (req: any, res: Response) => {
    const { type, data } = req.body;
    const response = await this.service.backDoor(type, data);
    ApiResponse.success(res, response);
  });
}
