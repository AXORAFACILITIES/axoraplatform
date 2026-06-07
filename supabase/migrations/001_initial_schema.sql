-- ============================================================================
-- Axora Facilities — initial schema (canonical)
-- Tables, enums, helper functions, triggers, and row-level security.
--
-- Apply via the Supabase SQL editor, or with the CLI:
--   supabase db push        (after `supabase link`)
-- ============================================================================

-- gen_random_uuid() is in core Postgres 13+; no extension needed on Supabase.

-- ============================================================================
-- Enums
-- ============================================================================
create type public.user_role as enum ('admin', 'contractor', 'client');
create type public.application_status as enum ('pending', 'approved', 'rejected', 'on_hold');
create type public.client_type as enum ('residential', 'str_host', 'commercial', 'property_manager');
create type public.property_type as enum ('house', 'apartment', 'condo', 'commercial', 'airbnb', 'multi_unit');
create type public.service_type as enum ('standard', 'deep', 'str_turnover', 'move_in_out', 'commercial', 'post_construction');
create type public.job_status as enum ('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed');
create type public.invoice_status as enum ('not_sent', 'sent', 'paid', 'overdue', 'disputed');
create type public.assignment_status as enum ('offered', 'accepted', 'declined', 'completed', 'removed');
create type public.payout_status as enum ('pending', 'processing', 'paid');
create type public.quote_status as enum ('new', 'contacted', 'quoted', 'booked', 'lost');

-- ============================================================================
-- Generic updated_at trigger (applied to profiles and jobs)
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- profiles — one row per auth user
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'client',
  first_name text,
  last_name text,
  email text unique,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- New-user trigger: create a profile when an auth user is created.
-- SECURITY: self-signup can only ever become 'client' or 'contractor', never
-- 'admin'. The role column is also REVOKE'd from app users (see grants below),
-- so privileged roles are assigned by an admin via the service-role key only.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested text := new.raw_user_meta_data ->> 'role';
  resolved public.user_role := 'client';
begin
  if requested in ('contractor', 'client') then
    resolved := requested::public.user_role;
  end if;

  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    resolved
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin check (SECURITY DEFINER to avoid recursive RLS on profiles)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ============================================================================
-- contractor_applications — raw onboarding submissions, reviewed by admin
-- ============================================================================
create table public.contractor_applications (
  id uuid primary key default gen_random_uuid(),
  status public.application_status not null default 'pending',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id),
  rejection_reason text,
  -- Personal info
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  date_of_birth text,
  street_address text,
  city text,
  state text,
  zip_code text,
  referral_source text,
  -- Emergency contact
  ec_name text,
  ec_relationship text,
  ec_phone text,
  -- Experience
  services_offered text[] not null default '{}',
  years_experience text,
  has_team boolean,
  team_size integer,
  owns_business boolean,
  has_own_supplies boolean,
  -- Availability
  available_days text[] not null default '{}',
  earliest_start_time time,
  latest_end_time time,
  accepts_short_notice text,
  service_areas text[] not null default '{}',
  has_transportation text,
  -- Background
  work_authorized boolean,
  has_drivers_license boolean,
  felony_conviction boolean,
  felony_explanation text,
  bg_check_consent boolean,
  has_own_insurance boolean,
  -- References
  ref1_name text,
  ref1_relationship text,
  ref1_phone text,
  ref2_name text,
  ref2_relationship text,
  ref2_phone text,
  -- Agreement
  digital_signature text,
  signed_at timestamptz,
  additional_notes text,
  -- Profile link (set when approved and account created)
  profile_id uuid references public.profiles (id)
);

create index contractor_applications_status_idx on public.contractor_applications (status);
create index contractor_applications_email_idx on public.contractor_applications (email);

-- ============================================================================
-- contractors — active roster (approved applications)
-- ============================================================================
create table public.contractors (
  id uuid primary key references public.profiles (id) on delete cascade,
  application_id uuid references public.contractor_applications (id),
  services_offered text[] not null default '{}',
  service_areas text[] not null default '{}',
  available_days text[] not null default '{}',
  accepts_short_notice boolean,
  has_team boolean,
  team_size integer,
  has_own_supplies boolean,
  total_jobs_completed integer not null default 0,
  total_earnings numeric(10, 2) not null default 0,
  rating numeric(3, 2),
  is_active boolean not null default true,
  joined_at timestamptz not null default now()
);

create index contractors_is_active_idx on public.contractors (is_active);

