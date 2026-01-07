const swaggerSpec = {
    openapi: "3.0.0",
    info: {
        title: "Insurance Policy Check App",
        version: "1.0.0",
        description: `
Multi-tenant Insurance Policy Validation System

Default Admin (DEV):
Email: admin@system.com
Password: Admin@123
`
    },
    servers: [
        { url: "http://localhost:3000" }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        },
        schemas: {
            RoleEnum: {
                type: "string",
                enum: ["TENANT_ADMIN", "VP", "AGENT"]
            },
            TenantCreate: {
                type: "object",
                required: ["name"],
                properties: {
                    name: { type: "string", example: "Acme Insurance" }
                }
            },
            AgencyCreate: {
                type: "object",
                required: ["name"],
                properties: {
                    name: { type: "string", example: "Hyderabad Agency" }
                }
            },
            UserCreate: {
                type: "object",
                required: ["tenant_id", "role", "email", "password"],
                properties: {
                    tenant_id: { type: "string", format: "uuid" },
                    agency_id: { type: "string", format: "uuid", nullable: true },
                    role: { $ref: "#/components/schemas/RoleEnum" },
                    email: { type: "string", example: "user@company.com" },
                    password: { type: "string", example: "Password@123" }
                }
            },
            LoginRequest: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", example: "admin@system.com" },
                    password: { type: "string", example: "Admin@123" }
                }
            },
            RuleCreate: {
                type: "object",
                required: ["field_name", "rule_type"],
                properties: {
                    field_name: { type: "string", example: "policy_number" },
                    rule_type: {
                        type: "string",
                        enum: ["REQUIRED", "EXACT_MATCH", "FUZZY_MATCH", "RANGE"]
                    }
                }
            },
            ProcessRequest: {
                type: "object",
                required: ["documents", "email"],
                properties: {
                    documents: {
                        type: "array",
                        minItems: 3,
                        maxItems: 3,
                        items: {
                            type: "object",
                            properties: {
                                document_type: { type: "string", example: "POLICY_DOC" },
                                file_url: { type: "string", example: "https://file.pdf" }
                            }
                        }
                    },
                    email: { type: "string", example: "customer@mail.com" }
                }
            }
        }
    },
    security: [{ bearerAuth: [] }],
    paths: {
        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Login",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/LoginRequest" }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "JWT Token",
                        content: {
                            "application/json": {
                                example: { token: "jwt-token" }
                            }
                        }
                    }
                }
            }
        },
        "/tenants": {
            get: {
                tags: ["Tenant"],
                summary: "Get all tenants",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Tenant list",
                        content: {
                            "application/json": {
                                example: [
                                    { id: "uuid", name: "Default Tenant" }
                                ]
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Tenant"],
                summary: "Create tenant",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/TenantCreate" }
                        }
                    }
                },
                responses: { 200: { description: "Created" } }
            }
        },
        "/tenants/{tenantId}": {
            get: {
                tags: ["Tenant"],
                summary: "Get tenant by ID",
                security: [{ bearerAuth: [] }],
                parameters: [{
                    name: "tenantId",
                    in: "path",
                    required: true,
                    schema: { type: "string" }
                }],
                responses: { 200: { description: "Tenant details" } }
            },
            put: {
                tags: ["Tenant"],
                summary: "Update tenant",
                security: [{ bearerAuth: [] }],
                parameters: [{
                    name: "tenantId",
                    in: "path",
                    required: true
                }],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/TenantCreate" }
                        }
                    }
                },
                responses: { 200: { description: "Updated" } }
            },
            delete: {
                tags: ["Tenant"],
                summary: "Delete tenant",
                security: [{ bearerAuth: [] }],
                parameters: [{
                    name: "tenantId",
                    in: "path",
                    required: true
                }],
                responses: { 200: { description: "Deleted" } }
            }
        },
        "/tenants/{tenantId}/agencies": {
            get: {
                tags: ["Agency"],
                summary: "Get agencies by tenant",
                security: [{ bearerAuth: [] }],
                parameters: [{
                    name: "tenantId",
                    in: "path",
                    required: true
                }],
                responses: { 200: { description: "Agency list" } }
            }
        },
        "/agencies": {
            post: {
                tags: ["Agency"],
                summary: "Create agency",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/AgencyCreate" }
                        }
                    }
                },
                responses: { 200: { description: "Created" } }
            }
        },
        "/users": {
            post: {
                tags: ["Users"],
                summary: "Create user (Admin / VP / Agent)",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/UserCreate" }
                        }
                    }
                },
                responses: { 200: { description: "User created" } }
            }
        },
        "/agencies/{agencyId}/users": {
            post: {
                summary: "Create VP or Agent under an Agency",
                description: `
Rules:
- TENANT_ADMIN → can create VP or Agent
- VP → can create Agent only (own agency)
- Only ONE VP per agency is allowed
`,
                tags: ["Users"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "agencyId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password", "role"],
                                properties: {
                                    email: {
                                        type: "string",
                                        example: "vp@agency.com"
                                    },
                                    password: {
                                        type: "string",
                                        example: "StrongPass@123"
                                    },
                                    role: {
                                        type: "string",
                                        enum: ["VP", "AGENT"]
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "User created successfully"
                    },
                    409: {
                        description: "Agency already has a VP"
                    },
                    403: {
                        description: "Unauthorized action"
                    }
                }
            }
        },
        "/rules": {
            post: {
                tags: ["Business Rules"],
                summary: "Create business rule",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/RuleCreate" }
                        }
                    }
                },
                responses: { 200: { description: "Rule created" } }
            }
        },
        "/rules/{agencyId}": {
            get: {
                tags: ["Business Rules"],
                summary: "Get rules by agency",
                security: [{ bearerAuth: [] }],
                parameters: [{
                    name: "agencyId",
                    in: "path",
                    required: true
                }],
                responses: { 200: { description: "Rule list" } }
            }
        },
        "/process": {
            post: {
                tags: ["Processing"],
                summary: "AI → Rules → PDF → Email",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ProcessRequest" }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Completed",
                        content: {
                            "application/json": {
                                example: { reportId: "uuid", status: "COMPLETED" }
                            }
                        }
                    }
                }
            }
        },
        "/admin/dashboard": {
            get: {
                tags: ["Admin"],
                summary: "Admin dashboard stats",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Stats",
                        content: {
                            "application/json": {
                                example: { users: 10, reports: 5 }
                            }
                        }
                    }
                }
            }
        }
    }
};
module.exports = swaggerSpec;