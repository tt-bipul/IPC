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
      // AuthMiddleware.authenticate,
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.register
    );

    this.router.post(
      "/login",
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.login
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
      "/agency",
      AuthMiddleware.authenticate,
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.createAgency
    );

    this.router.put(
      "/agency/:id",
      AuthMiddleware.authenticate,
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.updateAgency
    );

    this.router.delete(
      "/agency/:id",
      AuthMiddleware.authenticate,
      this.controller.deleteAgency
    );

    this.router.post(
      "/roles",
      // AuthMiddleware.authenticate,
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.createRole
    );

    this.router.post(
      "/roles/assign",
      AuthMiddleware.authenticate,
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.assignRole
    );

    this.router.post(
      "/roles/remove",
      AuthMiddleware.authenticate,
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.removeRole
    );
  }
}
