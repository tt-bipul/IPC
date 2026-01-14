import { Router } from "express";
import { AgencyController } from "./Agency.controller";
import { AuthMiddleware } from "../../middlewares/AuthMiddleware";
import { UserRole } from "../user/User.types";

export class AgencyRoutes {
  public router: Router;
  private controller: AgencyController;

  constructor() {
    this.router = Router();
    this.controller = new AgencyController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/agency",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN"]),
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.createAgency
    );

    this.router.put(
      "/agency/:id",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN", "VP"]),
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.updateAgency
    );

    this.router.delete(
      "/agency/:id",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN"]),
      this.controller.deleteAgency
    );

    this.router.post(
      "/user-agencies",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN"]),
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.assignUserToAgency
    );

    this.router.delete(
      "/user-agencies",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN"]),
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.removeUserFromAgency
    );
  }
}
