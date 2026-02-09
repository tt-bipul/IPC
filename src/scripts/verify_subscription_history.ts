import { SubscriptionRepository } from "../modules/subscription/Subscription.repository";
import { Database } from "../core/Database";

async function verifySubscriptionHistory() {
  const repository = new SubscriptionRepository();
  const db = Database.getInstance();

  const agencyId = "test-agency-" + Date.now();
  console.log(`Setting up test data for agency: ${agencyId}`);

  let plan: any;
  try {
    // 0. Create Dummy Agency
    await db.query(
      `INSERT INTO agencies (id, agency_name, is_active) VALUES (?, ?, ?)`,
      [agencyId, "Test Agency", 1],
    );
    console.log("Dummy Agency created:", agencyId);

    // 1. Create a Plan
    const planCode = "TEST_PLAN_" + Date.now();
    plan = await repository.createPlan({
      code: planCode,
      name: "Test Plan",
      max_documents: 100,
      validity_days: 30,
      price: 99,
      is_active: true,
    });
    console.log("Plan created:", plan.id);

    // 2. Create Subscription
    const subscriptionId = await repository.createAgencySubscription({
      agency_id: agencyId,
      subscription_plan_id: plan.id!,
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      is_active: true,
    });
    console.log("Subscription created:", subscriptionId);

    // 3. Create Usage
    await repository.createUsageRecord({
      agency_id: agencyId,
      subscription_id: subscriptionId,
      documents_processed: 50,
      last_processed_at: new Date(),
    });
    console.log("Usage record created");

    // 4. Fetch History
    console.log("Fetching history...");
    const history = await repository.getHistory(agencyId);
    console.log("History retrieved:", JSON.stringify(history, null, 2));

    // 5. Verification
    if (history.length !== 1) throw new Error("Expected 1 history item");
    if (history[0].documents_usage !== 50)
      throw new Error("Expected 50 documents processed");
    if (history[0].plan_name !== "Test Plan")
      throw new Error("Expected plan name 'Test Plan'");

    console.log("✅ Verification Successful!");
  } catch (error) {
    console.error("❌ Verification Failed:", error);
  } finally {
    // Cleanup
    try {
      await db.query(`DELETE FROM agencies WHERE id = ?`, [agencyId]);
      if (plan) {
        await db.query(`DELETE FROM subscription_plans WHERE id = ?`, [
          plan.id,
        ]);
      }
      console.log("Cleanup: Dummy Agency and Plan deleted");
    } catch (e) {
      console.error("Cleanup failed:", e);
    }
    process.exit();
  }
}

verifySubscriptionHistory();
