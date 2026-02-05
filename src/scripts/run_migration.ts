import fs from "fs";
import path from "path";
import { Database } from "../core/Database";

const run = async () => {
  try {
    const sqlPath = path.join(__dirname, "create_subscription_tables.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    // Split by semicolon but handle cases where semicolon might be in quotes (simple split for now as schema is simple)
    const statements = sql.split(";").filter((s) => s.trim().length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await Database.getInstance().query(statement);
    }
    console.log("✅ Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed", error);
    process.exit(1);
  }
};

run();
