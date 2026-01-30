import { Database } from "../core/Database";
import QueryBuilder from "../core/QueryBuilder";
import { COLUMNS, TABLES } from "../core/Database.types";
async function test(): Promise<any> {
  const q = QueryBuilder.selectAll()
    .from(TABLES.LOCATIONS)
    .where(COLUMNS.LOCATIONS.COUNTRY, "INDIA");
  console.log(q.build());
}
test();
