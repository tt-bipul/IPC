import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../core/ErrorHandler";

export interface AuthRequest extends Request {
  user?: any;
}

type BodyType = "json" | "form-data" | "urlencoded";
interface ValidateRequestBodyOptions {
  required?: boolean;
  type?: BodyType;
}

export class AuthMiddleware {
  public static authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new AppError("Authentication failed: No token provided", 401);
      }

      const decoded = jwt.verify(token, env.jwtSecret);
      req.user = decoded;
      next();
    } catch (error) {
      next(new AppError("Authentication failed: Invalid token", 401));
    }
  }

  public static restrictTo(allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new AppError("Not authenticated", 401));
      }

      const userRoles = req.user.roles || [];
      const hasPermission = userRoles.some((role: string) => allowedRoles.includes(role)) || userRoles.includes("SUPER_ADMIN");

      if (!hasPermission) {
        return next(
          new AppError("You do not have permission to perform this action", 403)
        );
      }
      next();
    };
  }

  public static requireTenantAccess(paramName: string = "tenantId") {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      const user = req.user;
      if (!user) return next(new AppError("Not authenticated", 401));

      const userRoles = user.roles || [];
      if (userRoles.includes("SUPER_ADMIN")) {
        return next();
      }

      const requestedTenantId =
        req.params[paramName] || req.body[paramName] || req.query[paramName];

      if (!requestedTenantId) {
        return next();
      }

      if (user.tenant_id !== requestedTenantId) {
        return next(new AppError("Access to this tenant is forbidden", 403));
      }

      next();
    };
  }

  /** Request Body type handler custom */

  static ValidateRequestBody(options: ValidateRequestBodyOptions) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { required, type } = options;

      if (required) {
        if (!req.body || Object.keys(req.body).length === 0) {
          next(new AppError("Request body is required", 400));
          return;
        }
      }

      if (type) {
        const contentType = req.headers["content-type"] || "";

        switch (type) {
          case "json":
            if (!contentType.includes("application/json")) {
              next(new AppError("Request body must be application/json", 415));
              return;
            }
            break;

          case "form-data":
            if (!contentType.includes("multipart/form-data")) {
              next(
                new AppError("Request body must be multipart/form-data", 415)
              );
              return;
            }
            break;

          case "urlencoded":
            if (!contentType.includes("application/x-www-form-urlencoded")) {
              next(
                new AppError(
                  "Request body must be application/x-www-form-urlencoded",
                  415
                )
              );
              return;
            }
            break;
        }
      }

      next();
    };
  }

  static EnforceStrictnessForNonSuperAdmin() {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      const user = req.user;
      if (!user) return next(new AppError("Not authenticated", 401));

      const roles = Array.isArray(user.roles) ? user.roles : [];
      if (roles.includes("SUPER_ADMIN")) return next();

      if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        return next(new AppError("Invalid request body", 400));
      }

      const allowedKeys = ["username", "email", "password"];
      const bodyKeys = Object.keys(req.body);

      if (bodyKeys.length !== allowedKeys.length) {
        return next(new AppError("Invalid request payload", 400));
      }

      for (const key of bodyKeys) {
        if (!allowedKeys.includes(key)) {
          return next(new AppError("Invalid request payload", 400));
        }
      }

      const { username, email, password } = req.body;

      if (
        typeof username !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        !username.trim() ||
        !email.trim() ||
        !password.trim()
      ) {
        return next(new AppError("Invalid request payload", 400));
      }

      next();
    };
  }

}
