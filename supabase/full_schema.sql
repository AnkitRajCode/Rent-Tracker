-- ============================================================
-- RentTracker — FULL DATABASE SETUP (Fresh Install)
-- Run this single file in Supabase SQL Editor to set up
-- everything from scratch.
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================


-- ─────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────
create extension if not exists "pgcrypto";


-- ─────────────────────────────────────────
-- 1. PROFILES (linked to Supabase auth.users)
-- ─────────────────────────────────────────
create table if not exists profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text unique not null,
  full_name   text,
  phone       text,
  created_at  timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Owner: view own profile" on profiles;
create policy "Owner: view own profile"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Owner: update own profile" on profiles;
create policy "Owner: update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create profile row after owner sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─────────────────────────────────────────
-- 2. PROPERTIES
-- ─────────────────────────────────────────
create table if not exists properties (
  id           uuid default gen_random_uuid() primary key,
  owner_id     uuid references profiles(id) on delete cascade not null,
  name         text not null,
  house_no     text,
  address_line text,
  city         text,
  state        text,
  pin_code     text,
  landmark     text,
  created_at   timestamptz default now()
);

alter table properties enable row level security;

drop policy if exists "Owner: full access to own properties" on properties;
create policy "Owner: full access to own properties"
  on properties for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);


-- ─────────────────────────────────────────
-- 3. HOUSES / UNITS
-- ─────────────────────────────────────────
create table if not exists houses (
  id               uuid default gen_random_uuid() primary key,
  property_id      uuid references properties(id) on delete cascade not null,
  owner_id         uuid references profiles(id) not null,
  house_number     text not null,
  floor            text,
  type             text,
  rent_amount      numeric(10,2) not null default 0,
  security_deposit numeric(10,2) default 0,
  status           text default 'vacant'
                     check (status in ('occupied', 'vacant')),
  created_at       timestamptz default now()
);

alter table houses enable row level security;

drop policy if exists "Owner: full access to own houses" on houses;
create policy "Owner: full access to own houses"
  on houses for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);


-- ─────────────────────────────────────────
-- 4. TENANTS (current)
-- ─────────────────────────────────────────
create table if not exists tenants (
  id                       uuid default gen_random_uuid() primary key,
  house_id                 uuid references houses(id) on delete cascade not null,
  owner_id                 uuid references profiles(id) not null,
  name                     text not null,
  phone                    text not null,
  aadhaar                  text,
  move_in_date             date not null,
  rent_due_day             integer default 5
                             check (rent_due_day between 1 and 31),
  email                    text,
  can_login                boolean default false,
  agreement_url            text,
  deposit_refund_amount    numeric(10,2),
  deposit_refund_published boolean default false,
  created_at               timestamptz default now()
);

alter table tenants enable row level security;

drop policy if exists "Owner: full access to own tenants" on tenants;
create policy "Owner: full access to own tenants"
  on tenants for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Tenant portal: tenant can view their own row
drop policy if exists "Tenant portal: view own tenancy" on tenants;
create policy "Tenant portal: view own tenancy"
  on tenants for select
  using (
    can_login = true
    and email = auth.email()
  );


-- ─────────────────────────────────────────
-- 5. TENANT MEMBERS
-- ─────────────────────────────────────────
create table if not exists tenant_members (
  id              uuid default gen_random_uuid() primary key,
  tenant_id       uuid references tenants(id) on delete cascade not null,
  owner_id        uuid references profiles(id) not null,
  name            text not null,
  phone           text,
  email           text,
  aadhaar_number  text,
  aadhaar_doc_url text,
  is_primary      boolean default false,
  created_at      timestamptz default now()
);

alter table tenant_members enable row level security;

drop policy if exists "Owner: full access to own tenant members" on tenant_members;
create policy "Owner: full access to own tenant members"
  on tenant_members for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Tenant portal: tenant can view their household members
drop policy if exists "Tenant portal: view own members" on tenant_members;
create policy "Tenant portal: view own members"
  on tenant_members for select
  using (
    tenant_id in (
      select id from tenants
      where can_login = true
        and email = auth.email()
    )
  );


