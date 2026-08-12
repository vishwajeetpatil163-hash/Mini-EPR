# Wholesale ERP & CRM Operations Portal

An enterprise-grade, full-stack wholesale operations management platform designed for distribution businesses. The portal integrates Customer Relationship Management (CRM), Product & Warehouse Inventory Management, Real-time Stock Movement Audit Trails, and Sales Delivery Challan Workflows with transactional inventory deduction and stock shortage validation.

The application strictly adheres to multi-role access controls (RBAC) across four operational staff roles (Admin, Sales, Warehouse, Accounts), features Indian business localization (GSTIN validation, GST tax rates, Rupee `₹` formatting, sequential `CH-2026-XXXX` delivery challans), and enforces full data integrity across inventory transactions.

---

## 🛠️ Tech Stack & Architecture Overview

### **Frontend**
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with responsive operational design
- **Icons**: Lucide React
- **State Management**: React Context (`AuthContext`) with local persistent browser token storage

### **Backend**
- **Runtime**: Node.js with Express & TypeScript (`tsx` runner in development, `esbuild` for production)
- **Authentication**: JWT (JSON Web Tokens) with embedded role claims and `bcryptjs` password encryption
- **API Architecture**: RESTful API design with structured JSON error payloads, CORS origin checks, and RBAC authorization middleware
- **Data Engine**: Relational in-memory transactional database store implementing ACID-compliant state changes, snapshot pricing preservation, auto-incrementing serial generators, and audit ledger tracking
- **ORM Schema**: Prisma Schema specification (`prisma/schema.prisma`)

---

## 🚀 Local Setup Instructions

Follow these step-by-step instructions to run the application locally on your machine.

### Prerequisites
- **Node.js** (v20+ recommended)
- **npm** (v10+)

### Step-by-Step Commands

1. **Clone the Repository**
   ```bash
   git clone https://github.com/vishwajeetpatil163-hash/Mini-EPR.git
   cd Mini-EPR
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Start the Unified Development Server**
   ```bash
   npm run dev
   ```
   The Express backend and Vite frontend will launch together on **`http://localhost:3000`**.

5. **Build for Production**
   ```bash
   npm run build
   ```

6. **Start Production Server**
   ```bash
   npm run start
   ```

---

## 🔑 Environment Variables

To configure the application across local development, staging, or production environments, define the following environment variables (defined in `.env.example`). **Never commit sensitive secret values directly to git.**

| Variable Name | Description |
| :--- | :--- |
| `NODE_ENV` | Environment mode (`development` or `production`). |
| `PORT` | The port number on which the Express server binds and listens (Default: `3000`). |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens for authentication. |
| `CORS_ORIGIN` | Comma-separated list of allowed origin domains permitted to make cross-origin API requests. |
| `VITE_API_URL` | Base URL of the backend API used by the React client when deployed separately (e.g., Vercel + Render). |
| `DATABASE_URL` | Connection URL for PostgreSQL database instance (when using external relational storage). |

---

## 🔑 Demo Test Login Credentials

The portal comes pre-seeded with 4 default staff user accounts corresponding to each operational role:

| Role | Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@wholesale.com` | `admin123` | Full system governance, staff user registration, master directory edits, system overrides |
| **SALES** | `sales@wholesale.com` | `sales123` | CRM customer pipeline management, log follow-up notes, create draft sales challans |
| **WAREHOUSE** | `warehouse@wholesale.com` | `warehouse123` | Inventory catalog management, bin locations, log manual Stock IN/OUT audit movements |
| **ACCOUNTS** | `accounts@wholesale.com` | `accounts123` | Financial audit of sales challans, confirm stock deduction, generate printable invoices |

*Note: You can switch roles instantly in the UI using the **Quick Demo Role Switcher** in the top navigation bar.*

---

## ☁️ How to Deploy

This project can be deployed using Google AI Studio / Google Cloud Run, or hosted as a split frontend/backend on Vercel and Render.

### Option A: Deploying via AI Studio / Google Cloud Run
1. In **Google AI Studio**, open the top-right deployment menu and select **Deploy / Publish to Cloud Run**.
2. Select your Google Cloud Project ID and region.
3. Set runtime environment variables (`JWT_SECRET`, `NODE_ENV=production`).
4. AI Studio will automatically execute `npm run build` and deploy the unified Docker container to Google Cloud Run listening on port `3000`.

### Option B: Split Deployment (Vercel + Render)
1. **Backend Deployment (Render / Railway / Cloud Run)**:
   - Connect your GitHub repository `Mini-EPR`.
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - Add Environment Variables: `JWT_SECRET`, `NODE_ENV=production`, `CORS_ORIGIN=https://mini-epr.vercel.app`
2. **Frontend Deployment (Vercel)**:
   - Connect your GitHub repository `Mini-EPR`.
   - Set Environment Variable: `VITE_API_URL=https://[YOUR_RENDER_BACKEND_URL].onrender.com`
   - Deploy project.

---

## 🌐 Live URLs

- **Live Frontend Application**: `[LIVE_FRONTEND_URL]`
- **Live Backend API**: `[LIVE_BACKEND_URL]`
- **AI Studio Applet Preview**: `https://ais-pre-l2v5mbt63h34zg2orpn2hs-869178407938.asia-east1.run.app`

---

## ✨ Extra Features & Business Enhancements

Beyond standard CRUD operations, this system includes several real-world enterprise capabilities:

1. **Transactional Stock Protection**:
   - Confirming a sales delivery challan (`PATCH /api/challans/:id/confirm`) automatically performs stock availability checks across all line items.
   - If any item's available inventory is insufficient, the transaction fails with HTTP 409 Conflict, returning itemized shortage details without altering inventory.
2. **Indian Business Localization**:
   - GSTIN format validation (`24ABCDE1234F1Z5`) and 18% GST tax breakdown calculations.
   - INR (`₹`) currency formatting across all order totals and inventory valuations.
   - Year-prefixed sequential challan numbering (e.g. `CH-2026-0001`).
3. **Comprehensive Stock Audit Trail**:
   - Complete ledger tracking of every inventory change (Manual Stock IN, Manual Stock OUT, Challan Dispatch, Cancellation Reversal).
4. **CRM Customer Follow-up System**:
   - Interactive interaction history log allowing sales reps to record follow-up dates and notes for each wholesale client.
5. **Printable Invoices & GST Bills**:
   - Clean, print-ready GST tax invoice view formatted for thermal and standard A4 printers.

---

## ⚠️ Known Limitations & Assumptions

1. **In-Memory Seed Storage**:
   - By default, the application runs on an in-memory database engine pre-seeded with realistic wholesale data. Changes persist during server runtime; to enable permanent PostgreSQL persistence, configure `DATABASE_URL` with Prisma.
2. **Single Warehouse Model**:
   - Stock counts are currently managed at a single primary distribution center level (with bin location tags), rather than multi-warehouse transfers.
3. **Print Formatting**:
   - Tax invoices rely on standard browser print rendering engines (`window.print()`).

---

## 🎥 Demo Video

Watch a complete walkthrough of the Wholesale ERP & CRM Operations Portal demonstrating role-based access, customer management, inventory stock audit, and sales challan workflows:

- **Demo Video Link**: `[DEMO_VIDEO_LINK]`

---

## 📑 Postman Collection

A complete Postman Collection is provided in the repository (`postman_collection.json`) containing pre-configured requests for Authentication, Customer CRM, Products & Stock Audit, and Sales Challan confirmation/cancellation workflows.

- **Postman Collection File**: [`./postman_collection.json`](./postman_collection.json)
- **Postman Workspace / Import Link**: `[POSTMAN_LINK]`
