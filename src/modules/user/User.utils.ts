import { IUser, ISafeUser } from "./User.types";

export const sanitizeUser = (user: IUser): ISafeUser => {
    const { password_hash, is_deleted, password_updated_at, ...safeUser } = user;
    return safeUser;
};
