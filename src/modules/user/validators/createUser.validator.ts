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
  agencyId: Joi.string().uuid(),

  profile: Joi.object({
    first_name: Joi.string().required(),
    middle_name: Joi.string().allow(null),
    last_name: Joi.string().required(),
  })
    .required()
    .unknown(false),

  phones: Joi.array().items(Joi.string().min(5)).required(),
  addresses: Joi.array()
    .items(
      Joi.object({
        address: Joi.string().required(),
        country: Joi.string().required(),
        addressType: Joi.string()
          .valid("Permanent", "Communication")
          .required(),
      }).unknown(false)
    )
    .required(),
})
  .required()
  .unknown(false);

export function validateUserCreatePayload(
  payload: IUserCreatePayLoad,
  currentUser: PayloadCurrentUser
): void {
  // Use abortEarly: false to return all errors
  const { error, value } = userCreateSchema.validate(payload, {
    abortEarly: false,
    convert: false,
  });

  const errorMessages: string[] = [];

  if (error) {
    errorMessages.push(...error.details.map((detail) => detail.message));
  }

  const isSuperAdmin = currentUser.roles.includes("SUPER_ADMIN");
  // isVPBeingCreated is disabled/false as discussed
  const isVPBeingCreated = false;

  if (isSuperAdmin) {
    if (!value.roles || value.roles.length === 0) {
      errorMessages.push("roles is required and cannot be empty");
    }

    if (isVPBeingCreated && !value.agencyId) {
      errorMessages.push("agencyId is required when SUPER_ADMIN creates a VP");
    }
  }

  if (currentUser.roles.includes("VP")) {
    if ("roles" in value || "agencyId" in value) {
      console.log("DEBUG: VP Check Failed. CurrentUser Roles:", currentUser.roles);
      throw new AppError("VP is not allowed to provide roles or agencyId", 403);
    }
  }

  if (errorMessages.length > 0) {
    throw new AppError(`Invalid request body: ${errorMessages.join(", ")}`, 400);
  }
}
