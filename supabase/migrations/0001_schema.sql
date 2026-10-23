-- ============================================================================
-- Mistri Now Rewari — core schema
-- Run in the Supabase SQL editor (or `supabase db push`).
-- ============================================================================

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('customer', 'worker', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_status as enum ('ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum ('PENDING', 'ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.verification_status as enum ('PENDING', 'APPROVED', 'REJECTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method_type as enum ('UPI', 'COD');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status_type as enum ('PENDING', 'PAID');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text unique,
  email text,
  full_name text not null check (char_length(trim(full_name)) between 2 and 60),
  role public.user_role not null default 'customer',
  status public.account_status not null default 'ACTIVE',
  service_category text,
  is_online boolean not null default false,
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  jobs_completed integer not null default 0 check (jobs_completed >= 0),
  avatar_url text,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_status_idx on public.profiles (role, status);
create index if not exists profiles_phone_idx on public.profiles (phone);

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 2 and 60),
  price numeric(10, 2) not null check (price > 0),
  description text not null,
  category text not null check (category in ('plumbing', 'electrical', 'appliance', 'cooling', 'fabrication')),
  badge text,
  icon text not null default 'wrench',
  duration_mins integer not null default 60 check (duration_mins between 15 and 480),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists services_title_unique_idx on public.services (lower(title));
create index if not exists services_active_idx on public.services (is_active);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default (
    'MRW-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  ),
  customer_id uuid not null,
  worker_id uuid,
  service_id uuid not null,
  status public.booking_status not null default 'PENDING',
  address text not null check (char_length(trim(address)) >= 10),
  base_amount numeric(10, 2) not null check (base_amount >= 0),
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  scheduled_time timestamptz not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_reason text,
  notes text,
  issue_media jsonb not null default '[]'::jsonb,
  payment_method public.payment_method_type not null default 'COD',
  payment_status public.payment_status_type not null default 'PENDING',
  constraint bookings_customer_id_fkey foreign key (customer_id)
    references public.profiles (id) on delete restrict,
  constraint bookings_worker_id_fkey foreign key (worker_id)
    references public.profiles (id) on delete set null,
  constraint bookings_service_id_fkey foreign key (service_id)
    references public.services (id) on delete restrict
);

create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_customer_idx on public.bookings (customer_id, created_at desc);
create index if not exists bookings_worker_idx on public.bookings (worker_id, status);
create index if not exists bookings_created_idx on public.bookings (created_at desc);
create index if not exists bookings_pending_idx on public.bookings (status, worker_id) where status = 'PENDING';

-- ---------------------------------------------------------------------------
-- booking_items (spare parts added by the technician)
-- ---------------------------------------------------------------------------
create table if not exists public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 80),
  quantity integer not null default 1 check (quantity between 1 and 20),
  unit_price numeric(10, 2) not null check (unit_price > 0),
  created_at timestamptz not null default now()
);

create index if not exists booking_items_booking_idx on public.booking_items (booking_id);

-- ---------------------------------------------------------------------------
-- booking_otps — kept out of the bookings table so technicians can never read
-- the codes through the API. Only the customer + admin can select; the
-- verification RPC is the only way a worker can validate a code.
-- ---------------------------------------------------------------------------
create table if not exists public.booking_otps (
  booking_id uuid primary key references public.bookings (id) on delete cascade,
  start_otp text not null,
  end_otp text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- worker_documents
-- ---------------------------------------------------------------------------
create table if not exists public.worker_documents (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null unique references public.profiles (id) on delete cascade,
  aadhaar_front_url text not null,
  aadhaar_back_url text not null,
  verification_status public.verification_status not null default 'PENDING',
  rejection_reason text,
  created_at timestamptz not null default now()
);

create index if not exists worker_documents_status_idx on public.worker_documents (verification_status);
