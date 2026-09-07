# SwiftShip Global — International Courier & Logistics Platform

SwiftShip Global is a modern, production-grade international courier and logistics SaaS platform built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Prisma ORM**, and **PostgreSQL**.

---

## 🌟 Core Architecture & Capabilities

- **Customer Portal**: Create consignments, print commercial waybills, track live GPS checkpoints, and review invoices.
- **Dynamic Rate Engine**: Calculates volumetric dimensional weight (\(L \times W \times H / 5000\)), fuel adjustments, and international tariffs.
- **Tracking System**: Real-time telemetry, flight departures, hub scans, and digital Proof of Delivery (POD) with electronic signature.
- **Driver Portal**: Route dispatch manifests, stop-by-stop ETAs, and instant mobile delivery confirmation.
- **Warehouse Staff Interface**: Facility package barcode scanners with status updates (*Arrived at Hub*, *Customs Cleared*, *Out for Delivery*).
- **Business Portal**: High-volume commercial shipper tools with bulk CSV consignments, team permissions, and API keys.
- **Enterprise Operations / Admin**: Live global shipments feed, revenue aggregates, role-based access control (RBAC), and exception handling.
- **Flexible Payments**: Built-in development simulation mode alongside production abstractions for **Stripe**, **Paystack**, and **Flutterwave**.
- **100% Vercel & Serverless Ready**: No persistent local disk dependencies, stateless session tokens, and connection-pooled PostgreSQL queries.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js 18.18+ or 20+** (Tested on Node.js v24)
- **PostgreSQL Database** (e.g., Neon.tech, Supabase, Railway, or local Postgres)

### 2. Installation
`ash
# Clone repository and enter directory
cd Courier

# Install dependencies
npm install

# Setup environment configuration
cp .env.example .env
`

Edit .env and provide your DATABASE_URL and AUTH_SECRET.

### 3. Database Migration & Seed
`ash
# Generate Prisma Client
npx prisma generate

# Apply schema to database
npx prisma db push

# Seed sample consignments, hubs, and demo accounts
npm run db:seed
`

### 4. Run Development Server
`ash
npm run dev
`

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | dmin@swiftship.io | Admin123! |
| **Customer** | john@example.com | Customer123! |
| **Courier Driver** | driver@swiftship.io | Driver123! |

---

## 📦 Sample Tracking Numbers for Testing

- UA8F4K92LM381 — **IN TRANSIT** (New York JFK Hub to London Heathrow)
- UA77B219KP440 — **DELIVERED** (With verified digital Proof of Delivery)

---

## 🌐 Deployment to Vercel

1. Push this repository to GitHub or GitLab.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Set Environment Variables in Project Settings from .env.example:
   - DATABASE_URL
   - AUTH_SECRET
   - NEXTAUTH_URL
4. Deploy! Run 
px prisma db push and 
px prisma db seed on your production database.