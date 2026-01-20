import { Router } from "express";
import { AgencyController } from "./Agency.controller";
import { AuthMiddleware } from "../../middlewares/AuthMiddleware";

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
      this.controller.createAgency,
    );

    this.router.put(
      "/agency/:id",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN", "VP"]),
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.updateAgency,
    );

    this.router.delete(
      "/agency/:id",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN"]),
      this.controller.deleteAgency,
    );

    this.router.get(
      "/agency/:id",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN", "VP"]),
      this.controller.getAgencyById,
    );

    this.router.post(
      "/agency/assign-user",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN"]),
      AuthMiddleware.ValidateRequestBody({ required: true, type: "json" }),
      this.controller.assignUser,
    );

    this.router.put(
      "/agency/:agencyId/user/:userId/deactivate",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN"]),
      this.controller.deactivateUserAgency,
    );

    this.router.get(
      "/get-all",
      AuthMiddleware.authenticate,
      AuthMiddleware.restrictTo(["SUPER_ADMIN"]),
      this.controller.getAllAgencies,
    );
  }
}
