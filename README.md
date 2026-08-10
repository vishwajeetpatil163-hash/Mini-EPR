# Wholesale ERP + CRM Operations Portal

A complete full-stack enterprise web application for wholesale and distribution operations, featuring Customer Relationship Management (CRM), Product & Inventory Control, Stock Movement Audit Trails, and Sales Challan Management with transactional stock validation.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v20+ recommended)
- npm / npx

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Install & Start Development Server
```bash
npm install
npm run dev
```
The unified Express + Vite development server starts automatically on **`http://localhost:3000`**.

---

## 🔑 Demo Login Credentials

The application comes pre-seeded with staff accounts for testing Role-Based Access Control (RBAC):

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@wholesale.com` | `admin123` | Full system access, staff provisioning, customer deletion, master overrides |
| **SALES** | `sales@wholesale.com` | `sales123` | CRM customer directory, follow-up logs, draft sales challan creation |
| **WAREHOUSE** | `warehouse@wholesale.com` | `warehouse123` | Inventory CRUD, stock movements, bin locations, order dispatching |
| **ACCOUNTS** | `accounts@wholesale.com` | `accounts123` | Challan audit verification, stock reduction confirmation, invoice printing |

*Tip: Click the **Quick Demo Role Switcher** badge in the top navigation bar or login screen to instantly switch roles!*

---

## 🛠️ Architecture & Tech Stack

### **Backend**
- **Runtime**: Node.js with Express & TypeScript (`tsx` runner in dev)
- **Database Engine**: In-memory / file-backed relational store implementing full ACID transactions, sequential year-based challan numbering (`CH-2026-0001`), snapshot historical item preservation, and foreign key integrity.
- **ORM Schema**: Prisma Schema documented in `prisma/schema.prisma`
- **Authentication**: JWT authentication with embedded role claims and `bcryptjs` password hashing.

### **Frontend**
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with custom responsive Stitch UI layout components
- **Icons**: Lucide React

---

## 📦 Docker Container Setup

Build and launch via Docker Compose:
```bash
docker-compose up --build
```
This starts the Node.js Cloud Run application container alongside a PostgreSQL 16 database.

---

## 📑 API Endpoints Summary

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| `POST` | `/api/auth/register` | Register new staff user account | ADMIN |
| `GET` | `/api/auth/me` | Fetch currently logged in user profile | All |
| `GET` | `/api/dashboard/stats` | KPI metrics (Customers, Low Stock, Sales, Drafts) | All |
| `GET` | `/api/customers` | Search & paginate customer CRM accounts | All |
| `POST` | `/api/customers` | Create new customer account | ADMIN, SALES |
| `POST` | `/api/customers/:id/followups` | Record customer follow-up interaction note | ADMIN, SALES |
| `GET` | `/api/products` | Paginated products list (Filter `?lowStock=true`) | All |
| `POST` | `/api/products` | Create new inventory product | ADMIN, WAREHOUSE |
| `POST` | `/api/products/:id/stock-movements` | Log manual Stock IN / Stock OUT movement | ADMIN, WAREHOUSE |
| `GET` | `/api/products/stock-movements/all` | Fetch global stock audit ledger | All |
| `GET` | `/api/challans` | Master list of sales delivery challans | All |
| `POST` | `/api/challans` | Create DRAFT or CONFIRMED sales challan | ADMIN, SALES, ACCOUNTS |
| `PATCH`| `/api/challans/:id/confirm` | Confirm challan & deduct stock (HTTP 409 on shortage) | ADMIN, ACCOUNTS, WAREHOUSE |
| `PATCH`| `/api/challans/:id/cancel` | Cancel challan & reverse stock movements | ADMIN, SALES, ACCOUNTS |

---

## 🧪 Postman Collection
Import `postman_collection.json` into Postman to test all endpoints including success and stock conflict (`409`) failure cases.