-- ─────────────────────────────────────────
-- 6. TENANT HISTORY (vacated tenants)
-- ─────────────────────────────────────────
create table if not exists tenant_history (
  id             uuid default gen_random_uuid() primary key,
  house_id       uuid references houses(id) not null,
  owner_id       uuid references profiles(id) not null,
  name           text not null,
  phone          text not null,
  aadhaar        text,
  move_in_date   date not null,
  move_out_date  date,
  created_at     timestamptz default now()
);

alter table tenant_history enable row level security;

drop policy if exists "Owner: full access to own tenant history" on tenant_history;
create policy "Owner: full access to own tenant history"
  on tenant_history for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);


-- ─────────────────────────────────────────
-- 7. RENT RECORDS
-- ─────────────────────────────────────────
create table if not exists rent_records (
  id            uuid default gen_random_uuid() primary key,
  house_id      uuid references houses(id) on delete cascade not null,
  tenant_id     uuid references tenants(id) not null,
  owner_id      uuid references profiles(id) not null,
  month         integer not null check (month between 1 and 12),
  year          integer not null,
  amount_due    numeric(10,2) not null,
  amount_paid   numeric(10,2) default 0,
  status        text default 'pending'
                  check (status in ('paid', 'pending', 'partial')),
  payment_mode  text
                  check (payment_mode in ('cash', 'upi', 'bank_transfer')),
  paid_on       date,
  notes         text,
  created_at    timestamptz default now(),
  unique (house_id, month, year)
);

alter table rent_records enable row level security;

drop policy if exists "Owner: full access to own rent records" on rent_records;
create policy "Owner: full access to own rent records"
  on rent_records for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Tenant portal: tenant can view their own rent records
drop policy if exists "Tenant portal: view own rent records" on rent_records;
create policy "Tenant portal: view own rent records"
  on rent_records for select
  using (
    tenant_id in (
      select id from tenants
      where can_login = true
        and email = auth.email()
    )
  );


-- ─────────────────────────────────────────
-- 8. DOCUMENTS
-- ─────────────────────────────────────────
create table if not exists documents (
  id         uuid default gen_random_uuid() primary key,
  owner_id   uuid references profiles(id) not null,
  house_id   uuid references houses(id),
  tenant_id  uuid references tenants(id),
  name       text not null,
  url        text not null,
  is_public  boolean default false,
  created_at timestamptz default now()
);

alter table documents enable row level security;

drop policy if exists "Owner: full access to own documents" on documents;
create policy "Owner: full access to own documents"
  on documents for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);


-- ─────────────────────────────────────────
-- TRIGGER: auto-update house status on tenant add/remove
-- ─────────────────────────────────────────
create or replace function sync_house_status()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update houses set status = 'occupied' where id = NEW.house_id;
  elsif (TG_OP = 'DELETE') then
    update houses set status = 'vacant'
    where id = OLD.house_id
      and not exists (select 1 from tenants where house_id = OLD.house_id);
  end if;
  return null;
end;
$$;

drop trigger if exists on_tenant_change on tenants;
create trigger on_tenant_change
  after insert or delete on tenants
  for each row execute procedure sync_house_status();


-- ─────────────────────────────────────────
-- TENANT PORTAL RLS on houses & properties
-- (houses/properties are owner-only by default;
--  these extra policies let tenants read their own)
-- ─────────────────────────────────────────
drop policy if exists "Tenant portal: view own house" on houses;
create policy "Tenant portal: view own house"
  on houses for select
  using (
    id in (
      select house_id from tenants
      where can_login = true
        and email = auth.email()
    )
  );

drop policy if exists "Tenant portal: view own property" on properties;
create policy "Tenant portal: view own property"
  on properties for select
  using (
    id in (
      select h.property_id from houses h
      join tenants t on t.house_id = h.id
      where t.can_login = true
        and t.email = auth.email()
    )
  );


-- ─────────────────────────────────────────
-- DONE
-- After running this script:
--   1. Sign up as owner at /login
--   2. Go to Supabase Dashboard > Storage > Create bucket "documents" (public)
-- ─────────────────────────────────────────

-- ─────────────────────────────────────────
-- BACKFILL: sync existing auth.users → profiles
-- Needed when re-running this script on a project that already has
-- auth users (the trigger only fires for new sign-ups).
-- Safe to run multiple times.
-- ─────────────────────────────────────────
insert into public.profiles (id, email)
select id, email
from auth.users
on conflict (id) do nothing;
