import axios from "axios";
import { Database } from "../core/Database";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";
import bcrypt from "bcryptjs";

const API_URL = `http://localhost:${env.port}`;
const DB = Database.getInstance();

async function run() {
  try {
    console.log(`Starting VP Check verification against ${API_URL}...`);

    // 1. Setup Test Data
    const agencyId = uuidv4();
    const adminId = uuidv4();

    console.log("Creating test agency and Admin user...");

    // Ensure roles exist - using IGNORE to avoid errors if they exist
    await DB.query(
      `INSERT IGNORE INTO roles (code) VALUES ('SUPER_ADMIN'), ('VP'), ('AGENT')`,
    );

    const superAdminRole = (
      await DB.query<any[]>(`SELECT id FROM roles WHERE code = 'SUPER_ADMIN'`)
    )[0];
    const vpRole = (
      await DB.query<any[]>(`SELECT id FROM roles WHERE code = 'VP'`)
    )[0];
    const agentRole = (
      await DB.query<any[]>(`SELECT id FROM roles WHERE code = 'AGENT'`)
    )[0];

    if (!superAdminRole || !vpRole || !agentRole)
      throw new Error("Roles missing");

    const adminPassHash = await bcrypt.hash("admin123", 10);
    const adminEmail = `admin_vpcheck_${Date.now()}@test.com`;

    await DB.query(
      `INSERT INTO users (id, username, email, password_hash, is_active, is_deleted) VALUES (?, ?, ?, ?, 1, 0)`,
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
      `INSERT INTO agencies (id, agency_name, is_active) VALUES (?, 'Test Agency VP Check', 1)`,
      [agencyId],
    );

    // 2. Register First VP (Should Succeed)
    console.log("Registering First VP (Should Succeed)...");
    const vp1Email = `vp1_${Date.now()}@test.com`;
    await axios.post(
      `${API_URL}/auth/register`,
      {
        username: `vp1_${Date.now()}`,
        email: vp1Email,
        password: "password123",
        roles: [vpRole.id], // Passing ID to test our fix
        agencyId: agencyId,
        profile: { first_name: "VP1", last_name: "User" },
        phones: [`111${Date.now().toString().slice(-7)}`],
        addresses: [
          { address: "123 St", country: "India", addressType: "Permanent" },
        ],
      },
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );
    console.log("First VP Registered Successfully");

    // 3. Register Second VP (Should Fail)
    console.log("Registering Second VP (Should Fail)...");
    const vp2Email = `vp2_${Date.now()}@test.com`;
    try {
      await axios.post(
        `${API_URL}/auth/register`,
        {
          username: `vp2_${Date.now()}`,
          email: vp2Email,
          password: "password123",
          roles: [vpRole.id], // Passing ID
          agencyId: agencyId,
          profile: { first_name: "VP2", last_name: "User" },
          phones: [`222${Date.now().toString().slice(-7)}`],
          addresses: [
            { address: "456 St", country: "India", addressType: "Permanent" },
          ],
        },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );
      throw new Error(
        "Second VP registration succeeded but should have failed!",
      );
    } catch (e: any) {
      if (
        e.response &&
        e.response.status === 400 &&
        e.response.data.message === "VP already exists for this agency"
      ) {
        console.log(
          "Correctly failed with 400: VP already exists for this agency",
        );
      } else {
        console.error("Failed with unexpected error:", e.message);
        if (e.response) {
          console.error("Response data:", e.response.data);
        }
        throw e;
      }
    }

    // 4. Register Non-VP User (Should Succeed)
    console.log("Registering Normal Agent (Should Succeed)...");
    const agentEmail = `agent_${Date.now()}@test.com`;
    await axios.post(
      `${API_URL}/auth/register`,
      {
        username: `agent_${Date.now()}`,
        email: agentEmail,
        password: "password123",
        roles: [agentRole.id], // Passing ID
        agencyId: agencyId,
        profile: { first_name: "Agent", last_name: "User" },
        phones: [`333${Date.now().toString().slice(-7)}`],
        addresses: [
          { address: "789 St", country: "India", addressType: "Permanent" },
        ],
      },
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );
    console.log("Agent Registered Successfully");

    console.log("✅ ALL CHECKS PASSED");
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
