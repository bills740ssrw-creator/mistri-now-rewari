-- ============================================================================
-- Mistri Now Rewari — Row Level Security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_items enable row level security;
alter table public.booking_otps enable row level security;
alter table public.worker_documents enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles: view own, admins, active workers and counterparties" on public.profiles;
create policy "profiles: view own, admins, active workers and counterparties"
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or public.is_admin()
  or (role = 'worker' and status = 'ACTIVE')
  or exists (
    select 1 from public.bookings b
    where (b.customer_id = auth.uid() and b.worker_id = profiles.id)
       or (b.worker_id = auth.uid() and b.customer_id = profiles.id)
  )
);

drop policy if exists "profiles: worker can update own availability" on public.profiles;
create policy "profiles: worker can update own availability"
on public.profiles for update to authenticated
using (id = auth.uid() and role = 'worker' and status = 'ACTIVE')
with check (id = auth.uid());

-- services ------------------------------------------------------------------
drop policy if exists "services: public can view active" on public.services;
create policy "services: public can view active"
on public.services for select to anon, authenticated
using (is_active = true);

drop policy if exists "services: admins can view all" on public.services;
create policy "services: admins can view all"
on public.services for select to authenticated
using (public.is_admin());

drop policy if exists "services: admins can insert" on public.services;
create policy "services: admins can insert"
on public.services for insert to authenticated
with check (public.is_admin());

drop policy if exists "services: admins can update" on public.services;
create policy "services: admins can update"
on public.services for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "services: admins can delete" on public.services;
create policy "services: admins can delete"
on public.services for delete to authenticated
using (public.is_admin());

-- bookings ------------------------------------------------------------------
drop policy if exists "bookings: visible to owner, assigned worker, admins and job-hunting workers" on public.bookings;
create policy "bookings: visible to owner, assigned worker, admins and job-hunting workers"
on public.bookings for select to authenticated
using (
  customer_id = auth.uid()
  or worker_id = auth.uid()
  or public.is_admin()
  or (status = 'PENDING' and worker_id is null and public.is_active_worker())
);

-- booking items -------------------------------------------------------------
drop policy if exists "booking items: visible with the booking" on public.booking_items;
create policy "booking items: visible with the booking"
on public.booking_items for select to authenticated
using (
  exists (
    select 1 from public.bookings b
    where b.id = booking_items.booking_id
      and (b.customer_id = auth.uid() or b.worker_id = auth.uid() or public.is_admin())
  )
);

-- booking OTPs: customer + admin only. Workers use verify_booking_otp().
drop policy if exists "booking otps: customer and admin only" on public.booking_otps;
create policy "booking otps: customer and admin only"
on public.booking_otps for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.bookings b
    where b.id = booking_otps.booking_id and b.customer_id = auth.uid()
  )
);

-- worker documents ----------------------------------------------------------
drop policy if exists "worker documents: owner and admins" on public.worker_documents;
create policy "worker documents: owner and admins"
on public.worker_documents for select to authenticated
using (worker_id = auth.uid() or public.is_admin());

-- Table grants: least privilege ---------------------------------------------
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (is_online) on public.profiles to authenticated;

revoke all on public.bookings from anon, authenticated;
grant select on public.bookings to authenticated;

revoke all on public.booking_items from anon, authenticated;
grant select on public.booking_items to authenticated;

revoke all on public.booking_otps from anon, authenticated;
grant select on public.booking_otps to authenticated;

revoke all on public.worker_documents from anon, authenticated;
grant select on public.worker_documents to authenticated;

revoke all on public.services from anon, authenticated;
grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
