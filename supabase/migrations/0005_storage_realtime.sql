-- ============================================================================
-- Mistri Now Rewari — private Aadhaar storage + realtime
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'worker-documents',
  'worker-documents',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "worker docs: upload into own folder" on storage.objects;
create policy "worker docs: upload into own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'worker-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "worker docs: owner or admin can read" on storage.objects;
create policy "worker docs: owner or admin can read"
on storage.objects for select to authenticated
using (
  bucket_id = 'worker-documents'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

drop policy if exists "worker docs: owner can replace" on storage.objects;
create policy "worker docs: owner can replace"
on storage.objects for update to authenticated
using (
  bucket_id = 'worker-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'worker-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Public issue-media bucket (random, unguessable paths). Kept separate from
-- Aadhaar documents, which are private and signed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'booking-media',
  'booking-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "booking media: customers upload into own folder" on storage.objects;
create policy "booking media: customers upload into own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'booking-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Realtime ------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.bookings;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.services;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

alter table public.bookings replica identity full;
alter table public.services replica identity full;
