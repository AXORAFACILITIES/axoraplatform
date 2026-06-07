# Axora Facilities — Deployment & Environment Setup

This guide takes the platform from code to production on Netlify + Supabase +
Resend. There are **two Netlify sites**:

1. **Marketing site** — the existing static site in `~/axora-facilities`
   (`axorafacilities.com`). It now includes the `submit-quote` serverless
   function (see Prompt 8).
2. **Portal** — this Next.js app (`~/axora-platform`), deployed to a subdomain
   such as **`portal.axorafacilities.com`**.

---

## 1. `netlify.toml` (portal)

Already committed at the repo root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
```

- `@netlify/plugin-nextjs` handles SSR, route handlers, middleware, and image
  optimization — no extra config needed.
- Node 20 matches the dev toolchain; the plugin also supports Node 18+.
- In the Netlify dashboard, create a **new site** from this repo/folder. The
  `netlify.toml` settings override the dashboard build settings.

---

## 2. Environment variables

### Portal site (`axora-platform`)

| Variable | Where to get it | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API | **Secret.** Used by service-role server code (onboarding insert, approve→create auth user, cross-user notifications). Never exposed to the browser. |
| `RESEND_API_KEY` | Resend → API Keys | Secret. Transactional emails. |
| `NEXT_PUBLIC_SITE_URL` | e.g. `https://portal.axorafacilities.com` | Used in email links + password-reset redirect. |
| `ADMIN_NOTIFICATION_EMAIL` | your inbox | Where new-application alerts go. |

### Marketing site (`axora-facilities`) — for the `submit-quote` function

| Variable | Notes |
| --- | --- |
| `SUPABASE_URL` | same project URL (note: **not** the `NEXT_PUBLIC_` prefix here) |
| `SUPABASE_SERVICE_ROLE_KEY` | secret |
| `RESEND_API_KEY` | secret |
| `ADMIN_EMAIL` | where new-quote alerts go |

Set these under **Site configuration → Environment variables** on each site.

---

## 3. Supabase production setup

### a. Apply the schema (SQL editor, in order)

1. `supabase/migrations/001_initial_schema.sql` — tables, enums, triggers, RLS.
2. `supabase/migrations/002_app_settings.sql` — admin settings table.
3. `supabase/migrations/003_storage.sql` — `job-photos` bucket + policies.

(Or `supabase db push` for 001/002 after `supabase link`; run 003 in the editor
since it touches the `storage` schema.)

### b. Auth

- **Authentication → Providers → Email**: enable. Email/password is the login
  method.
- **Authentication → Providers**: consider **disabling open sign-ups** — all
  accounts are provisioned by an admin (contractors via approval). New signups
  default to the `client` role and can never self-assign `admin`.
- **Authentication → URL Configuration**:
  - **Site URL**: `https://portal.axorafacilities.com`
  - **Redirect URLs** (allow-list): add
    - `https://portal.axorafacilities.com/auth/callback`
    - `https://portal.axorafacilities.com/auth/update-password`
    - `http://localhost:3002/auth/callback` and `/auth/update-password` (dev)
- **SMTP**: password-reset and any magic-link emails are sent by *Supabase's*
  auth system, not Resend. Configure **Project Settings → Auth → SMTP** with a
  real provider (you can use Resend's SMTP credentials) so reset emails deliver
  reliably in production. The Supabase default sender is rate-limited and for
  testing only.

### c. RLS

RLS is enabled on every table by the migrations. Spot-check under
**Database → Policies** that each table shows "RLS enabled".

### d. Storage

`003_storage.sql` creates the **`job-photos`** bucket (public read) with:
- contractors can upload/read only within `job-photos/{job_id}/…` for jobs
  assigned to them;
- admins can read/delete everything.

The worker Completion modal uploads here, then stores public URLs on
`job_completions`.

---

## 4. Resend domain verification

1. Resend → **Domains → Add Domain** → `axorafacilities.com`.
2. Add the provided **SPF**, **DKIM**, and (optional) **DMARC** DNS records at
   your DNS host. Wait for **Verified**.
3. Confirm the `from` addresses used by the app are on the verified domain:
   - portal: `onboarding@axorafacilities.com` (`lib/email.tsx`)
   - quote function: `quotes@axorafacilities.com` (`submit-quote.js`)
   Adjust either to match what you verify.

---

## 5. Create the first admin

There is no public admin signup. Create the user, then promote:

1. Supabase → **Authentication → Users → Add user** (email + password,
   "Auto Confirm" on). This fires the `handle_new_user` trigger, creating a
   `profiles` row with role `client`.
2. Run in the SQL editor (privileged, bypasses the role column grant):

```sql
update public.profiles set role = 'admin'
where email = 'you@axorafacilities.com';
```

3. (Optional, for clean middleware routing) mirror the role into user metadata:

```sql
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb
where email = 'you@axorafacilities.com';
```

Sign in at `/auth/login` → you land on `/admin`.

---

## 6. DNS for the subdomain

In Netlify (portal site) → **Domain management → Add a domain** →
`portal.axorafacilities.com`. At your DNS host add the record Netlify shows
(typically a **CNAME** `portal` → `<your-site>.netlify.app`). Netlify
provisions HTTPS automatically.

---

## 7. Pre-deployment checklist

- [ ] Portal env vars set in Netlify (all 6).
- [ ] Marketing-site function env vars set (4).
- [ ] Migrations 001 + 002 + 003 applied.
- [ ] Supabase Site URL + redirect URLs configured.
- [ ] Supabase SMTP configured (for password resets).
- [ ] Email signups disabled (optional but recommended).
- [ ] Resend domain verified; `from` addresses match.
- [ ] First admin created and promoted.
- [ ] `job-photos` bucket exists with policies.
- [ ] Subdomain DNS + HTTPS active.

---

## 8. Post-launch smoke test

- [ ] **Onboarding**: submit `/onboarding` end-to-end → success screen; row in
      `contractor_applications`; applicant + admin emails arrive.
- [ ] **Quote bridge**: submit a quote on the marketing site → row in
      `quote_requests`; admin email arrives.
- [ ] **Admin login** → `/admin` loads with KPIs.
- [ ] **Approve** a test application → contractor auth user created, approval
      email sent; contractor appears on the roster.
- [ ] **Contractor login** (via forgot-password to set a password) → `/worker`
      loads.
- [ ] **Client login** → `/client` loads.
- [ ] **Create + assign a job** in admin → contractor sees the offer, can
      accept, and submit a completion with photo upload.
- [ ] **Password reset** flow delivers an email and updates the password.

---

## 9. Ongoing maintenance

- **Supabase free tier**: ~500 MB DB, 1 GB storage, 50k MAU. Watch DB size
  (job/photo metadata is small; the photos themselves count against the 1 GB
  storage). Upgrade to Pro when storage or MAU approaches the cap, or before a
  marketing push.
- **Adding a service type**: it's a Postgres enum —
  `alter type public.service_type add value 'new_value';` then add a label in
  `lib/labels.ts`, a checklist in `lib/checklists.ts`, and (optionally) an
  onboarding option.
- **Backups**: enable Supabase **daily backups** (Pro) or schedule periodic
  `pg_dump` exports. Storage files aren't in DB backups — back the bucket up
  separately if photos are critical.
- **Payout %**: the DB trigger hard-codes the 48/52 split; the admin Settings
  value is an admin-side preview only. To make it dynamic, update
  `calc_job_financials()` to read `app_settings`.
- **Secrets**: rotate the service-role and Resend keys periodically; they live
  only in Netlify env vars, never in the repo.
