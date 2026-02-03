import { Database } from "./core/Database";

async function inspect() {
  const db = Database.getInstance();
  const tables = ["users", "user_profiles"];

  for (const table of tables) {
    try {
      const res: any = await db.query(`SHOW CREATE TABLE ${table}`);
      console.log(`\n--- Structure for ${table} ---`);
      console.log(res[0]["Create Table"]);
    } catch (e) {
      console.error(`Error inspecting ${table}:`, e);
    }
  }
  process.exit(0);
}

inspect();
