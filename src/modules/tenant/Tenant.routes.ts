import { Router } from 'express';
import { TenantController } from './Tenant.controller';
import { AuthMiddleware } from '../../middlewares/AuthMiddleware';
import { UserRole } from '../user/User.types';




export class TenantRoutes {
    public router: Router;
    private tenantController: TenantController;

    constructor() {
        this.router = Router();
        this.tenantController = new TenantController();
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.post('/', AuthMiddleware.authenticate, AuthMiddleware.restrictTo([UserRole.TENANT_ADMIN]), this.tenantController.create);


        this.router.get('/', AuthMiddleware.authenticate, AuthMiddleware.restrictTo([UserRole.TENANT_ADMIN]), this.tenantController.getAll);


        this.router.get('/:id', AuthMiddleware.authenticate, AuthMiddleware.restrictTo([UserRole.TENANT_ADMIN]), this.tenantController.getById);
    }
}
