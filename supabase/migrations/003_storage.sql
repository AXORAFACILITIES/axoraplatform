-- ============================================================================
-- Axora Facilities — Storage: job-photos bucket + policies
--
-- Run this in the Supabase SQL editor (it touches the `storage` schema, which
-- the CLI also applies). Creates a public-read bucket for job completion
-- photos and locks writes to the assigned contractor / admins.
-- ============================================================================

-- Public bucket → anyone with the file URL can read (getPublicUrl). Writes are
-- gated by the policies below.
insert into storage.buckets (id, name, public)
values ('job-photos', 'job-photos', true)
on conflict (id) do nothing;

-- Contractors may upload only into the folder of a job assigned to them:
--   job-photos/{job_id}/{before|after|damage}/{filename}
create policy "Contractors upload to their assigned job folders"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'job-photos'
    and exists (
      select 1 from public.job_assignments ja
      where ja.contractor_id = (select auth.uid())
        and ja.job_id = ((storage.foldername(name))[1])::uuid
    )
  );

-- Contractors may read/replace files in their own assigned job folders.
create policy "Contractors read their assigned job folders"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'job-photos'
    and exists (
      select 1 from public.job_assignments ja
      where ja.contractor_id = (select auth.uid())
        and ja.job_id = ((storage.foldername(name))[1])::uuid
    )
  );

-- Admins can do anything with job photos.
create policy "Admins manage all job photos"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'job-photos' and public.is_admin())
  with check (bucket_id = 'job-photos' and public.is_admin());
