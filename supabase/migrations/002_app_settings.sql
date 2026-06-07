-- ============================================================================
-- Axora Facilities — app_settings (admin-managed configuration)
-- Added for the admin Settings page (pricing defaults, notification toggles,
-- service areas). Key/value store so new settings need no schema change.
-- ============================================================================

create table public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

alter table public.app_settings enable row level security;

-- Admins manage everything; the values are not exposed to other roles.
create policy "Settings: admin read"
  on public.app_settings for select
  using (public.is_admin());

create policy "Settings: admin manage"
  on public.app_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Default rows.
insert into public.app_settings (key, value) values
  (
    'pricing',
    '{"contractor_payout_percent":48,"service_base_prices":{}}'::jsonb
  ),
  (
    'notifications',
    '{"admin_email":"","email_on_application":true,"email_on_completion":true,"email_on_quote":true}'::jsonb
  ),
  (
    'service_areas',
    '["Atlanta","Conyers","Decatur","Marietta","Smyrna","Sandy Springs","Stockbridge","Norcross","Duluth","Lawrenceville"]'::jsonb
  )
on conflict (key) do nothing;
