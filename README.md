# SAT-7 Production Booking

A modern, production-ready internal platform for managing **TV / Media production bookings** — guests, programs, scheduling, production requirements, transportation, dress code, WhatsApp confirmations, calendar, and activity history.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Neon Postgres + Auth.js**. Deployable to **Vercel** and source-controlled on **GitHub**.

> **Backend note:** This project originally targeted Supabase, but the org had exhausted Supabase's free-project limit. It was migrated to **Neon (free Postgres)** + **Auth.js** — real Postgres, so the entire schema and the concurrency-safe booking-number generator are unchanged. No per-org project cap, $0, Vercel-native.

---

## Features

- **Dashboard** — KPI cards, live-vs-recorded donut, bookings-by-status & by-channel bars, upcoming list, activity feed, auto-refresh ("Live").
- **Booking Wizard** — 7-step: Guest → Program → Schedule → Production Requirements → Transportation → Dress Code → Review. Validation + scheduling-conflict detection.
- **Bookings** — search, filters, sort, pagination, responsive table↔cards, CSV export.
- **Booking Detail** — 9 sections + activity timeline (every status change persisted).
- **Calendar** — month / week / day with status colors.
- **People / Programs** — CRUD with stats and program-default autofill.
- **Settings** — org, channels, locations, users (Admin API, no invite email), roles, options.
- **WhatsApp** — `wa.me` deep link with formatted message, logged honestly as `prepared` (never claims delivery).
- **Print** call-sheet, **auth + roles** (4 roles), **safe booking-number generator** (row-locked Postgres counter).

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS (dark broadcast theme + light mode) |
| Database | **Neon Postgres** (free) |
| Auth | **Auth.js (NextAuth v5)** — Credentials provider, bcrypt passwords, JWT sessions |
| Authorization | App-level role guards (Administrator / Production Manager / Production User / Viewer) |
| Realtime | Client auto-refresh (Neon has no Supabase Realtime) |
| Deployment | Vercel (GitHub-connected) |

> **Why no RLS:** Neon doesn't provide Supabase-style RLS. Authorization is enforced in application code — `lib/auth.ts` role helpers (`isAdmin`, `isManager`, `canWrite`) plus per-action checks in `services/*`. All routes are protected by `middleware.ts`, and every write is gated by the caller's role.

---

## Project Structure

```
app/
  (auth)/login/        # login (no chrome)
  (app)/               # authenticated AppShell
    dashboard/ bookings/ bookings/[id]/ bookings/new/ calendar/ people/ programs/ settings/
  api/auth/[...nextauth]/   # Auth.js handler
  api/...              # quick-create + settings route handlers
  auth/signout/        # server sign-out
lib/
  config.ts            # DATABASE_URL, isDbConfigured()
  db.ts                # Neon Pool + db()/tx() (never throws — returns {rows,error})
  auth.ts              # getCurrentUser / isAdmin / isManager / canWrite (from Auth.js session)
  queries.ts services/ types.ts utils.ts whatsapp.ts csv.ts
auth.config.ts auth.ts  # Auth.js configuration
middleware.ts          # route protection (Auth.js)
supabase/migrations/   # 001_schema.sql, 002_functions_rls.sql (postgres, RLS-free)
scripts/               # migrate.ts, seed.ts
```

---

## 1. Install

```bash
git clone <your-repo-url> bookingleb && cd bookingleb
npm install
```

## 2. Configure Neon (free Postgres)

1. Create a project at https://console.neon.tech (free).
2. Copy the **pooled** connection string from Connection Details.
3. Copy `.env.example` → `.env.local` and set `DATABASE_URL` + `AUTH_SECRET`
   (`openssl rand -base64 32`).

```
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
AUTH_SECRET=<long-random-string>
```

## 3. Run migrations + seed

```bash
npm run migrate          # applies supabase/migrations/001 + 002
npm run seed             # demo data + first Administrator (env-overridable)
```

The seed creates an admin: `admin@bookingleb.app` / `Admin1234!` (override with
`BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD`). **Change this password after first login.**

## 4. Run locally

```bash
npm run dev              # http://localhost:3000
```

Sign in with the seeded admin (or any user you add in Settings → Users).

## 5. Deploy to Vercel

```bash
git push origin main
```

Vercel → New Project → Import `sat7leb-ux/bookingleb` → Deploy. Add env vars:
`DATABASE_URL`, `AUTH_SECRET`. The standard `next build` is used (no custom server).

## 6. Connect GitHub to Vercel

Vercel → Project → Git → Connect Repository → your repo. Every push to `main` deploys.

---

## Booking number safety

`generate_booking_number()` (in `002_functions_rls.sql`) locks the yearly counter row
and increments it atomically; a `before insert` trigger fills `booking_number` when omitted.
Unique under concurrent creates — no client counters, no `localStorage`.

## WhatsApp honesty

The WhatsApp button opens a `wa.me` deep link with a pre-filled message and logs it as
`prepared`. We never claim delivery — only the guest's reply confirms it.

## Extending option lists

Transportation types, dress codes and statuses live in three coordinated places:
`lib/types.ts` (union), `lib/utils.ts` (array), and the `CHECK` constraint in
`supabase/migrations/001_schema.sql`. Edit all three to add a value.

## Security notes

- No secrets in the client bundle.
- Passwords hashed with bcrypt; sessions are signed JWTs (`AUTH_SECRET`).
- All writes gated by role helpers; routes protected by middleware.
- DB errors are caught and shown as friendly states — no white-screen.
