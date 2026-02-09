import { Router } from "express";
import { UserRoutes } from "../modules/user/User.routes";
import { TenantRoutes } from "../modules/tenant/Tenant.routes";
import { AgencyRoutes } from "../modules/agency/Agency.routes";
// import { BusinessRuleRoutes } from '../modules/rules/BusinessRule.routes';
import { DocumentRoutes } from "../modules/document/Document.routes";
import { ProcessRoutes } from "../modules/process/Process.routes";
import { RoleRoutes } from "../modules/roles/Role.routes";
import {
  SubscriptionRoutes,
  AgencySubscriptionRoutes,
} from "../modules/subscription/Subscription.routes";
import { ApiResponse } from "../utils/ApiResponse";

const router = Router();

router.use("/auth", new UserRoutes().router);
router.use("/tenants", new TenantRoutes().router);
router.use("/agencies", new AgencyRoutes().router);
router.use("/agencies", new AgencySubscriptionRoutes().router); // Mounts subscription routes for agencies
router.use("/subscriptions", new SubscriptionRoutes().router); // Mounts plan management routes
// router.use('/rules', new BusinessRuleRoutes().router);
router.use("/documents", new DocumentRoutes().router);
router.use("/process", new ProcessRoutes().router);
router.use("/roles", new RoleRoutes().router);
router.get("/test", async (req, res) => {
      const cookies = req.cookies;
      if (cookies) {
        res.json({ cookiesSent: cookies });
      } else {
        res.json({ cookiesSent: "No cookies" });
      }
    });
router.get("/health", (req, res) => {
  ApiResponse.success(res, "OK", "Server is active", 200);
});

export default router;
