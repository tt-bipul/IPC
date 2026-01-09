import { Router } from "express";
import { AgencyController } from "./Agency.controller";
import { AuthMiddleware } from "../../middlewares/AuthMiddleware";
import { UserRole } from "../user/User.types";

export class AgencyRoutes {
  public router: Router;
  private agencyController: AgencyController;

  constructor() {
    this.router = Router();
    this.agencyController = new AgencyController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo([UserRole.TENANT_ADMIN]),
      this.agencyController.create
    );

    this.router.get(
      "/tenant/:tenantId",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo([UserRole.TENANT_ADMIN]),
      this.agencyController.getByTenant
    );

    this.router.get(
      "/:id",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo([UserRole.TENANT_ADMIN, UserRole.VP]),
      this.agencyController.getById
    );

    this.router.get(
      "/get-all",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo([UserRole.TENANT_ADMIN]),
      this.agencyController.getAllAgencies
    );
  }
}
