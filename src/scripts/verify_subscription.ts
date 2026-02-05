import axios from "axios";
import { Database } from "../core/Database";
import { v4 as uuidv4 } from "uuid";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { env } from "../config/env";
import bcrypt from "bcryptjs";

const API_URL = `http://localhost:${env.port}`;
const DB = Database.getInstance();

async function run() {
  try {
    console.log(`Starting verification against ${API_URL}...`);

    // 1. Setup Test Data
    const agencyId = uuidv4();
    const adminId = uuidv4();

    console.log("Creating test agency and Admin user...");

    await DB.query(
      `INSERT IGNORE INTO roles (code) VALUES ('SUPER_ADMIN'), ('VP'), ('AGENT')`,
    );

    const superAdminRole = (
      await DB.query<any[]>(`SELECT id FROM roles WHERE code = 'SUPER_ADMIN'`)
    )[0];
    if (!superAdminRole) throw new Error("SUPER_ADMIN role not found");

    const vpRole = (
      await DB.query<any[]>(`SELECT id FROM roles WHERE code = 'VP'`)
    )[0];
    if (!vpRole) throw new Error("VP role not found");

    const adminPassHash = await bcrypt.hash("admin123", 10);
    const adminEmail = `admin${Date.now()}@test.com`;
    await DB.query(
      `INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)`,
      [adminId, `admin${Date.now()}`, adminEmail, adminPassHash],
    );

    await DB.query(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`, [
      adminId,
      superAdminRole.id,
    ]);

    console.log("Logging in as Admin...");
    const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: adminEmail,
      password: "admin123",
    });
    const adminToken = adminLoginRes.data.data.token;
    console.log("Admin Logged In");

    await DB.query(
      `INSERT INTO agencies (id, agency_name, is_active) VALUES (?, 'Test Agency', 1)`,
      [agencyId],
    );

    // 2. Create Plan
    console.log("Creating Subscription Plan...");
    const planCode = `TEST_PLAN_${Date.now()}`;
    const createPlanRes = await axios.post(`${API_URL}/subscriptions/plans`, {
      code: planCode,
      name: "Test Plan",
      max_documents: 2,
      validity_days: 30,
      price: 99.99,
    });
    const planId = createPlanRes.data.data.id;
    console.log(`Plan Created: ID ${planId}`);

    // 3. Assign Subscription
    console.log("Assigning Subscription...");
    await axios.post(`${API_URL}/agencies/${agencyId}/subscriptions`, {
      subscription_plan_id: planId,
    });
    console.log("Subscription Assigned");

    // 4. Verify Usage Empty
    console.log("Checking Initial Usage...");
    const usageRes = await axios.get(`${API_URL}/agencies/${agencyId}/usage`);
    if (usageRes.data.data.documents_processed !== 0)
      throw new Error("Usage should be 0");
    console.log("Initial Usage Verified: 0");

    // 5. Register VP User
    console.log("Registering Real User (VP)...");
    const unique = Date.now();
    const username = `user${unique}`;
    const email = `user${unique}@test.com`;

    await axios.post(
      `${API_URL}/auth/register`,
      {
        username: username,
        email: email,
        password: "password123",
        roles: [vpRole.id],
        agencyId: agencyId,
        profile: {
          first_name: "Test",
          last_name: "User",
        },
        phones: ["1234567890"],
        addresses: [
          {
            address: "123 St",
            country: "India",
            addressType: "Permanent",
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );

    console.log("Logging in as VP User...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: email,
      password: "password123",
    });
    const token = loginRes.data.data.token;
    const loggedInUserId = loginRes.data.data.user.id;
    console.log("Got User Token");

    const ua = await DB.query<any[]>(
      `SELECT * FROM user_agencies WHERE user_id = ? AND agency_id = ?`,
      [loggedInUserId, agencyId],
    );
    if (ua.length === 0) {
      console.log("Manually linking user to agency...");
      await DB.query(
        `INSERT INTO user_agencies (user_id, agency_id, is_active) VALUES (?, ?, 1)`,
        [loggedInUserId, agencyId],
      );
    }

    // 6. Upload Document 1
    console.log("Uploading Document 1...");
    const dummyPath = path.join(__dirname, "dummy.txt");
    fs.writeFileSync(dummyPath, "test content");

    const form1 = new FormData();
    form1.append("documents", fs.createReadStream(dummyPath), {
      filename: "test.png",
      contentType: "image/png",
    });
    form1.append("agency_id", agencyId);

    await axios.post(`${API_URL}/documents`, form1, {
      headers: {
        ...form1.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Document 1 Uploaded");

    // 7. Check Usage = 1
    const usageRes2 = await axios.get(`${API_URL}/agencies/${agencyId}/usage`);
    if (usageRes2.data.data.documents_processed !== 1)
      throw new Error(
        `Usage should be 1, got ${usageRes2.data.data.documents_processed}`,
      );
    console.log("Usage Verified: 1");

    // 8. Upload Document 2 (Success - Limit is 2)
    const form2 = new FormData();
    form2.append("documents", fs.createReadStream(dummyPath), {
      filename: "test2.png",
      contentType: "image/png",
    });
    form2.append("agency_id", agencyId);
    await axios.post(`${API_URL}/documents`, form2, {
      headers: { ...form2.getHeaders(), Authorization: `Bearer ${token}` },
    });
    console.log("Document 2 Uploaded");

    // 9. Upload Document 3 (Fail)
    console.log("Uploading Document 3 (Should Fail)...");
    try {
      const form3 = new FormData();
      form3.append("documents", fs.createReadStream(dummyPath), {
        filename: "test3.png",
        contentType: "image/png",
      });
      form3.append("agency_id", agencyId);
      await axios.post(`${API_URL}/documents`, form3, {
        headers: { ...form3.getHeaders(), Authorization: `Bearer ${token}` },
      });
      throw new Error("Should have failed due to limit but succeeded");
    } catch (e: any) {
      if (e.response && e.response.status === 403) {
        console.log("Correctly failed with 403");
      } else if (
        e.message === "Should have failed due to limit but succeeded"
      ) {
        throw e;
      } else {
        console.error("Failed with unexpected error code:", e.response?.status);
        throw e;
      }
    }

    console.log("✅ ALL TESTS PASSED");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Test Failed:", error.message);
    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error(
        "Response Data:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
    process.exit(1);
  }
}

run();
