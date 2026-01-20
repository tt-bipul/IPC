import { Router } from "express";
import { RoleController } from "./Role.controller";
import { AuthMiddleware } from "../../middlewares/AuthMiddleware";
import { UserRole } from "../user/User.types";

export class RoleRoutes {
    public router: Router;
    private roleController: RoleController;

    constructor() {
        this.router = Router();
        this.roleController = new RoleController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            "/",
            AuthMiddleware.authenticate,
            AuthMiddleware.restrictTo([UserRole.SUPER_ADMIN]),
            AuthMiddleware.ValidateRequestBody({
                required: true,
                type: "json",
            }),
            this.roleController.create
        );

        this.router.get(
            "/",
            AuthMiddleware.authenticate,
            AuthMiddleware.restrictTo([UserRole.SUPER_ADMIN]),
            this.roleController.getRole
        );

        this.router.put(
            "/:id",
            AuthMiddleware.authenticate,
            AuthMiddleware.restrictTo([UserRole.SUPER_ADMIN]),
            AuthMiddleware.ValidateRequestBody({
                required: true,
                type: "json",
            }),
            this.roleController.updateRole
        );


        this.router.post(
            "/assign",
            AuthMiddleware.authenticate,
            AuthMiddleware.restrictTo([UserRole.SUPER_ADMIN]),
            AuthMiddleware.ValidateRequestBody({
                required: true,
                type: "json",
            }),
            this.roleController.assignRole
        );

        this.router.post(
            "/remove",
            AuthMiddleware.authenticate,
            AuthMiddleware.restrictTo([UserRole.SUPER_ADMIN]),
            AuthMiddleware.ValidateRequestBody({
                required: true,
                type: "json",
            }),
            this.roleController.removeRole
        );
    }
}
