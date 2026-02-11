import { Response } from "express";

export default class CookieSetter {
  static setCookie(
    res: Response,
    name: string,
    value: string,
    secure: boolean,
  ) {
    const options = secure
      ? {
          httpOnly: true,
          secure: true,
          sameSite: "none" as const,
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        }
      : {
          httpOnly: true,
          secure: false,
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        };
    res.cookie(name, value, options);
  }
}