-- ============================================================================
-- clients
-- ============================================================================
create table public.clients (
  id uuid primary key references public.profiles (id) on delete cascade,
  client_type public.client_type not null default 'residential',
  company_name text,
  billing_address text,
  preferred_contact_method text not null default 'email',
  notes text,
  is_recurring boolean not null default false,
  recurring_frequency text,
  total_jobs integer not null default 0,
  total_spent numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- service_locations — properties to be cleaned
-- ============================================================================
create table public.service_locations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  nickname text,
  street_address text,
  city text,
  state text,
  zip_code text,
  property_type public.property_type not null default 'house',
  bedrooms integer,
  bathrooms numeric(3, 1),
  square_footage integer,
  access_instructions text,
  special_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index service_locations_client_id_idx on public.service_locations (client_id);

-- ============================================================================
-- jobs
-- ============================================================================
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  job_number text unique,
  client_id uuid references public.clients (id),
  location_id uuid references public.service_locations (id),
  service_type public.service_type not null,
  status public.job_status not null default 'pending',
  scheduled_date date,
  scheduled_time time,
  estimated_duration_hours numeric(4, 2),
  actual_start_time timestamptz,
  actual_end_time timestamptz,
  -- Financials (contractor_payout / axora_margin auto-calculated by trigger)
  client_price numeric(10, 2),
  contractor_payout numeric(10, 2),
  axora_margin numeric(10, 2),
  add_ons jsonb,
  add_ons_total numeric(10, 2) not null default 0,
  total_client_price numeric(10, 2),
  -- Invoice tracking
  invoice_status public.invoice_status not null default 'not_sent',
  invoice_sent_at timestamptz,
  invoice_paid_at timestamptz,
  relay_invoice_id text,
  -- Details
  special_instructions text,
  is_rush boolean not null default false,
  rush_fee numeric(10, 2) not null default 0,
  checklist_type text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index jobs_client_id_idx on public.jobs (client_id);
create index jobs_status_idx on public.jobs (status);
create index jobs_scheduled_date_idx on public.jobs (scheduled_date);
create index jobs_invoice_status_idx on public.jobs (invoice_status);

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- Auto-generate a human-readable job number: AXF-YYYY-NNNN.
-- Advisory lock per-year keeps concurrent inserts from colliding.
create or replace function public.set_job_number()
returns trigger
language plpgsql
as $$
declare
  yr text := to_char(now(), 'YYYY');
  seq integer;
begin
  if new.job_number is not null then
    return new;
  end if;
  perform pg_advisory_xact_lock(hashtext('axora_job_number_' || yr));
  select count(*) + 1 into seq
    from public.jobs
    where job_number like 'AXF-' || yr || '-%';
  new.job_number := 'AXF-' || yr || '-' || lpad(seq::text, 4, '0');
  return new;
end;
$$;

create trigger jobs_set_job_number
  before insert on public.jobs
  for each row execute function public.set_job_number();

-- Auto-calculate the 48/52 split and the total client price.
create or replace function public.calc_job_financials()
returns trigger
language plpgsql
as $$
begin
  if new.client_price is not null then
    new.contractor_payout := round(new.client_price * 0.48, 2);
    new.axora_margin := round(new.client_price * 0.52, 2);
  end if;
  new.total_client_price :=
    coalesce(new.client_price, 0) + coalesce(new.add_ons_total, 0);
  return new;
end;
$$;

create trigger jobs_calc_financials
  before insert or update on public.jobs
  for each row execute function public.calc_job_financials();

-- ============================================================================
-- job_assignments — links jobs to contractors (a job may have several)
-- ============================================================================
create table public.job_assignments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  contractor_id uuid not null references public.contractors (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.profiles (id),
  status public.assignment_status not null default 'offered',
  accepted_at timestamptz,
  completed_at timestamptz,
  payout_amount numeric(10, 2),
  payout_status public.payout_status not null default 'pending',
  payout_sent_at timestamptz,
  contractor_notes text,
  unique (job_id, contractor_id)
);

create index job_assignments_job_id_idx on public.job_assignments (job_id);
create index job_assignments_contractor_id_idx on public.job_assignments (contractor_id);
create index job_assignments_status_idx on public.job_assignments (status);

-- When an assignment is marked paid, roll up the contractor's lifetime totals.
create or replace function public.update_contractor_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.payout_status = 'paid'
     and old.payout_status is distinct from 'paid' then
    update public.contractors
      set total_jobs_completed = total_jobs_completed + 1,
          total_earnings = total_earnings + coalesce(new.payout_amount, 0)
      where id = new.contractor_id;
  end if;
  return new;
end;
$$;

create trigger job_assignments_update_totals
  after update on public.job_assignments
  for each row execute function public.update_contractor_totals();

-- ============================================================================
-- job_completions — submitted by the contractor at end of job
-- ============================================================================
create table public.job_completions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.jobs (id) on delete cascade,
  assignment_id uuid references public.job_assignments (id),
  submitted_by uuid references public.profiles (id),
  submitted_at timestamptz not null default now(),
  before_photos text[] not null default '{}',
  after_photos text[] not null default '{}',
  completion_notes text,
  damage_reported boolean not null default false,
  damage_description text,
  damage_photos text[],
  checklist_completed jsonb,
  client_rating integer check (client_rating between 1 and 5),
  admin_notes text
);

create index job_completions_assignment_id_idx on public.job_completions (assignment_id);

