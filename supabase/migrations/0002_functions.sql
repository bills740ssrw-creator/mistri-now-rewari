-- ============================================================================
-- Mistri Now Rewari — RPCs, helpers & triggers
-- All privileged writes go through SECURITY DEFINER functions so the browser
-- never needs a service-role key and RLS cannot be bypassed with a crafted
-- PostgREST call.
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'ACTIVE'
  );
$$;

create or replace function public.is_active_worker()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'worker' and status = 'ACTIVE'
  );
$$;

-- ---------------------------------------------------------------------------
-- Onboarding: profile + Aadhaar paths in one transaction
-- ---------------------------------------------------------------------------
create or replace function public.complete_onboarding(
  p_role public.user_role,
  p_full_name text,
  p_phone text,
  p_email text,
  p_category text,
  p_terms boolean,
  p_front_path text,
  p_back_path text
)
returns public.profiles
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  v_phone text;
  v_existing public.profiles%rowtype;
  v_created public.profiles%rowtype;
begin
  if uid is null then
    raise exception 'Please verify your mobile number again';
  end if;

  select * into v_existing from public.profiles where id = uid;
  if found then
    return v_existing;
  end if;

  if p_role not in ('customer', 'worker') then
    raise exception 'Only customer or worker accounts can be created here';
  end if;
  if coalesce(trim(p_full_name), '') = '' then
    raise exception 'Please enter your full name';
  end if;
  if p_terms is not true then
    raise exception 'Please accept the terms of service';
  end if;

  v_phone := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_phone := right(v_phone, 10);
  if v_phone !~ '^[6-9][0-9]{9}$' then
    raise exception 'Enter a valid 10-digit Indian mobile number';
  end if;

  if p_role = 'worker' then
    if coalesce(trim(p_category), '') = '' then
      raise exception 'Please choose your trade';
    end if;
    if p_category not in ('plumbing', 'electrical', 'appliance', 'cooling', 'fabrication') then
      raise exception 'Unknown trade category';
    end if;
    if coalesce(p_front_path, '') = '' or coalesce(p_back_path, '') = '' then
      raise exception 'Please upload both sides of your Aadhaar';
    end if;
    if p_front_path not like uid::text || '/%' or p_back_path not like uid::text || '/%' then
      raise exception 'Invalid document upload path';
    end if;
  end if;

  insert into public.profiles (
    id, phone, email, full_name, role, status, service_category, terms_accepted_at
  )
  values (
    uid,
    '+91' || v_phone,
    nullif(lower(trim(coalesce(p_email, ''))), ''),
    trim(p_full_name),
    p_role,
    case when p_role = 'worker' then 'PENDING_APPROVAL'::public.account_status else 'ACTIVE'::public.account_status end,
    case when p_role = 'worker' then p_category else null end,
    now()
  )
  returning * into v_created;

  if p_role = 'worker' then
    insert into public.worker_documents (worker_id, aadhaar_front_url, aadhaar_back_url)
    values (uid, p_front_path, p_back_path);
  end if;

  return v_created;
exception
  when unique_violation then
    raise exception 'This mobile number is already registered. Please log in instead.';
end;
$$;

