# Mistri Now Rewari

On-demand home services marketplace for Rewari, Haryana. Customers book fixed-price
visits from verified plumbers, electricians, AC/RO technicians, appliance repairers
and welders; professionals accept jobs and complete them with OTP-verified start and
end; admins verify workers, reassign jobs and manage the catalogue.

Operated by **Lakshya Yadav Enterprises** · Support **+91 83071 21221** · 7 AM – 9 PM, all days.

---

## Quick start

Requirements: Node.js 20+, pnpm.

```bash
pnpm install
cp .env.example .env.local   # already present in this repo; keep demo mode on
pnpm dev                     # http://localhost:3100
```

No database is needed for the demo. The app runs on a file-backed store at
`.data/demo.json` that is created and seeded on first request.

### Demo sign-in

| Role | How to sign in |
| --- | --- |
| Customer | Phone `9876543210`, OTP `123456` |
| Worker (active) | Phone `9812345672` (Imran, cooling), OTP `123456` |
| Worker (pending) | Phone `9812345675` (Mahesh) — shows the approval holding screen |
| Admin | Email `admin@mistrinow.in`, password `Admin@123` |

Other workers: `9812345671` (Sunil, electrical), `9812345670` (Ramesh, plumbing),
`9812345677` (Sanjay, appliance). The demo OTP is always `123456`.

The demo data includes a live `ON_THE_WAY` booking for Imran with start OTP `4821`
and completion OTP `7390`, plus completed jobs, payouts and a pending approval so
every screen has something meaningful to show. **Admin → Settings → Reset demo data**
rebuilds it from the seed.

> Demo mode is for previews only. It stores data in a local JSON file, uses a signed
> cookie instead of real auth, and must never be deployed as-is.

---

## Routes

| Route | Who | What |
| --- | --- | --- |
| `/` | Public | Marketing home, live job card, service catalogue, page directory |
| `/services` | Public | Full fixed-price catalogue, filters and booking dialog |
| `/how-it-works` | Public | Step-by-step journey, OTP safety and booking FAQs |
| `/why-mistri-now` | Public | Promise, comparison table and neighbourhood reviews |
| `/support` | Public | Support channels, message form and common questions |
| `/auth` | Public | Phone → OTP → role selection / admin email sign-in |
| `/account` | Customer | Profile and booking history |
| `/bookings/[id]` | Customer / worker / admin | Live status, timeline, OTP tickets, bill, cancel, UPI QR |
| `/worker/dashboard` | Worker | Online toggle, open jobs, active jobs, earnings |
| `/admin/dashboard` | Admin | Overview, approvals, orders, services, settings |
| `/privacy`, `/terms`, `/refund` | Public | Policies (plain language, attorney review pending) |

`/contact` permanently redirects to `/support`. The header, mobile menu, footer, 404, error
boundary and loading skeleton are shared.

---

## Production setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migrations **in filename order** (`0001_schema.sql` → `0005_storage_realtime.sql`)
   in the SQL editor. Or print them all into one file:

   ```bash
   pnpm db:print -- --out supabase/combined.sql
   ```

3. In `.env.local` set:

   ```env
   NEXT_PUBLIC_DEMO_MODE=false
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server-only; never commit
   DEMO_SESSION_SECRET=<random 32+ chars>
   NEXT_PUBLIC_SITE_URL=https://your-domain
   ```

4. Seed the catalogue and the admin account:

   ```bash
   ADMIN_PASSWORD='choose-a-strong-password' pnpm seed:supabase
   ```

5. Enable phone auth in Supabase (Authentication → Providers → Phone) and connect an
   SMS provider (Twilio, MSG91, etc.). Supabase sends the OTP; the app does not send
   SMS itself. Email sign-in for admins works out of the box.

### Security model

- Row-level security is enabled on every table. Customers can read only their own
  bookings; workers only see jobs assigned to them or open jobs in their category;
  admins use `is_admin()`.
- All writes go through `SECURITY DEFINER` RPCs (`create_booking`, `worker_accept_booking`,
  `verify_booking_otp`, `admin_reassign_booking`, …). Direct table writes are revoked.
- Booking OTPs live in `booking_otps` and are never exposed to workers — the worker
  app shows the customer's name and address and calls `verify_booking_otp` instead.
