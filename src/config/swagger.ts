import { url } from "inspector";
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Insurance Policy Check API",
      version: "1.0.0",
      description:
        "API documentation for the Insurance Policy Check application",
    },
    servers: [
      {
        url: "http://localhost:4000/",
        description: "Local Server",
      },
      {
        url: "https://ipc-black.vercel.app/",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: [
            "username",
            "email",
            "password",
            "user_role",
            "first_name",
            "last_name",
          ],
          properties: {
            id: {
              type: "string",
              description: "The auto-generated id of the user",
            },
            username: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            user_role: {
              type: "string",
              enum: ["SUPER_ADMIN", "VP", "AGENCY_EXECUTIVE"],
            },
            first_name: { type: "string" },
            last_name: { type: "string" },
            tenant_id: { type: "string" },
            agency_id: { type: "string" },
            phone_number: { type: "string" },
            country: { type: "string" },
            address: { type: "string" },
          },
        },
        UserLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
        },
        Tenant: {
          type: "object",
          required: ["name"],
          properties: {
            id: {
              type: "string",
              description: "The auto-generated id of the tenant",
            },
            name: { type: "string" },
            company_email: { type: "string" },
            phone_number: { type: "string" },
            country: { type: "string" },
            address: { type: "string" },
          },
        },
        Agency: {
          type: "object",
          required: ["tenant_id", "agency_name", "email"],
          properties: {
            id: { type: "string" },
            tenant_id: { type: "string" },
            agency_name: { type: "string" },
            branch_code: { type: "string" },
            email: { type: "string" },
            phone_number: { type: "string" },
            alternate_phone_number: { type: "string" },
            country: { type: "string" },
            address_line_1: { type: "string" },
            address_line_2: { type: "string" },
            pincode: { type: "string" },
            state: { type: "string" },
            city: { type: "string" },
          },
        },
        BusinessRule: {
          type: "object",
          required: ["agency_id", "field_name", "rule_type"],
          properties: {
            id: { type: "string" },
            tenant_id: { type: "string", description: "The id of the tenant" },
            agency_id: { type: "string", description: "The id of the agency" },
            field_name: { type: "string" },
            rule_type: {
              type: "string",
              enum: ["EXACT_MATCH", "DATE_RANGE", "NOT_EMPTY", "REGEX"],
            },
            criteria: {
              type: "object",
              description: "The criteria for the rule (JSON)",
            },
          },
        },
      },
    },
    tags: [
      { name: "Users", description: "The users managing API" },
      { name: "Tenants", description: "The tenants managing API" },
      { name: "Agencies", description: "The agencies managing API" },
      { name: "BusinessRules", description: "The business rules managing API" },
      { name: "Documents", description: "The documents managing API" },
      { name: "Process", description: "The process API" },
    ],
    paths: {
      "/auth/register": {
        post: {
          summary: "Register a new user",
          tags: ["Users"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          responses: {
            201: {
              description: "The user was successfully created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/User" },
                },
              },
            },
            500: { description: "Some server error" },
          },
        },
      },
      "/auth/login": {
        post: {
          summary: "Log in a user",
          tags: ["Users"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserLogin" },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      token: { type: "string" },
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            401: { description: "Invalid credentials" },
            500: { description: "Some server error" },
          },
        },
      },
      "/tenants": {
        post: {
          summary: "Create a new tenant",
          tags: ["Tenants"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Tenant" },
              },
            },
          },
          responses: {
            201: {
              description: "The tenant was successfully created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Tenant" },
                },
              },
            },
            401: { description: "Unauthorized" },
            500: { description: "Some server error" },
          },
        },
        get: {
          summary: "Returns the list of all tenants",
          tags: ["Tenants"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "The list of the tenants",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Tenant" },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/tenants/{id}": {
        get: {
          summary: "Get the tenant by id",
          tags: ["Tenants"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              schema: { type: "string" },
              required: true,
              description: "The tenant id",
            },
          ],
          responses: {
            200: {
              description: "The tenant description by id",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Tenant" },
                },
              },
            },
            404: { description: "The tenant was not found" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/agencies": {
        post: {
          summary: "Create a new agency",
          tags: ["Agencies"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Agency" },
              },
            },
          },
          responses: {
            201: {
              description: "The created agency",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Agency" },
                },
              },
            },
            401: { description: "Unauthorized" },
            500: { description: "Some server error" },
          },
        },
      },
      "/agencies/tenant/{tenantId}": {
        get: {
          summary: "Get agencies by tenant id",
          tags: ["Agencies"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "tenantId",
              schema: { type: "string" },
              required: true,
              description: "The tenant id",
            },
          ],
          responses: {
            200: {
              description: "List of agencies",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Agency" },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/agencies/get-all": {
        get: {
          summary: "Get all agencies",
          tags: ["Agencies"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "List of all agencies",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Agency" },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/agencies/{id}": {
        get: {
          summary: "Get agency by id",
          tags: ["Agencies"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              schema: { type: "string" },
              required: true,
              description: "The agency id",
            },
          ],
          responses: {
            200: {
              description: "The agency",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Agency" },
                },
              },
            },
            404: { description: "Agency not found" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/rules": {
        post: {
          summary: "Create a new business rule",
          tags: ["BusinessRules"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BusinessRule" },
              },
            },
          },
          responses: {
            201: {
              description: "The created business rule",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BusinessRule" },
                },
              },
            },
            401: { description: "Unauthorized" },
            500: { description: "Some server error" },
          },
        },
      },
      "/rules/agency/{agencyId}": {
        get: {
          summary: "Get business rules by agency id",
          tags: ["BusinessRules"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "agencyId",
              schema: { type: "string" },
              required: true,
              description: "The agency id",
            },
          ],
          responses: {
            200: {
              description: "List of business rules",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/BusinessRule" },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/documents/upload": {
        post: {
          summary: "Upload documents",
          tags: ["Documents"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    documents: {
                      type: "array",
                      items: { type: "string", format: "binary" },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Documents uploaded successfully" },
            400: { description: "Invalid file type or bad request" },
            401: { description: "Unauthorized" },
            500: { description: "Some server error" },
          },
        },
      },
      "/process": {
        post: {
          summary: "Process documents",
          tags: ["Process"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    documents: {
                      type: "array",
                      items: { type: "string", format: "binary" },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Documents processed successfully" },
            400: { description: "Invalid file type or bad request" },
            401: { description: "Unauthorized" },
            500: { description: "Some server error" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [], 
};

const specs = swaggerJsdoc(options);

export default specs;
