import { Router } from 'express';
// import { BusinessRuleController } from './BusinessRule.controller';
import { AuthMiddleware } from '../../middlewares/AuthMiddleware';
import { UserRole } from '../user/User.types';




// export class BusinessRuleRoutes {
//     public router: Router;
//     private ruleController: BusinessRuleController;

//     constructor() {
//         this.router = Router();
//         this.ruleController = new BusinessRuleController();
//         this.initializeRoutes();
//     }

//     private initializeRoutes() {

//         this.router.post('/', AuthMiddleware.authenticate, AuthMiddleware.restrictTo([UserRole.VP, ]), this.ruleController.create);


//         this.router.get('/agency/:agencyId', AuthMiddleware.authenticate, AuthMiddleware.restrictTo([UserRole.VP, UserRole.AGENCY_EXECUTIVE]), this.ruleController.getByAgency);
//     }
// }