- Aadhaar images are uploaded to a **private** storage bucket; only admins can read them.
- The service role key is used only by `scripts/seed-supabase.mjs`; it is absent from
  the client bundle.

---

## Architecture

```
src/
  app/                    Next.js App Router routes (server components)
  components/
    ui/                   Button, Field/Input/Select/Textarea, Modal, Badge, Avatar…
    brand/                Logo
    customer/             Header, footer, marketing, catalogue, booking, account, auth
    worker/               Online toggle, open jobs, job cards
    admin/                Approval cards, reassign dialog, orders table, service manager
    live/                 LiveRefresher (polling in demo, Supabase Realtime in prod)
  lib/
    constants.ts          Brand, categories, services seed, statuses, demo accounts
    types.ts              Shared domain types
    booking.ts            Slot generation, pricing helpers, progress, UPI URI
    validation.ts         Zod schemas
    auth/                 Session helpers + server actions (OTP, onboarding, sign-out)
    actions/              Booking and admin server actions
    data/                 DataAdapter interface + demo and Supabase implementations
    demo/                 Seeded JSON store and helpers
    supabase/             Browser/server clients and row mappers
supabase/migrations/      Schema, functions, RPC actions, RLS, storage + realtime
scripts/                  seed-supabase.mjs, print-schema.mjs, make-og.ps1
```

The UI talks to a single `DataAdapter` (`src/lib/data`). `getData()` returns the demo
adapter when `NEXT_PUBLIC_DEMO_MODE=true` or when no Supabase URL is configured, and
the Supabase adapter otherwise. Server actions validate input with Zod, then call the
adapter/RPC.

### Booking lifecycle

`PENDING → ASSIGNED → ON_THE_WAY → IN_PROGRESS → COMPLETED` (or `CANCELLED`).

- Creating a booking generates **start** and **completion** OTPs.
- The customer shares the start OTP when the professional arrives; it validates the
  move to `IN_PROGRESS`.
- The completion OTP confirms the work and unlocks payment.
- Workers can accept open jobs in their category, or an admin can assign/reassign.
- Every completed job carries a 7-day workmanship warranty.

### Payments

UPI payments use a QR code generated from a UPI URI (`upi://pay?...`). The app records
a payment reference and marks the booking paid; it does **not** integrate a payment
gateway or verify settlement. Cash-after-service is also supported. Add a gateway
(Razorpay/Cashfree) and server-side webhook verification before taking real money.

---

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server on port 3100 |
| `pnpm build` / `pnpm start` | Production build / serve on 3100 |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (flat config, Next core rules) |
| `pnpm test` | Vitest unit tests |
| `pnpm e2e` | Playwright (Microsoft Edge channel) |
| `pnpm seed:supabase` | Create admin user + upsert services in Supabase |
| `pnpm db:print` | Print/emit all migrations as one SQL file |

The OG image can be regenerated with
`powershell -File scripts/make-og.ps1` (writes `public/og.png`, 1200×630).

---

## Testing

- **Unit:** Vitest — slot generation, pricing, validation, OTP helpers.
- **E2E:** Playwright — sign-in, booking, worker acceptance, admin approval. The config
  uses the installed Microsoft Edge channel; run `pnpm dev` first if not using the
  built-in web server.

```bash
pnpm test
pnpm e2e
```

---

## Deployment notes

- Deploy to Vercel (or any Node host). Set the env vars from step 3 above.
- `NEXT_PUBLIC_*` values are embedded at build time — rebuild after changing them.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `DEMO_SESSION_SECRET` to the browser.
- Add the production domain to Supabase Auth → URL configuration.
- Security headers and a 6 MB server-action body limit are configured in `next.config.ts`.
- The demo store writes to `.data/`; serverless filesystems are ephemeral, which is
  another reason demo mode is not for production.

## Known limitations

- Legal pages are good-faith drafts and are marked **attorney review pending**.
- OTP delivery depends on your Supabase SMS provider; there is no SMS fallback in-app.
- No payment gateway or automated refunds yet.
- The 404/error/loading boundaries are generic, not route-specific.
- Demo mode uses a single JSON file with no concurrency control; it is not multi-user safe.
