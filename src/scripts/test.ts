import { AgencyRepository } from "../modules/agency/Agency.repository";
import { Database } from "../core/Database";

async function logMessage(message: string): Promise<any> {
  const agencyRepo = new AgencyRepository();
  return Database.getInstance().withTransaction(async (conn) => {
    return await agencyRepo.getAgencyAssociatedId(
      "address_id",
      "0c030a31-1106-4fc3-bb09-841558ebc6e0",
      undefined,
    );
  });
}

logMessage("Hello, World!").then((result) => {
  console.log("Log message result:", result);
});
