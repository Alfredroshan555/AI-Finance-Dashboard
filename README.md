# 📈 AI Finance Dashboard

A modern, full-stack personal wealth management and portfolio tracking dashboard built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **Recharts**.

The application provides real-time portfolio analytics, Extended Internal Rate of Return (**XIRR**) calculation, Systematic Investment Plan (**SIP**) tracking, asset allocation visualizations, transaction ledgers, CSV statement import capabilities, and secure authentication (Google SSO & JWT).

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Frontend UI** | [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) with SQLite (Dev) / PostgreSQL compatible |
| **Authentication** | Custom JWT Session Cookies & Google OAuth 2.0 (Google Identity Services) |
| **Data Validation** | [Zod](https://zod.dev/) API boundary schemas |
| **Financial Engine** | Custom XIRR (Newton-Raphson method), CAGR, and NAV asset calculations |
| **Security & Hardening** | Middleware Security Headers (CSP, HSTS, X-Frame-Options), Snyk SAST Audited |

---

## ✨ Key Features

- 💼 **Portfolio Management:** Track net worth, total investments, overall returns, and absolute/annualized yields across multiple assets (Mutual Funds, Stocks, ETFs, Gold, Debt).
- 🧮 **Precision XIRR Engine:** Calculate real Extended Internal Rate of Return taking into account non-periodic cash inflows and outflows using Newton-Raphson convergence algorithms.
- 📊 **Asset Allocation Visualizations:** Interactive breakdown of portfolio exposure across asset classes (Large Cap, Mid Cap, Small Cap, Index, Commodity, Debt).
- 🔄 **SIP Tracker:** Manage active, paused, or completed Systematic Investment Plans with monthly projections and scheduled execution tracking.
- 📥 **CSV Transaction Import:** Bulk upload statement files (`.csv`) with automatic parsing via PapaParse and validation.
- 🔒 **Secure Authentication:** Integrated JWT-backed login/registration as well as Google One Tap / SSO authentication.
- ⚡ **Production Ready:** Health check API endpoint (`/api/health`), strict TypeScript types, ESLint rules, and database seed scripts.

---

## 📁 Project Structure

```text
AI Finance Dashboard/
├── prisma/
│   ├── dev.db              # SQLite Database (Development)
│   ├── schema.prisma       # Prisma ORM Database Models
│   └── seed.ts             # Database Seeding Script
├── src/
│   ├── app/                # Next.js App Router (Pages & API Routes)
│   │   ├── api/            # REST API Endpoints
│   │   │   ├── assets/     # Asset Management API
│   │   │   ├── auth/       # Login, Register, Google SSO API
│   │   │   ├── dashboard/  # Portfolio & Metrics Aggregation API
│   │   │   ├── health/     # Infrastructure Health Check API
│   │   │   ├── import/     # CSV Bulk Import API
│   │   │   ├── sips/       # SIP Tracker API
│   │   │   └── transactions/ # Transaction Ledger API
│   │   ├── login/          # User Login Page
│   │   ├── register/       # User Registration Page
│   │   ├── globals.css     # Global Tailwind Styles
│   │   └── page.tsx        # Main Financial Dashboard Page
│   ├── components/         # React UI Components
│   │   └── dashboard/
│   │       ├── AddTransactionModal.tsx  # Manual Transaction Dialog
│   │       ├── AssetAllocationChart.tsx # Pie / Donut Chart Component
│   │       ├── CSVImportModal.tsx       # CSV Bulk Upload Dialog
│   │       ├── Header.tsx               # Top Bar & User Profile Menu
│   │       ├── PortfolioChart.tsx       # Historical Growth Area Chart
│   │       ├── SIPTracker.tsx           # Active SIP Cards & Progress
│   │       ├── SummaryCards.tsx         # Net Worth & XIRR Overview Cards
│   │       ├── TransactionLedger.tsx    # Transaction History Table
│   │       └── XIRRCalculatorModal.tsx  # Interactive XIRR Tool
│   ├── context/            # Auth & Application State Contexts
│   ├── lib/                # Core Utility Modules
│   │   ├── auth.ts          # Password Hashing & JWT Verification
│   │   ├── prisma.ts        # Prisma Client Instance
│   │   ├── validation.ts    # Zod Schemas for Request Validation
│   │   └── financial/
│   │       ├── calculations.ts # Portfolio Aggregations & Metrics
│   │       ├── csvParser.ts    # CSV File Parsing Utilities
│   │       └── xirr.ts         # Newton-Raphson XIRR Engine
│   └── middleware.ts       # Security Headers & Auth Route Guard
├── DEPLOYMENT.md           # Production Rollout & Emergency Checklist
├── package.json            # Scripts and Dependencies
└── README.md               # Project Documentation
```

---

## 🗄️ Database Schema

The application uses **Prisma ORM** with the following models:

- **`User`**: Account details, password hashes, Google IDs, default currency.
- **`Portfolio`**: User portfolio containers.
- **`Asset`**: Financial instruments (Mutual Funds, Equity, Gold, Debt) with current NAV/prices.
- **`Transaction`**: BUY, SELL, DIVIDEND, or SIP_BUY trade entries with unit pricing and fees.
- **`SIP`**: Automated investment plan schedule (Frequency, Amount, Day of Month, Status).
- **`CashFlow`**: Income and expense tracking records.

---

## 🛠️ Getting Started

### 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** v20.x or higher
- **npm** v10.x or higher

### 2. Environment Setup

Create or verify the `.env` file in the root directory:

```env
# Database Connection String
DATABASE_URL="file:./dev.db"

# JWT Secret for Session Signing
JWT_SECRET="your-secure-jwt-secret-key"

# Google Single Sign-On Credentials (Optional for Google Login)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup & Seeding

Sync the database schema and populate initial demo data:

```bash
# Push schema to SQLite database
npm run db:push

# Seed initial assets, portfolios, and sample transactions
npm run db:seed
```

To visually inspect or edit database tables, you can run Prisma Studio:

```bash
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Generates Prisma client and compiles production build.
- `npm start`: Runs the built Next.js application in production mode.
- `npm run lint`: Runs ESLint across the codebase.
- `npm run db:push`: Applies Prisma schema changes directly to the database.
- `npm run db:seed`: Seeds sample financial data into the database.

---

## 🌐 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health & database connectivity check |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate user with password |
| `POST` | `/api/auth/google` | Google SSO ID Token authentication |
| `GET` | `/api/dashboard` | Fetch aggregated portfolio metrics, XIRR, and charts |
| `GET` / `POST` | `/api/assets` | Retrieve asset list or create new asset entry |
| `GET` / `POST` | `/api/transactions` | Manage buy/sell transactions |
| `GET` / `POST` | `/api/sips` | Manage systematic investment plans |
| `POST` | `/api/import` | Upload & process CSV statement files |

---

## 🚀 Production Deployment

For detailed pre-launch checklists, canary deployment steps, decision metrics, and emergency rollback procedures, refer to the [DEPLOYMENT.md](file:///Users/alfred555/Desktop/My%20Station/AI%20Finance%20Dashboard/DEPLOYMENT.md) document.

---

## 📄 License

This project is proprietary and intended for personal wealth management and financial tracking.
