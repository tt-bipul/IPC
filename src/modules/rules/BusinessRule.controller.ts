import { Request, Response, NextFunction } from 'express';
// import { BusinessRuleService } from './BusinessRule.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/AsyncHandler';
import { AuthRequest } from '../../middlewares/AuthMiddleware';

// export class BusinessRuleController {
//     private ruleService: BusinessRuleService;

//     constructor() {
//         this.ruleService = new BusinessRuleService();
//     }

//     // public create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//     //     const authReq = req as AuthRequest;
//     //     const rule = await this.ruleService.createRule(authReq.user, req.body);
//     //     ApiResponse.success(res, rule, 'Rule created successfully', 201);
//     // });

//     // public getByAgency = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//     //     const authReq = req as AuthRequest;
//     //     const rules = await this.ruleService.getRulesByAgency(authReq.user, req.params.agencyId);
//     //     ApiResponse.success(res, rules);
//     // });
// }
