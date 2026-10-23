-- ============================================================================
-- Mistri Now Rewari — authenticated state changes
-- Every write is an RPC with an explicit authorisation check. Authenticated
-- users have SELECT-only table grants (plus worker availability), so a direct
-- PostgREST update cannot skip OTPs, approvals or payment rules.
-- ============================================================================

create or replace function public.worker_accept_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  v_worker public.profiles%rowtype;
  v_booking public.bookings%rowtype;
  v_category text;
begin
  select * into v_worker from public.profiles where id = uid;
  if not found or v_worker.role <> 'worker' or v_worker.status <> 'ACTIVE' then
    raise exception 'Your worker account is not active yet';
  end if;

  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then
    raise exception 'Job not found';
  end if;
  if v_booking.status <> 'PENDING' or v_booking.worker_id is not null then
    raise exception 'Sorry, this job was just taken by another professional';
  end if;

  select category into v_category from public.services where id = v_booking.service_id;
  if v_worker.service_category is distinct from v_category then
    raise exception 'This job belongs to a different trade';
  end if;

  update public.bookings
     set worker_id = uid, status = 'ASSIGNED'
   where id = p_booking_id;
end;
$$;

create or replace function public.worker_set_on_the_way(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
begin
  update public.bookings
     set status = 'ON_THE_WAY'
   where id = p_booking_id
     and worker_id = uid
     and status = 'ASSIGNED';
  if not found then
    raise exception 'Job is not in the assigned state';
  end if;
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  v_booking public.bookings%rowtype;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found or v_booking.customer_id is distinct from uid then
    raise exception 'Booking not found';
  end if;
  if v_booking.status not in ('PENDING', 'ASSIGNED') then
    raise exception 'This booking can no longer be cancelled. Please call support.';
  end if;

  update public.bookings
     set status = 'CANCELLED',
         cancelled_at = now(),
         cancelled_reason = coalesce(nullif(trim(p_reason), ''), 'Cancelled by customer'),
         payment_status = 'PENDING'
   where id = p_booking_id;
end;
$$;

create or replace function public.mark_booking_paid(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  v_booking public.bookings%rowtype;
begin
  select * into v_booking from public.bookings where id = p_booking_id;
  if not found then
    raise exception 'Booking not found';
  end if;
  if not (public.is_admin() or v_booking.customer_id = uid) then
    raise exception 'Booking not found';
  end if;

  update public.bookings set payment_status = 'PAID' where id = p_booking_id;
end;
$$;

create or replace function public.admin_reassign_booking(p_booking_id uuid, p_worker_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_worker public.profiles%rowtype;
  v_booking public.bookings%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Only admins can reassign bookings';
  end if;

  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then
    raise exception 'Booking not found';
  end if;
  if v_booking.status in ('COMPLETED', 'CANCELLED') then
    raise exception 'Completed or cancelled bookings cannot be reassigned';
  end if;

  select * into v_worker from public.profiles where id = p_worker_id;
  if not found or v_worker.role <> 'worker' or v_worker.status <> 'ACTIVE' then
    raise exception 'Choose an active worker';
  end if;

  update public.bookings
     set worker_id = p_worker_id, status = 'ASSIGNED'
   where id = p_booking_id;
end;
$$;

create or replace function public.add_booking_item(
  p_booking_id uuid,
  p_name text,
  p_quantity integer,
  p_unit_price numeric
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  v_booking public.bookings%rowtype;
  v_item_id uuid;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found or v_booking.worker_id is distinct from uid then
    raise exception 'This job is not assigned to you';
  end if;
  if v_booking.status not in ('ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS') then
    raise exception 'Spare parts can only be added while the job is active';
  end if;
  if p_quantity < 1 or p_quantity > 20 then
    raise exception 'Enter a valid quantity';
  end if;
  if p_unit_price < 1 or p_unit_price > 50000 then
    raise exception 'Enter a valid price';
  end if;
  if char_length(trim(coalesce(p_name, ''))) < 2 then
    raise exception 'Enter the spare part name';
  end if;

  insert into public.booking_items (booking_id, name, quantity, unit_price)
  values (p_booking_id, trim(p_name), p_quantity, p_unit_price)
  returning id into v_item_id;

  return v_item_id;
end;
$$;

create or replace function public.set_worker_online(p_online boolean)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
begin
  update public.profiles
     set is_online = p_online
   where id = uid and role = 'worker' and status = 'ACTIVE';
  if not found then
    raise exception 'Your worker account is not active yet';
  end if;
end;
$$;

-- Function grants ------------------------------------------------------------
revoke all on function public.complete_onboarding(public.user_role, text, text, text, text, boolean, text, text) from public;
revoke all on function public.create_booking(uuid, text, timestamptz, public.payment_method_type, text, jsonb) from public;
revoke all on function public.verify_booking_otp(uuid, text, text) from public;
revoke all on function public.review_worker(uuid, text, text) from public;
revoke all on function public.admin_metrics() from public;
revoke all on function public.admin_daily_series(integer) from public;
revoke all on function public.admin_orders(text, text, integer, integer) from public;
revoke all on function public.worker_accept_booking(uuid) from public;
revoke all on function public.worker_set_on_the_way(uuid) from public;
revoke all on function public.cancel_booking(uuid, text) from public;
revoke all on function public.mark_booking_paid(uuid) from public;
revoke all on function public.admin_reassign_booking(uuid, uuid) from public;
revoke all on function public.add_booking_item(uuid, text, integer, numeric) from public;
revoke all on function public.set_worker_online(boolean) from public;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_active_worker() to authenticated;
grant execute on function public.complete_onboarding(public.user_role, text, text, text, text, boolean, text, text) to authenticated;
grant execute on function public.create_booking(uuid, text, timestamptz, public.payment_method_type, text, jsonb) to authenticated;
grant execute on function public.verify_booking_otp(uuid, text, text) to authenticated;
grant execute on function public.review_worker(uuid, text, text) to authenticated;
grant execute on function public.admin_metrics() to authenticated;
grant execute on function public.admin_daily_series(integer) to authenticated;
grant execute on function public.admin_orders(text, text, integer, integer) to authenticated;
grant execute on function public.worker_accept_booking(uuid) to authenticated;
grant execute on function public.worker_set_on_the_way(uuid) to authenticated;
grant execute on function public.cancel_booking(uuid, text) to authenticated;
grant execute on function public.mark_booking_paid(uuid) to authenticated;
grant execute on function public.admin_reassign_booking(uuid, uuid) to authenticated;
grant execute on function public.add_booking_item(uuid, text, integer, numeric) to authenticated;
grant execute on function public.set_worker_online(boolean) to authenticated;
