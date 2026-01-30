import { NextFunction, Response } from "express";
import { AuthRequest } from "../../../types/express";
import { AgencyReadRepository } from "../../../modules/agency/Repositories/read.repository";
import { UserRole } from "../User.types";
import { Database } from "../../../core/Database";
import { AppError } from "../../../core/ErrorHandler";
import { HttpStatus } from "../../../constants/HttpStatus";

const AgencyReadRepo = new AgencyReadRepository();

export async function IsVPHavingAgency(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.user?.roles?.includes(UserRole.SUPER_ADMIN)) {
      next();
    } else {
      const userId = req.user?.id;
      await Database.getInstance().withTransaction(async (conn: any) => {
        const id = await AgencyReadRepo.getAgenciesByUserId(
          userId,
          false,
          conn,
        );
        if (id && id.length > 0) {
          (req.user as any).agencyId = id[0].agency_id;
          return;
        }
        throw new AppError(
          "You do not have an agency assigned, contact your administrator",
          HttpStatus.NOT_FOUND,
        );
      });
      next();
    }
  } catch (error) {
    next(error);
  }
}

export async function IfUserBelongsToVPAgency(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.user?.roles?.includes(UserRole.SUPER_ADMIN)) {
      next();
    } else {
      const vpID = req.user?.id;
      const agentId = req.body?.user_id ?? req.params?.id;
      if (!agentId) {
        throw new AppError("User ID is required", HttpStatus.BAD_REQUEST);
      }
      await Database.getInstance().withTransaction(async (conn: any) => {
        try {
          const checkingIfUserBelongsToVP =
            await AgencyReadRepo.vp_ID_and_agent_ID_isEqual(
              vpID,
              agentId,
              conn,
            );
          if (checkingIfUserBelongsToVP) {
            return;
          } else {
            throw new AppError(
              "This user does not belong to your agency.",
              HttpStatus.FORBIDDEN,
            );
          }
        } catch (error) {
          throw error;
        }
      });
      next();
    }
  } catch (error) {
    next(error);
  }
}

export async function MotherOfAllMiddleWareInUserModule(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { user } = req;
    const roles = user?.roles || [];

    if (roles.includes(UserRole.SUPER_ADMIN)) {
      return next();
    }

    if (roles.includes(UserRole.VP)) {
      return IsVPHavingAgency(req, res, (err) => {
        if (err) return next(err);
        IfUserBelongsToVPAgency(req, res, next);
      });
    }

    if (roles.includes(UserRole.AGENT)) {
      const { id } = req.params;

      if (!id) {
        throw new AppError("User ID is required", HttpStatus.BAD_REQUEST);
      }

      if (id !== user?.id) {
        throw new AppError(
          "You are not authorized to perform this action",
          HttpStatus.FORBIDDEN,
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
