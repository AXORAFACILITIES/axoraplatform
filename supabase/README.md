# Supabase — Axora Facilities

Database schema and row-level security for the platform.

## Files

| File | Purpose |
| --- | --- |
| `migrations/001_initial_schema.sql` | All tables, enums, triggers, helper functions, and RLS policies. |
| `migrations/002_app_settings.sql` | Admin-managed `app_settings` key/value table (pricing, notifications, service areas). |
| `migrations/003_storage.sql` | `job-photos` Storage bucket + upload/read policies (run in the SQL editor). |

See **`../DEPLOYMENT.md`** for the full production setup (auth URLs, SMTP,
Resend, first admin, env vars, smoke tests).

## Applying the schema

### Option A — Supabase SQL editor (quickest)

1. Open your project → **SQL Editor**.
2. Paste the contents of `migrations/001_initial_schema.sql`, run it.

### Option B — Supabase CLI

```bash
supabase link --project-ref <your-project-ref>
supabase db push          # applies migrations/
```

After applying, regenerate the TypeScript types so the app stays in sync:

```bash
supabase gen types typescript --project-id <id> > lib/types/database.types.ts
```

(`lib/types/database.types.ts` already contains a hand-written copy matching this
migration, so the app type-checks before you ever connect to Supabase.)

## Tables

`profiles`, `contractor_applications`, `contractors`, `clients`,
`service_locations`, `jobs`, `job_assignments`, `job_completions`,
`quote_requests`, `notifications`.

```
auth.users ─1:1─ profiles ─┬─1:1─ contractors ─< job_assignments >─ jobs ─< job_completions
                           └─1:1─ clients ─< service_locations         │
                                     └──────────────< jobs >───────────┘
contractor_applications (public intake)      quote_requests (public intake)
notifications (per recipient)
```

### Business logic baked into the schema (triggers)

- **`job_number`** auto-generates as `AXF-YYYY-NNNN` on insert (advisory-locked
  per year to avoid collisions).
- **48 / 52 split**: when `client_price` is set, `contractor_payout` =
  `client_price × 0.48` and `axora_margin` = `client_price × 0.52`;
  `total_client_price` = `client_price + add_ons_total`.
- **Contractor rollups**: when a `job_assignment` flips to `payout_status='paid'`,
  the contractor's `total_jobs_completed` and `total_earnings` increment.
- **`updated_at`** auto-maintained on `profiles` and `jobs`.

## Roles & security model (read this)

The authoritative role lives in **`profiles.role`** (`admin | contractor | client`).
All RLS policies derive authorization from it via the SECURITY DEFINER helper
`is_admin()`. Because `contractors.id`, `clients.id`, and `profiles.id` all equal
the auth user id, ownership checks compare directly against `auth.uid()`.

Hardening built into the migration:

- **No self-escalation.** The `role` (and `is_active`) columns are `REVOKE`d from
  app users, so the client SDK cannot change a role. The `handle_new_user`
  trigger only ever assigns `client` or `contractor` on signup — never `admin`.
- **Public intake is insert-only.** `contractor_applications` and
  `quote_requests` allow anonymous INSERT (form submissions) but only admins can
  read or update them. The `/api/onboarding` route additionally inserts with the
  service-role key.

### Creating the first admin

Sign up a user normally (or create one in **Authentication → Users**), then run
this in the SQL editor — it runs as a privileged role, so it bypasses the column
grant:

```sql
update public.profiles set role = 'admin' where email = 'you@axorafacilities.com';
```

### Note on the middleware

`middleware.ts` reads `user_metadata.role` for **routing only** (which portal to
send someone to). That metadata is technically user-editable, but it is not a
security boundary — RLS (backed by `profiles.role`) is. For belt-and-suspenders
routing you can add a
[Custom Access Token hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)
that copies `profiles.role` into a JWT claim and switch the middleware to read it.
