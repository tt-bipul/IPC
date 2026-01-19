import { sendMail } from "../../utils/EmailService";
import { env } from "../../config/env";
import { IUser, ISafeUser } from "./User.types";
import crypto from "crypto";
import { UserRepository } from "./User.repository";

export const sanitizeUser = (user: IUser): ISafeUser => {
    const { password_hash, is_deleted, password_updated_at, ...safeUser } = user;
    return safeUser;
};

export const sendPasswordResetLink = async (
  email: string,
  userId: string,
): Promise<void> => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
const repo = new UserRepository();
  await repo.createPasswordResetToken(userId, token, expiresAt);

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendMail(
    email,
    "Reset your password",
    `Reset your password using the link below:\n${resetUrl}`,
    `
      <p>You requested a password reset.</p>
      <p>
        <a href="${resetUrl}">Click here to reset your password</a>
      </p>
      <p>This link will expire in 15 minutes.</p>
    `
  );
};
