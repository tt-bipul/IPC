import Joi from "joi";
import {
  IUserCreatePayLoad,
  PayloadCurrentUser,
  UserRole,
} from "../User.types";
import { AppError } from "../../../core/ErrorHandler";
import { HttpStatus } from "../../../constants/HttpStatus";
import { AuthRequest } from "../../../middlewares/AuthMiddleware";
import { NextFunction, Response } from "express";

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
      }).unknown(false),
    )
    .required(),
})
  .required()
  .unknown(false);

const updateProfileSchema = Joi.object({
  first_name: Joi.string(),
  middle_name: Joi.string().allow(null),
  last_name: Joi.string(),
}).unknown(false);

const updatePhoneSchema = Joi.object({
  id: Joi.number().integer(),
  phone_number: Joi.string().min(5),
}).unknown(false);

const updateAddressSchema = Joi.object({
  id: Joi.number().integer(),
  address: Joi.string(),
  country: Joi.string().allow(null),
  addressType: Joi.string().valid("Permanent", "Communication"),
}).unknown(false);

export const adminUpdateSchema = Joi.object({
  id: Joi.forbidden(),
  password_hash: Joi.forbidden(),

  username: Joi.string(),
  email: Joi.string().email(),
  is_active: Joi.boolean(),
  is_deleted: Joi.boolean(),

  profile: updateProfileSchema,
  phones: Joi.array().items(updatePhoneSchema),
  addresses: Joi.array().items(updateAddressSchema),
})
  .min(1)
  .unknown(false);

export const vpUpdateSchema = Joi.object({
  id: Joi.forbidden(),
  password_hash: Joi.forbidden(),
  is_deleted: Joi.forbidden(),

  username: Joi.string(),
  email: Joi.string().email(),
  is_active: Joi.boolean(),

  profile: updateProfileSchema,
  phones: Joi.array().items(updatePhoneSchema),
  addresses: Joi.array().items(updateAddressSchema),
})
  .min(1)
  .unknown(false);

export const agentUpdateSchema = Joi.object({
  id: Joi.forbidden(),
  password_hash: Joi.forbidden(),
  email: Joi.forbidden(),
  is_active: Joi.forbidden(),
  is_deleted: Joi.forbidden(),

  username: Joi.string(),

  profile: updateProfileSchema,
  phones: Joi.array().items(updatePhoneSchema),
  addresses: Joi.array().items(updateAddressSchema),
})
  .min(1)
  .unknown(false);

export function validateUserCreatePayload(
  payload: IUserCreatePayLoad,
  currentUser: PayloadCurrentUser,
): void {
  const { error, value } = userCreateSchema.validate(payload, {
    abortEarly: false,
    convert: false,
  });

  const errorMessages: string[] = [];

  if (error) {
    errorMessages.push(...error.details.map((detail) => detail.message));
  }

  const isSuperAdmin = currentUser.roles.includes("SUPER_ADMIN");

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
      console.log(
        "DEBUG: VP Check Failed. CurrentUser Roles:",
        currentUser.roles,
      );
      throw new AppError("VP is not allowed to provide roles or agencyId", 403);
    }
  }

  if (errorMessages.length > 0) {
    throw new AppError(
      `Invalid request body: ${errorMessages.join(", ")}`,
      400,
    );
  }
}

export async function ValidateUserUpdatePayload(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { user } = req;
    const roles = user?.roles || [];
    const targetUserId = req.params.id;

    if (!targetUserId) {
      throw new AppError("User ID is required", HttpStatus.BAD_REQUEST);
    }

    let schema: Joi.ObjectSchema;

    if (roles.includes(UserRole.SUPER_ADMIN)) {
      schema = adminUpdateSchema;
    } else if (roles.includes(UserRole.VP)) {
      schema = vpUpdateSchema;
    } else if (roles.includes(UserRole.AGENT)) {
      if (targetUserId !== user?.id) {
        throw new AppError(
          "You are not authorized to update other users",
          HttpStatus.FORBIDDEN,
        );
      }
      schema = agentUpdateSchema;
    } else {
      throw new AppError(
        "You are not authorized to perform this action",
        HttpStatus.FORBIDDEN,
      );
    }

    const { error } = schema.validate(req.body, {
      abortEarly: false,
      convert: false,
    });

    if (error) {
      throw new AppError(
        `Invalid update payload: ${error.details
          .map((d) => d.message)
          .join(", ")}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
