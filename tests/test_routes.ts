
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import util from 'util';

// Promisify exec for cleaner async/await usage
const execAsync = util.promisify(exec);

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;
const OUTPUT_FILE = 'test_results.json';
const TEMP_PDF = 'temp_test_doc.pdf';

interface TestResult {
    route: string;
    method: string;
    status: number;
    success: boolean;
    data?: any;
    error?: any;
    duration_ms: number;
}

const results: TestResult[] = [];

// Helper to generate a dummy PDF
const createDummyPdf = () => {
    // A minimal valid PDF header/footer structure
    const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> >>
endobj
xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
trailer
<< /Size 4 /Root 1 0 R >>
startxref
223
%%EOF
`;
    fs.writeFileSync(TEMP_PDF, content);
};

// Helper to execute curl commands
const runCurl = async (
    method: string,
    route: string,
    data?: any,
    token?: string,
    isFileUpload: boolean = false
): Promise<TestResult> => {
    const start = Date.now();
    let command = `curl -s -w "\\n%{http_code}" -X ${method} "${BASE_URL}${route}"`;

    if (token) {
        command += ` -H "Authorization: Bearer ${token}"`;
    }

    if (isFileUpload) {
        // For file uploads (multipart/form-data)
        // Adjust based on how many files strictly required. The controller accepts 'documents' array.
        command += ` -F "documents=@${TEMP_PDF}"`;
        // Add required fields for some endpoints if they expect form-data alongside files
        if (data) {
            for (const [key, value] of Object.entries(data)) {
                command += ` -F "${key}=${value}"`;
            }
        }
    } else {
        // Standard JSON request
        command += ` -H "Content-Type: application/json"`;
        if (data) {
            command += ` -d '${JSON.stringify(data)}'`;
        }
    }

    console.log(`Executing Command: ${command}`);

    try {
        const { stdout } = await execAsync(command);
        const lines = stdout.trim().split('\n');
        const statusCodeStr = lines.pop(); // Last line is status code due to -w
        const rawBody = lines.join('\n'); // The rest is the body

        const statusCode = parseInt(statusCodeStr || '0', 10);

        let parsedBody;
        try {
            parsedBody = rawBody ? JSON.parse(rawBody) : {};
        } catch (e) {
            parsedBody = rawBody; // Fallback to string if not JSON
        }

        const result: TestResult = {
            route,
            method,
            status: statusCode,
            success: statusCode >= 200 && statusCode < 300,
            data: parsedBody,
            duration_ms: Date.now() - start
        };

        results.push(result);
        return result;

    } catch (error: any) {
        const result: TestResult = {
            route,
            method,
            status: 0,
            success: false,
            error: error.message,
            duration_ms: Date.now() - start
        };
        results.push(result);
        return result;
    }
};

const main = async () => {
    try {
        console.log('Starting API Tests...');
        createDummyPdf();

        // --- 1. Register Initial Admin (TENANT_ADMIN) ---
        // Since we can register without a tenant initially (users table has nullable tenant_id)
        const uniqueId = Date.now();
        const adminEmail = `admin_${uniqueId}@test.com`;
        const adminPassword = 'Password@123';

        const registerAdminRes = await runCurl('POST', '/users/register', {
            username: `admin_${uniqueId}`,
            email: adminEmail,
            password: adminPassword,
            user_role: 'TENANT_ADMIN',
            first_name: 'Test',
            last_name: 'Admin'
        });

        if (!registerAdminRes.success) {
            throw new Error('Failed to register admin. Aborting.');
        }

        // --- 2. Login Admin ---
        const loginRes = await runCurl('POST', '/users/login', {
            email: adminEmail,
            password: adminPassword
        });

        if (!loginRes.success) {
            throw new Error('Failed to login admin. Aborting.');
        }

        const adminToken = loginRes.data.data.token;
        console.log('Admin Token acquired.');

        // --- 3. Create Tenant ---
        const tenantRes = await runCurl('POST', '/tenants', {
            name: `Tenant_${uniqueId}`,
            company_email: `contact_${uniqueId}@tenant.com`,
            country: 'USA'
        }, adminToken);

        const tenantId = tenantRes.data.data.id;

        // --- 4. Get Created Tenant (Verify) ---
        await runCurl('GET', `/tenants/${tenantId}`, undefined, adminToken);

        // --- 5. Create Agency ---
        const agencyRes = await runCurl('POST', '/agencies', {
            tenant_id: tenantId,
            agency_name: `Agency_${uniqueId}`,
            email: `agency_${uniqueId}@test.com`
        }, adminToken);

        const agencyId = agencyRes.data.data.id;

        // --- 6. Get Agency (Verify) ---
        await runCurl('GET', `/agencies/${agencyId}`, undefined, adminToken);

        // --- 7. Register Agency Executive (Agent) ---
        // Usually done by Tenant Admin or VP.
        const agentEmail = `agent_${uniqueId}@test.com`;
        const agentPass = 'AgentPass@123';

        // Note: The User routes for creating sub-users might be different or use the public register.
        // Based on analysis, /users/register is public. We can just register an Agent linked to the agency.
        const registerAgentRes = await runCurl('POST', '/users/register', {
            username: `agent_${uniqueId}`,
            email: agentEmail,
            password: agentPass,
            user_role: 'AGENCY_EXECUTIVE',
            first_name: 'Bond',
            last_name: 'James',
            tenant_id: tenantId,
            agency_id: agencyId
        });

        // --- 8. Login Agent ---
        const loginAgentRes = await runCurl('POST', '/users/login', {
            email: agentEmail,
            password: agentPass
        });

        const agentToken = loginAgentRes.data.data.token;

        // --- 9. Create Business Rules (Admin/VP only) ---
        // Let's use the Admin token again since Agent usually can't create rules.
        await runCurl('POST', '/rules', {
            agency_id: agencyId,
            field_name: "policy_number",
            rule_type: "NOT_EMPTY"
        }, adminToken);

        // --- 10. Process Document (Agent Action) ---
        // Requires file upload
        // Note: ProcessRoutes expects 'documents' (array, max 3) and auth restrict to AGENCY_EXECUTIVE
        await runCurl('POST', '/process', {
            email: "customer@gmail.com"
        }, agentToken, true);

    } catch (err) {
        console.error('Test Suite Failed:', err);
    } finally {
        // Cleanup
        if (fs.existsSync(TEMP_PDF)) {
            fs.unlinkSync(TEMP_PDF);
        }

        // Write Report
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
        console.log(`Report generated: ${OUTPUT_FILE}`);
    }
};

main();
