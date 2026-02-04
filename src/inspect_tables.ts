import fs from "fs";
import path from "path";
import { Database } from "./core/Database";

async function inspect() {
  const db = Database.getInstance();
  const outputPath = path.join(process.cwd(), "database_schema.txt");

  try {
    console.log("Fetching all tables...");
    // Type assertion or generous generic for the raw query result
    const tablesRes = await db.query<any[]>("SHOW TABLES");

    // The key for table name depends on database name, usually "Tables_in_[dbname]"
    // We'll just grab the first value of each row object
    const tables = tablesRes.map((row) => Object.values(row)[0] as string);

    if (tables.length === 0) {
      console.log("No tables found.");
      process.exit(0);
    }

    console.log(`Found ${tables.length} tables: ${tables.join(", ")}`);

    let output = `Database Schema Inspection\nGenerated at: ${new Date().toISOString()}\n\n`;

    for (const table of tables) {
      try {
        const res = await db.query<any[]>(`SHOW CREATE TABLE \`${table}\``);
        if (res && res.length > 0) {
          output += `--- Structure for table: ${table} ---\n`;
          output += res[0]["Create Table"];
          output += `\n\n${"-".repeat(50)}\n\n`;
        }
      } catch (e) {
        console.error(`Error inspecting ${table}:`, e);
        output += `Error inspecting ${table}: ${e}\n\n`;
      }
    }

    fs.writeFileSync(outputPath, output);
    console.log(`Successfully wrote schema inspection to: ${outputPath}`);
  } catch (error) {
    console.error("Fatal error during inspection:", error);
  } finally {
    process.exit(0);
  }
}

inspect();