-- ============================================================================
-- quote_requests — inbound leads from the marketing website
-- ============================================================================
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  status public.quote_status not null default 'new',
  source text,
  name text not null,
  email text not null,
  phone text not null,
  service_type text,
  property_address text,
  property_type text,
  bedrooms text,
  bathrooms text,
  preferred_date text,
  message text,
  admin_notes text,
  quoted_price numeric(10, 2),
  quoted_at timestamptz,
  converted_to_job_id uuid references public.jobs (id),
  created_at timestamptz not null default now()
);

create index quote_requests_status_idx on public.quote_requests (status);

-- ============================================================================
-- notifications
-- ============================================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  job_id uuid references public.jobs (id) on delete set null,
  created_at timestamptz not null default now()
);

create index notifications_recipient_id_idx on public.notifications (recipient_id);
create index notifications_is_read_idx on public.notifications (recipient_id, is_read);

-- ============================================================================
-- Column grants: app users may edit their own profile, but NOT the role or
-- is_active columns (prevents privilege escalation via the client SDK).
-- ============================================================================
revoke update on public.profiles from anon, authenticated;
grant update (first_name, last_name, phone, email, avatar_url, updated_at)
  on public.profiles to authenticated;

-- ============================================================================
-- Row-level security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.contractor_applications enable row level security;
alter table public.contractors enable row level security;
alter table public.clients enable row level security;
alter table public.service_locations enable row level security;
alter table public.jobs enable row level security;
alter table public.job_assignments enable row level security;
alter table public.job_completions enable row level security;
alter table public.quote_requests enable row level security;
alter table public.notifications enable row level security;

-- ---- profiles -------------------------------------------------------------
create policy "Profiles: read own or admin"
  on public.profiles for select
  using (id = (select auth.uid()) or public.is_admin());

create policy "Profiles: update own"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Profiles: admin manage"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- contractor_applications (anon may submit; admin reviews) -------------
create policy "Applications: anyone can submit"
  on public.contractor_applications for insert
  to anon, authenticated
  with check (true);

create policy "Applications: admin read"
  on public.contractor_applications for select
  using (public.is_admin());

create policy "Applications: admin update"
  on public.contractor_applications for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---- contractors ----------------------------------------------------------
create policy "Contractors: read own or admin"
  on public.contractors for select
  using (id = (select auth.uid()) or public.is_admin());

create policy "Contractors: update own"
  on public.contractors for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Contractors: admin manage"
  on public.contractors for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- clients --------------------------------------------------------------
create policy "Clients: read own or admin"
  on public.clients for select
  using (id = (select auth.uid()) or public.is_admin());

create policy "Clients: admin manage"
  on public.clients for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- service_locations ----------------------------------------------------
create policy "Locations: client manage own"
  on public.service_locations for all
  using (client_id = (select auth.uid()))
  with check (client_id = (select auth.uid()));

create policy "Locations: admin read"
  on public.service_locations for select
  using (public.is_admin());

-- ---- jobs -----------------------------------------------------------------
create policy "Jobs: scoped read"
  on public.jobs for select
  using (
    public.is_admin()
    or client_id = (select auth.uid())
    or exists (
      select 1 from public.job_assignments ja
      where ja.job_id = jobs.id
        and ja.contractor_id = (select auth.uid())
    )
  );

create policy "Jobs: admin manage"
  on public.jobs for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- job_assignments ------------------------------------------------------
create policy "Assignments: contractor read own or admin"
  on public.job_assignments for select
  using (contractor_id = (select auth.uid()) or public.is_admin());

create policy "Assignments: contractor update own"
  on public.job_assignments for update
  using (contractor_id = (select auth.uid()))
  with check (contractor_id = (select auth.uid()));

create policy "Assignments: admin manage"
  on public.job_assignments for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- job_completions ------------------------------------------------------
create policy "Completions: read own or admin"
  on public.job_completions for select
  using (submitted_by = (select auth.uid()) or public.is_admin());

create policy "Completions: contractor submit for own assignment"
  on public.job_completions for insert
  with check (
    exists (
      select 1 from public.job_assignments ja
      where ja.id = assignment_id
        and ja.contractor_id = (select auth.uid())
    )
  );

create policy "Completions: admin manage"
  on public.job_completions for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- quote_requests (anon may submit; admin manages) ----------------------
create policy "Quotes: anyone can submit"
  on public.quote_requests for insert
  to anon, authenticated
  with check (true);

create policy "Quotes: admin read"
  on public.quote_requests for select
  using (public.is_admin());

create policy "Quotes: admin update"
  on public.quote_requests for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---- notifications --------------------------------------------------------
create policy "Notifications: read own or admin"
  on public.notifications for select
  using (recipient_id = (select auth.uid()) or public.is_admin());

create policy "Notifications: recipient mark read"
  on public.notifications for update
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

create policy "Notifications: admin manage"
  on public.notifications for all
  using (public.is_admin())
  with check (public.is_admin());