-- ---------------------------------------------------------------------------
-- Booking creation (atomic booking + OTPs). Re-validates everything.
-- ---------------------------------------------------------------------------
create or replace function public.create_booking(
  p_service_id uuid,
  p_address text,
  p_scheduled_time timestamptz,
  p_payment_method public.payment_method_type,
  p_notes text,
  p_issue_media jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_service public.services%rowtype;
  v_booking_id uuid;
  v_hour integer;
begin
  if uid is null then
    raise exception 'Please sign in to book a service';
  end if;

  select * into v_profile from public.profiles where id = uid;
  if not found or v_profile.role <> 'customer' or v_profile.status <> 'ACTIVE' then
    raise exception 'Only active customer accounts can create bookings';
  end if;

  if char_length(trim(coalesce(p_address, ''))) < 10 then
    raise exception 'Add your full address with a landmark';
  end if;

  if p_scheduled_time is null then
    raise exception 'Choose a time slot';
  end if;
  if p_scheduled_time < now() - interval '15 minutes' then
    raise exception 'That time slot has already passed';
  end if;
  if p_scheduled_time > now() + interval '15 days' then
    raise exception 'Bookings open for the next 14 days';
  end if;

  v_hour := extract(hour from (p_scheduled_time at time zone 'Asia/Kolkata'));
  if v_hour < 7 or v_hour > 20 then
    raise exception 'Slots are available between 7 AM and 9 PM';
  end if;

  select * into v_service from public.services where id = p_service_id and is_active;
  if not found then
    raise exception 'This service is not available right now';
  end if;

  if p_issue_media is not null and jsonb_typeof(p_issue_media) <> 'array' then
    raise exception 'Invalid attachment payload';
  end if;

  insert into public.bookings (
    customer_id, service_id, status, address, base_amount, total_amount,
    scheduled_time, notes, payment_method, issue_media
  )
  values (
    uid, p_service_id, 'PENDING', trim(p_address), v_service.price, v_service.price,
    p_scheduled_time, nullif(trim(coalesce(p_notes, '')), ''), p_payment_method,
    coalesce(p_issue_media, '[]'::jsonb)
  )
  returning id into v_booking_id;

  insert into public.booking_otps (booking_id, start_otp, end_otp)
  values (
    v_booking_id,
    lpad((floor(random() * 9000) + 1000)::int::text, 4, '0'),
    lpad((floor(random() * 9000) + 1000)::int::text, 4, '0')
  );

  return v_booking_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- OTP verification + status transition. The only way a worker can move a job
-- into IN_PROGRESS / COMPLETED, so the OTP cannot be skipped by a direct update.
-- ---------------------------------------------------------------------------
create or replace function public.verify_booking_otp(
  p_booking_id uuid,
  p_kind text,
  p_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  v_booking public.bookings%rowtype;
  v_expected text;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'Please sign in again');
  end if;

  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Booking not found');
  end if;

  if v_booking.worker_id is distinct from uid then
    return jsonb_build_object('ok', false, 'error', 'This job is not assigned to you');
  end if;

  if p_kind = 'start' then
    if v_booking.status not in ('ASSIGNED', 'ON_THE_WAY') then
      return jsonb_build_object('ok', false, 'error', 'This job cannot be started yet');
    end if;
    select start_otp into v_expected from public.booking_otps where booking_id = p_booking_id;
    if v_expected is null or v_expected <> trim(coalesce(p_code, '')) then
      return jsonb_build_object('ok', false, 'error', 'Incorrect start OTP. Ask the customer to read it again.');
    end if;
    update public.bookings set status = 'IN_PROGRESS' where id = p_booking_id;
    return jsonb_build_object('ok', true);

  elsif p_kind = 'end' then
    if v_booking.status <> 'IN_PROGRESS' then
      return jsonb_build_object('ok', false, 'error', 'Start the job before completing it');
    end if;
    select end_otp into v_expected from public.booking_otps where booking_id = p_booking_id;
    if v_expected is null or v_expected <> trim(coalesce(p_code, '')) then
      return jsonb_build_object('ok', false, 'error', 'Incorrect completion OTP. Ask the customer to read it again.');
    end if;
    update public.bookings
       set status = 'COMPLETED', completed_at = now(), payment_status = 'PAID'
     where id = p_booking_id;
    update public.profiles
       set jobs_completed = jobs_completed + 1
     where id = uid;
    return jsonb_build_object('ok', true);

  else
    return jsonb_build_object('ok', false, 'error', 'Unknown verification step');
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin: approve / reject a worker
-- ---------------------------------------------------------------------------
create or replace function public.review_worker(
  p_worker_id uuid,
  p_decision text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can review workers';
  end if;
  if p_decision not in ('APPROVE', 'REJECT') then
    raise exception 'Invalid review decision';
  end if;

  if p_decision = 'APPROVE' then
    update public.profiles
       set status = 'ACTIVE'
     where id = p_worker_id and role = 'worker';
    update public.worker_documents
       set verification_status = 'APPROVED', rejection_reason = null
     where worker_id = p_worker_id;
  else
    update public.profiles
       set status = 'SUSPENDED', is_online = false
     where id = p_worker_id and role = 'worker';
    update public.worker_documents
       set verification_status = 'REJECTED', rejection_reason = coalesce(p_reason, 'Documents could not be verified')
     where worker_id = p_worker_id;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Keep bookings.total_amount in sync with spare parts
-- ---------------------------------------------------------------------------
create or replace function public.recalculate_booking_total()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_booking_id uuid;
begin
  v_booking_id := coalesce(new.booking_id, old.booking_id);
  update public.bookings b
     set total_amount = b.base_amount + coalesce((
       select sum(i.quantity * i.unit_price)
       from public.booking_items i
       where i.booking_id = v_booking_id
     ), 0)
   where b.id = v_booking_id;
  return null;
end;
$$;

drop trigger if exists booking_items_total_trigger on public.booking_items;
create trigger booking_items_total_trigger
after insert or update or delete on public.booking_items
for each row execute function public.recalculate_booking_total();

-- ---------------------------------------------------------------------------
-- Admin analytics (aggregated in Postgres, not shipped to the browser)
-- ---------------------------------------------------------------------------
create or replace function public.admin_metrics()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_month_start date := date_trunc('month', now() at time zone 'Asia/Kolkata')::date;
  v_completed bigint;
  v_cancelled bigint;
begin
  if not public.is_admin() then
    raise exception 'Only admins can view platform metrics';
  end if;

  select count(*) into v_completed from public.bookings where status = 'COMPLETED';
  select count(*) into v_cancelled from public.bookings where status = 'CANCELLED';

  return jsonb_build_object(
    'revenue_today', coalesce((select sum(total_amount) from public.bookings
      where status = 'COMPLETED' and (completed_at at time zone 'Asia/Kolkata')::date = v_today), 0),
    'revenue_month', coalesce((select sum(total_amount) from public.bookings
      where status = 'COMPLETED' and (completed_at at time zone 'Asia/Kolkata')::date >= v_month_start), 0),
    'revenue_lifetime', coalesce((select sum(total_amount) from public.bookings
      where status = 'COMPLETED'), 0),
    'active_bookings', (select count(*) from public.bookings where status not in ('COMPLETED', 'CANCELLED')),
    'total_bookings', (select count(*) from public.bookings),
    'completed_bookings', v_completed,
    'registered_workers', (select count(*) from public.profiles where role = 'worker'),
    'active_workers', (select count(*) from public.profiles where role = 'worker' and status = 'ACTIVE'),
    'online_workers', (select count(*) from public.profiles where role = 'worker' and status = 'ACTIVE' and is_online),
    'pending_approvals', (select count(*) from public.profiles where role = 'worker' and status = 'PENDING_APPROVAL'),
    'customers', (select count(*) from public.profiles where role = 'customer'),
    'average_ticket', coalesce((select avg(total_amount) from public.bookings where status = 'COMPLETED'), 0),
    'completion_rate', case when (v_completed + v_cancelled) = 0 then 0
      else round((v_completed::numeric / (v_completed + v_cancelled)) * 100, 1) end,
    'status_breakdown', (
      select coalesce(jsonb_object_agg(status::text, count), '{}'::jsonb)
      from (select status, count(*) from public.bookings group by status) s
    )
  );
end;
$$;

create or replace function public.admin_daily_series(p_days integer default 14)
returns table (day date, orders bigint, revenue numeric)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can view platform metrics';
  end if;

  return query
  select
    d::date as day,
    (select count(*) from public.bookings b
      where (b.created_at at time zone 'Asia/Kolkata')::date = d::date) as orders,
    coalesce((select sum(b.total_amount) from public.bookings b
      where b.status = 'COMPLETED'
        and (b.completed_at at time zone 'Asia/Kolkata')::date = d::date), 0) as revenue
  from generate_series(
    (now() at time zone 'Asia/Kolkata')::date - (greatest(p_days, 1) - 1),
    (now() at time zone 'Asia/Kolkata')::date,
    interval '1 day'
  ) as d;
end;
$$;

create or replace function public.admin_orders(
  p_status text default null,
  p_q text default null,
  p_limit integer default 10,
  p_offset integer default 0
)
returns table (id uuid, total_count bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can view orders';
  end if;

  return query
  with filtered as (
    select b.id, b.created_at, count(*) over () as total_count
    from public.bookings b
    join public.services s on s.id = b.service_id
    left join public.profiles c on c.id = b.customer_id
    left join public.profiles w on w.id = b.worker_id
    where (coalesce(p_status, '') = '' or p_status = 'ALL' or b.status::text = p_status)
      and (
        coalesce(trim(p_q), '') = ''
        or b.code ilike '%' || p_q || '%'
        or b.address ilike '%' || p_q || '%'
        or s.title ilike '%' || p_q || '%'
        or c.full_name ilike '%' || p_q || '%'
        or c.phone ilike '%' || p_q || '%'
        or w.full_name ilike '%' || p_q || '%'
      )
  )
  select f.id, f.total_count
  from filtered f
  order by f.created_at desc
  limit greatest(least(p_limit, 50), 1)
  offset greatest(p_offset, 0);
end;
$$;
