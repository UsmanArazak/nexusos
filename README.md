# NexusOS — Multi-Tenant School Information System

> A modern, multi-tenant SaaS School Information System built with Next.js, Supabase, and Tailwind CSS.

---

## ✨ What is NexusOS?

NexusOS is a platform where any school can self-register and get their own **completely isolated workspace**. Each school manages its own students, staff, classes, results, attendance, fees, and a public-facing school website.

**Multi-tenancy is enforced at every level:**
- Every database table has a `school_id` column
- Supabase Row Level Security (RLS) policies restrict every query to the authenticated user's school
- A `my_school_id()` helper function ensures no cross-school data leakage is possible

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Supabase |
| Auth | NextAuth.js (Credentials + Supabase Auth) |
| File Uploads | Supabase Storage |
| Payments | Paystack |
| Deployment | Vercel |

---

## 🎨 Design System (AuraUI)

NexusOS uses the **AuraUI** design system. For the full specification, see [AuraUI.md](./AuraUI.md).

| Token | Value | Description |
|-------|-------|-------------|
| **Primary** | `#7C3AED` | Purple: branding, active states, buttons |
| **Background**| `#F3F4F6` | Light Grey: main page background |
| **Sidebar** | `#FFFFFF` | White: clean navigation background |
| **Text** | `#1C1C1C` | Dark Charcoal: primary typography |

Fonts: **Inter** (body) + **Plus Jakarta Sans** (headings)


---

## 👥 User Roles

| Role | Description |
|------|-------------|
| `super_admin` | Platform owner — can manage all schools |
| `school_admin` | Manages a single school's entire workspace |
| `teacher` | Views classes, records results & attendance |
| `staff` | Limited admin access |
| `student` | Views own results, attendance, fees |
| `parent` | Views their child's data |

---

## 📁 Project Structure

```
NexusOs/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (fonts, metadata)
│   │   ├── page.tsx                  # Landing / home page
│   │   ├── globals.css               # Design tokens + Tailwind import
│   │   │
│   │   ├── auth/                     # Auth pages (no sidebar)
│   │   │   ├── layout.tsx
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── register/                 # School self-registration
│   │   │   └── page.tsx
│   │   │
│   │   ├── dashboard/                # School admin / staff workspace
│   │   │   ├── layout.tsx            # Sidebar + Topbar shell
│   │   │   ├── page.tsx              # Overview / stats
│   │   │   ├── students/page.tsx
│   │   │   ├── staff/page.tsx
│   │   │   ├── classes/page.tsx
│   │   │   ├── subjects/page.tsx
│   │   │   ├── results/page.tsx
│   │   │   ├── attendance/page.tsx
│   │   │   ├── fees/page.tsx
│   │   │   ├── timetable/page.tsx
│   │   │   ├── events/page.tsx
│   │   │   ├── messages/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── superadmin/               # Platform owner area
│   │   │   └── page.tsx
│   │   │
│   │   ├── schools/
│   │   │   └── [schoolSlug]/         # Public-facing school website
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                      # API Route Handlers
│   │       ├── auth/
│   │       │   └── [...nextauth]/    # NextAuth handler
│   │       │       └── route.ts
│   │       ├── schools/
│   │       │   └── register/         # School registration endpoint
│   │       │       └── route.ts
│   │       └── payments/
│   │           ├── initialize/       # Paystack payment init
│   │           │   └── route.ts
│   │           └── webhook/          # Paystack webhook receiver
│   │               └── route.ts
│   │
│   ├── components/                   # Shared UI components
│   │   └── layout/
│   │       ├── Sidebar.tsx           # Dark sidebar with nav items
│   │       └── Topbar.tsx            # Top header bar
│   │
│   ├── lib/                          # Core utilities & config
│   │   ├── auth.ts                   # NextAuth options (authOptions)
│   │   └── supabase/
│   │       ├── client.ts             # Browser Supabase client
│   │       ├── server.ts             # Server Supabase client (SSR)
│   │       └── middleware.ts         # Session refresh middleware helper
│   │
│   ├── types/
│   │   └── index.ts                  # All shared TypeScript types
│   │
│   └── middleware.ts                 # Next.js edge middleware (auth guard)
│
├── supabase/
│   └── schema.sql                    # Full PostgreSQL schema + RLS policies
│
├── .env.example                      # Environment variable template
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret   # openssl rand -base64 32
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
```

### 3. Set Up Supabase Database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → Run
3. Enable **Row Level Security** (already set in schema)
4. Configure **Supabase Storage** bucket called `school-assets` for file uploads

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Multi-Tenancy Security Model

```
User authenticates → JWT contains { role, schoolId }
               ↓
All queries → filtered by school_id = my_school_id()
               ↓
Supabase RLS → enforces policy at database level
               ↓
No cross-school data leakage possible
```

Every API route and server action must also pass `school_id` from the authenticated session — never from the request body.

---

## 🗺 Roadmap (Features to Build)

- [ ] School registration + onboarding flow
- [ ] Student CRUD with CSV import
- [ ] Staff management
- [ ] Class & subject assignment
- [ ] Results entry & report card generation
- [ ] Attendance tracking
- [ ] Fee collection via Paystack
- [ ] Public school website editor
- [ ] Super admin dashboard
- [ ] Email notifications
- [ ] Parent portal
- [ ] Mobile-responsive layouts

---

## 📄 License

Private & Proprietary — NexusOS. All rights reserved.
