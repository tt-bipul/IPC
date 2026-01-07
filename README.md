# IPC
Insurance Policy Check App – Backend (Node.js)

A multi-tenant Insurance Policy Validation platform built using Node.js + MySQL, supporting AI-based document extraction, business rule validation, PDF report generation, and email delivery, with strict role-based access control.

🚀 Features
✅ Multi-Tenant Architecture

Single database, tenant-isolated data

Tenant → Agencies → Users hierarchy

✅ Role-Based Access Control (RBAC)

TENANT_ADMIN

Vice President (VP) – only one per agency (DB enforced)

AGENT

✅ Business Capabilities

AI-powered document data extraction

Custom business rules per agency

Field-by-field document comparison

PDF report generation

Email delivery of reports

✅ Security

JWT authentication

Role & tenant guards

Password hashing with bcrypt

DB-level enforcement for critical rules

✅ Developer Friendly

Single server.js file

Auto database & table creation

Default admin user

Full Swagger (OpenAPI 3.0) documentation

🧱 Tech Stack
Layer	Technology
Backend	Node.js (Express)
Database	MySQL
Auth	JWT
ORM	mysql2 (raw queries)
AI	External AI API (pluggable)
PDF	pdfkit
Email	nodemailer (SMTP / SES ready)
Docs	Swagger UI
📁 Project Structure
.
├── server.js        # Complete backend (single file)
├── package.json
├── README.md
└── reports/         # Generated PDF reports

⚙️ Setup & Installation
1️⃣ Prerequisites

Node.js ≥ 18

MySQL ≥ 8.0

2️⃣ Install Dependencies
npm install

3️⃣ Configure Database & SMTP

Edit in server.js:

const dbConfig = {
  host: "localhost",
  user: "root",
  password: ""
};


SMTP (for emails):

auth: {
  user: "your@gmail.com",
  pass: "app-password"
}

▶️ Run the Server
node server.js


Server will start on:

http://localhost:3000


Swagger UI:

http://localhost:3000/swagger

🔐 Default Admin (Auto-Created)

On first run, the system creates a default tenant and admin user.

Email:    admin@system.com
Password: Admin@123
Role:     TENANT_ADMIN


Use this account to:

Create agencies

Assign VP

Manage users

Access all APIs

👥 User Roles & Rules
TENANT_ADMIN

Create tenants & agencies

Create VP or Agents

View all tenant data

Vice President (VP)

Exactly ONE VP per agency (DB enforced)

Create & manage agents

Define business rules

Agent

Upload documents

Trigger AI processing

Generate reports

Send reports via email

🛡️ 1 VP per Agency – Guaranteed

Enforced at database level using:

Generated column

Unique index

This prevents race conditions and invalid states.

📡 Key APIs (Summary)
Auth

POST /auth/login

Tenant

GET /tenants

POST /tenants

GET /tenants/{tenantId}

PUT /tenants/{tenantId}

DELETE /tenants/{tenantId}

Agency

POST /agencies

GET /tenants/{tenantId}/agencies

Users

POST /agencies/{agencyId}/users (Create VP / Agent)

GET /agencies/{agencyId}/users

Business Rules

POST /rules

GET /rules/{agencyId}

Processing

POST /process
(AI → Rules → PDF → Email)

Admin

GET /admin/dashboard

👉 Full details available in Swagger UI

🤖 AI Integration

The system calls an external AI API for:

Document classification

Field extraction

The AI layer is pluggable and can be replaced with:

OpenAI

Azure Form Recognizer

AWS Textract

Custom ML services

📄 Report Generation

PDF generated per comparison

Stored locally

Automatically emailed to recipients

📘 API Documentation

Swagger UI is enabled at:

http://localhost:3000/swagger


Features:

JWT authorization

Enum dropdowns

Sample request/response payloads

⚠️ Notes for Production

Before going live:

Move secrets to environment variables

Enforce HTTPS

Use cloud storage (S3) for PDFs

Use AWS SES / SendGrid for email

Add refresh tokens

Add audit logging

🧭 Roadmap (Optional Enhancements)

UI dashboards (React)

File upload with S3

Async processing with queues

Approval workflows

Versioned reports

Multi-language support

🧑‍💻 Author / Maintainer

This backend is designed as a scalable MVP → production-ready foundation for insurance policy validation platforms.