import { PoolConnection } from "mysql2/promise";
import { Database } from "./src/core/Database.ts";
import { RowDataPacket, ResultSetHeader } from "mysql2";

import {
    IUser,
    IUserProfile,
    IUserPhoneNumber,
    IUserAddress,
    IRole,
    IUserRole,
} from "./src/modules/user/User.types";

const db = Database.getInstance();
export async function getRole(identifier: number | string, conn?: PoolConnection): Promise<IRole | null> {
    const query =
        typeof identifier === "number"
            ? `SELECT * FROM roles WHERE id=? LIMIT 1`
            : `SELECT * FROM roles WHERE code=? LIMIT 1`;

    const rows: any = await db.query<RowDataPacket[]>(query, [identifier], conn);
    return rows[0] || null;
}

getRole("AGENT").then((role) => console.log(role));