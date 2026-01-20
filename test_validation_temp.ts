// import { validateUserCreatePayload } from "./src/modules/user/validators/createUser.validator";
// We need to import the function. 
// Use require to be simple? No it is TS.

import { validateUserCreatePayload } from "./src/modules/user/validators/createUser.validator";

const mockProfile = {
    first_name: "Test",
    last_name: "User",
};
const mockAddress = {
    address: "123 St",
    country: "US",
    addressType: "Permanent",
};

const validBasePayload = {
    username: "testuser",
    email: "test@example.com",
    password: "password123",
    profile: mockProfile,
    phones: ["1234567890"],
    addresses: [mockAddress],
};

function runTest(name: string, payload: any, currentUser: any) {
    console.log(`\n--- Running ${name} ---`);
    console.log("Current User Roles (JSON):", JSON.stringify(currentUser.roles));

    try {
        validateUserCreatePayload(payload, currentUser);
        console.log("Result: Success");
    } catch (error: any) {
        console.log("Result: Error Caught");
        console.log("Error Message:", error.message);
    }
}

// Test 1: Happy Path SUPER_ADMIN
const adminUser = { roles: ["SUPER_ADMIN"] };
runTest(
    "Happy Path SUPER_ADMIN",
    { ...validBasePayload, roles: [1] },
    adminUser
);

// Test 2: SUPER_ADMIN missing roles
runTest(
    "SUPER_ADMIN missing roles",
    { ...validBasePayload },
    adminUser
);

// Test 3: VP User
const vpUser = { roles: ["VP"] };
runTest(
    "VP providing roles",
    { ...validBasePayload, roles: [1] },
    vpUser
);

// Test 4: VP User Success (no roles/agencyId)
runTest(
    "VP Success",
    { ...validBasePayload },
    vpUser
);
