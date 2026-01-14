import Joi from "joi";
import {
  IUserCreatePayLoad,
  PayloadCurrentUser,
  UserRole,
} from "../User.types";
import { AppError } from "../../../core/ErrorHandler";

const userCreateSchema = Joi.object({
  username: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),

  roles: Joi.array().items(Joi.number().integer().positive()).min(1),

  agencyId: Joi.string().uuid().optional(),

  profile: Joi.object({
    first_name: Joi.string().required(),
    middle_name: Joi.string().allow(null),
    last_name: Joi.string().required(),
  })
    .required()
    .unknown(false),

  phones: Joi.array().items(Joi.string().min(5)),
  addresses: Joi.array().items(
    Joi.object({
      address: Joi.string().required(),
      country: Joi.string().required(),
      addressType: Joi.string().valid("Permanent", "Communication").required(),
    }).unknown(false)
  ),
})
  .required()
  .unknown(false);

export function validateUserCreatePayload(
  payload: IUserCreatePayLoad,
  currentUser: PayloadCurrentUser
): void {
  const { error, value } = userCreateSchema.validate(payload, {
    abortEarly: true,
    convert: false,
  });

  if (error) {
    throw new AppError(
      `Invalid request body: ${error.details[0].message}`,
      400
    );
  }

  const isSuperAdmin = currentUser.roles.includes(UserRole.SUPER_ADMIN);
  const isVPBeingCreated = value.roles?.includes(Number(UserRole.VP));

  if (isSuperAdmin) {
    if (!value.roles || value.roles.length === 0) {
      throw new AppError("roles is required and cannot be empty", 400);
    }

    if (isVPBeingCreated && !value.agencyId) {
      throw new AppError(
        "agencyId is required when SUPER_ADMIN creates a VP",
        400
      );
    }
  }

  if (currentUser.roles.includes(UserRole.VP)) {
    if ("roles" in value || "agencyId" in value) {
      throw new AppError("VP is not allowed to provide roles or agencyId", 403);
    }
  }
}
