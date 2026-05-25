# Rent Tracker 

A full-stack property rent management web application built with **Next.js 16**, **Supabase**, and **Tailwind CSS v4**.

> Created & Designed by **Ankit Raj** | **Satyajeet Ramnit**  
> © 2026 NextGenUI. All Rights Reserved. — [MIT License](./LICENSE)

---

## Features

### Owner Portal
- **Dashboard** — Stats overview, 6-month rent trend chart (bar), occupancy donut chart, current month summary
- **Properties** — Full CRUD: add/edit/delete properties with address details
- **Houses / Units** — Add multiple houses per property (house number, floor, type, rent amount, security deposit)
- **Tenants** — Group/family model: one tenancy with multiple members, Aadhaar upload, agreement file upload
- **Rent Tracker** — Monthly rent recording per house, mark paid/partial/pending, payment mode (Cash / UPI / Bank Transfer)
- **Tenant History** — View all vacated tenants
- **CSV Export** — Export rent records and tenant list to CSV
- **Deposit Refund** — Owner can set a refund amount and publish it selectively to the tenant

### Tenant Portal (`/tenant/login`)
- Email-only access — tenant enters their registered email, no password required
- Read-only dashboard: rent status, payment history, deposit info, household members
- Deposit refund amount shown **only** when owner has published it

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Language | TypeScript |
| Fonts | Space Grotesk · Inter · JetBrains Mono |

---

## Project Structure

```
app/
├── (auth)/login/          # Owner email+password login & sign-up
├── (dashboard)/           # Owner dashboard (protected)
│   └── dashboard/
│       ├── page.tsx       # Main dashboard with charts
│       ├── properties/    # Property CRUD
│       ├── tenants/       # Tenant management + history
│       └── rent/          # Monthly rent tracker
├── (tenant)/tenant/       # Tenant portal (cookie-protected)
│   ├── login/             # Email-only login
│   └── dashboard/         # Tenant read-only view
├── privacy-policy/
├── license/
└── sitemap.ts

components/
├── charts/                # RentTrendChart, OccupancyChart (Recharts)
├── layout/                # Sidebar, Footer
├── tenant/                # SignOutTenantButton
└── tenants/               # TenantGroupForm, ToggleLoginAccess

lib/
├── supabase/              # client.ts, server.ts, admin.ts
├── actions/               # Server actions (properties, houses, tenants, rent, tenantPortal)
└── types.ts               # Full Supabase DB TypeScript types

supabase/
└── full_schema.sql        # Complete DB setup — run this once in Supabase SQL Editor
```

---

## Getting Started

### 1. Clone & install

```bash
git clone <repo-url>
cd rent-tracker
npm install
```

### 2. Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> Find these in **Supabase Dashboard → Settings → API**.  
> `SUPABASE_SERVICE_ROLE_KEY` is server-only — never exposed to the browser.

### 3. Database setup

1. Open **Supabase Dashboard → SQL Editor → New query**
2. Paste the entire contents of `supabase/full_schema.sql`
3. Click **Run**

This creates all 8 tables, RLS policies, and triggers in one shot. Safe to re-run.

### 4. Storage bucket

In **Supabase Dashboard → Storage**:
- Create a bucket named `documents`
- Set it to **Public**

This is used for Aadhaar document and agreement file uploads.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Authentication

| Role | Login URL | Method |
|---|---|---|
| Owner | `/login` | Email + Password (Supabase Auth) |
| Tenant | `/tenant/login` | Email lookup (no password, HTTP-only cookie) |

> Tenant access is purely read-only. The owner must register the tenant's email and enable `can_login = true` from the Tenants dashboard.

---

## Design System

| Token | Value |
|---|---|
| Background | `#030304` |
| Surface | `#0F1115` |
| Primary (Orange) | `#F7931A` |
| Secondary | `#EA580C` |
| Gold | `#FFD600` |
| Muted | `#94A3B8` |
| Heading font | Space Grotesk |
| Body font | Inter |
| Mono font | JetBrains Mono |

---

## Database Tables

| Table | Purpose |
|---|---|
| `profiles` | Owner accounts (linked to Supabase auth.users) |
| `properties` | Buildings / complexes owned |
| `houses` | Individual units within a property |
| `tenants` | Active tenancy records (one per house) |
| `tenant_members` | Individual people in a tenancy group |
| `tenant_history` | Vacated tenant archive |
| `rent_records` | Monthly payment records |
| `documents` | Uploaded files (Aadhaar, agreements) |

---

## License

[MIT](./LICENSE) © 2026 NextGenUI