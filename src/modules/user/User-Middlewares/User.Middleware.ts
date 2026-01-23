import { NextFunction, Response } from "express";
import { AuthRequest } from "../../../types/express";
import { UserRepository } from "../User.repository";
import { AgencyRepository } from "../../../modules/agency/Agency.repository";
import { UserRole } from "../User.types";
import { Database } from "../../../core/Database";
import { AppError } from "../../../core/ErrorHandler";

const UserRepo = new UserRepository();
const AgencyRepo = new AgencyRepository();

export default async function AgencyID(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.roles?.includes(UserRole.SUPER_ADMIN)) {
    next();
  } else {
    const userId = req.user?.id;
    await Database.getInstance().withTransaction(async (conn: any) => {
      const id = await AgencyRepo.getAgenciesByUserId(userId, false, conn);
      if (id && id.length > 0) {
        (req.user as any).agencyId = id[0].agency_id;
        next();
      }
      throw new AppError(
        "You do not have an agency assigned, contact your administrator",
        403,
      );
    });
  }
}
