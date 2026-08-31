# SAT-7 Production Booking

A modern, production-ready internal platform for managing **TV / Media production bookings** — guests, programs, scheduling, production requirements, transportation, dress code, WhatsApp confirmations, calendar, and activity history.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase** (Postgres, Auth, RLS, Realtime). Deployable to **Vercel** and source-controlled on **GitHub**.

> This is a complete rebuild from the original HTML prototype — new architecture, new design system, new database. The old site was only used as a business/workflow reference.

---

## Features

- **Dashboard** — KPI cards (today, upcoming, pending, confirmed, reschedule, cancelled), live-vs-recorded donut, bookings-by-status & by-channel bars, upcoming productions, recent activity. Live updates via Supabase Realtime.
- **Booking Wizard** — 7-step guided flow: Guest → Program → Schedule → Production Requirements → Transportation → Dress Code → Review. Inline validation, guest/program search, program-default autofill, smart scheduling-conflict detection.
- **Bookings** — search, status / live-recorded / program / channel / guest / date filters, sort, pagination, responsive table↔cards, CSV export.
- **Booking Detail** — overview, guest, program, schedule, production requirements, transportation, dress code, notes, confirmation history, full **activity timeline** (every status change is persisted).
- **Calendar** — month / week / day views with status colors and click-through to bookings.
- **People** — CRUD, search, archive, total-bookings & last-booking stats.
- **Programs** — CRUD with channel link and default production settings auto-applied on booking.
- **Settings** — organization, booking prefix, channels, locations, users (create via Admin API, no invite email), roles & permissions, booking options.
- **WhatsApp** — formatted confirmation message via `wa.me` deep link. Status is logged honestly as `prepared` (we do **not** claim delivery — the guest confirms).
- **Print** — call-sheet print view (`window.print()` with print CSS).
- **Auth & Roles** — Supabase Auth with 4 roles: Administrator, Production Manager, Production User, Viewer. Row-Level Security on every table. Protected routes via middleware.
- **Booking numbers** — generated safely in Postgres (`<PREFIX>-<YYYY>-<NNNNN>`) with a row-locked counter, so they stay unique under concurrent creates.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS (custom dark broadcast theme + light mode) |
| Database | Supabase Postgres |
| Auth | Supabase Auth |
| Security | Row-Level Security + `is_admin`/`is_manager`/`can_write_bookings` helpers |
| Realtime | Supabase Realtime (bookings + activity) |
| Deployment | Vercel (GitHub-connected) |

---

## Project Structure

```
app/
  (auth)/login/        # login page (no chrome)
  (app)/               # authenticated shell (sidebar + topbar)
    dashboard/ bookings/ bookings/[id]/ bookings/new/ calendar/
    people/ programs/ settings/
  api/                 # quick-create + settings route handlers
  auth/signout/        # server sign-out
  layout.tsx globals.css not-found.tsx
components/
  ui/                  # Button, Badge, Modal, Toast, Card, StatCard, Charts, SearchableSelect, Avatar
  layout/AppShell      # sidebar/topbar/theme toggle/mobile nav
  booking/             # BookingWizard, BookingDetailClient, BookingsToolbar
  calendar/CalendarView
  people/ programs/ settings/ realtime/
lib/
  supabase/            # client.ts (browser), server.ts (cookie), admin.ts (service role + fallback), config.ts
  queries.ts           # server data access (RLS-scoped)
  auth.ts              # getCurrentUser / isAdmin
  types.ts utils.ts whatsapp.ts csv.ts
services/              # bookings.ts (create/update/duplicate/status), crud.ts, settings.ts
middleware.ts          # route protection
supabase/
  migrations/001_schema.sql
  migrations/002_functions_rls.sql
  seed.sql
scripts/seed.ts        # Management-API seed runner
```

---

## 1. Install

```bash
git clone <your-repo-url> bookingleb
cd bookingleb
npm install
```

Requires Node 18.18+ (Node 20+ recommended).

## 2. Configure Supabase

1. Create a project at https://supabase.com.
2. Run the migrations in the Supabase SQL editor (or via the CLI) in order:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_functions_rls.sql`
3. (Optional) Seed demo data: `supabase/seed.sql`.

### Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Set:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOURPROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY   # server only
```

> The anon key is public by design (RLS enforces access). The service-role key is **never** shipped to the browser. `lib/supabase/admin.ts` falls back to the RLS cookie client when the service key is absent, so the app still works for logged-in users even without it.

## 3. Run locally

```bash
npm run dev      # http://localhost:3000
```

Open `/login`. With no users yet, create the first one from **Settings → Users** (Administrator) — or sign up through the Auth flow and promote via SQL:

```sql
update public.profiles set role = 'Administrator' where email = 'you@domain.org';
```

## 4. Run migrations

Either paste both `supabase/migrations/*.sql` files into the Supabase SQL editor, or (if you have the CLI + a DB connection) use `supabase db push`. The app also works with the Supabase Management API for the seed:

```bash
SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... npm run seed
```

## 5. Create the first administrator

1. Sign up the first account via the app (or create it in **Settings → Users** — this uses the Admin API and generates a temporary password, no invite email sent).
2. In the Supabase SQL editor:
   ```sql
   update public.profiles set role = 'Administrator' where email = 'you@domain.org';
   ```

## 6. Configure environment variables (Vercel)

In Vercel → Project → Settings → Environment Variables, add the three `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` values.

## 7. Deploy to Vercel

```bash
git push origin main
```

Then in Vercel: **New Project → Import Git repository → bookingleb → Deploy.** The standard Next.js build (`next build`) is used — no custom server required.

## 8. Connect GitHub to Vercel

In Vercel: **Project → Git → Connect Repository**, choose your GitHub repo. Every push to `main` triggers a production deploy.

---

## Booking number safety

`generate_booking_number()` (in `002_functions_rls.sql`) locks the yearly counter row and increments it atomically, and a `before insert` trigger fills `booking_number` when omitted. This guarantees uniqueness even when multiple users create bookings at the same time — no client-side counters, no `localStorage`.

## WhatsApp honesty

The WhatsApp button opens a `wa.me` deep link with a pre-filled, formatted message and logs it as `prepared`. We never claim the message was delivered — only the guest's reply confirms it. The `lib/whatsapp.ts` builder is structured so a real WhatsApp Business API integration can replace the deep link later without UI changes.

## Extending option lists

Transportation types, dress codes and statuses are defined in **three coordinated places**:
1. `lib/types.ts` — the TypeScript union.
2. `lib/utils.ts` — the array feeding selects/UI.
3. `supabase/migrations/002_functions_rls.sql` — the `CHECK` constraint.

To add a value, edit all three and re-run the migration.

## Security notes

- Every table has RLS. Reads are authenticated-only; writes are scoped by role helpers.
- No secrets in the client bundle (`grep` the build for `SUPABASE_SERVICE_ROLE_KEY` → none).
- Errors are caught and shown as friendly toasts; input is preserved on failure.
