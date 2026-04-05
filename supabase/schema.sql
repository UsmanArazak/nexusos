-- ─────────────────────────────────────────────────────────────────────────────
-- NexusOS — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL editor to initialise the database.
-- Every table has a school_id foreign key to enforce multi-tenant isolation.
-- Row Level Security (RLS) policies are defined at the bottom.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Schools ─────────────────────────────────────────────────────────────────

create table public.schools (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  slug                text not null unique,
  logo_url            text,
  address             text,
  phone               text,
  email               text,
  website_enabled     boolean not null default false,
  subscription_status text not null default 'trial'
                        check (subscription_status in ('active', 'trial', 'expired')),
  created_at          timestamptz not null default now()
);

-- ─── Users / Profiles ────────────────────────────────────────────────────────

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  school_id   uuid references public.schools(id) on delete cascade,
  role        text not null
                check (role in ('super_admin','school_admin','teacher','staff','student','parent')),
  first_name  text,
  last_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ─── Classes ─────────────────────────────────────────────────────────────────

create table public.classes (
  id          uuid primary key default uuid_generate_v4(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  name        text not null,
  level       text,
  created_at  timestamptz not null default now()
);

-- ─── Subjects ────────────────────────────────────────────────────────────────

create table public.subjects (
  id          uuid primary key default uuid_generate_v4(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  name        text not null,
  code        text,
  created_at  timestamptz not null default now()
);

-- ─── Students ────────────────────────────────────────────────────────────────

create table public.students (
  id                uuid primary key default uuid_generate_v4(),
  school_id         uuid not null references public.schools(id) on delete cascade,
  user_id           uuid references public.profiles(id) on delete set null,
  admission_number  text not null,
  class_id          uuid references public.classes(id) on delete set null,
  first_name        text not null,
  last_name         text not null,
  date_of_birth     date,
  gender            text check (gender in ('male','female','other')),
  avatar_url        text,
  created_at        timestamptz not null default now(),
  unique (school_id, admission_number)
);

-- ─── Staff ───────────────────────────────────────────────────────────────────

create table public.staff (
  id               uuid primary key default uuid_generate_v4(),
  school_id        uuid not null references public.schools(id) on delete cascade,
  user_id          uuid references public.profiles(id) on delete set null,
  employee_number  text not null,
  first_name       text not null,
  last_name        text not null,
  role             text not null check (role in ('teacher','staff')),
  department       text,
  avatar_url       text,
  created_at       timestamptz not null default now(),
  unique (school_id, employee_number)
);

-- ─── Results ─────────────────────────────────────────────────────────────────

create table public.results (
  id          uuid primary key default uuid_generate_v4(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  student_id  uuid not null references public.students(id) on delete cascade,
  subject_id  uuid not null references public.subjects(id) on delete cascade,
  class_id    uuid not null references public.classes(id) on delete cascade,
  term        text not null,
  session     text not null,
  score       numeric(5,2) not null,
  grade       text,
  remarks     text,
  created_at  timestamptz not null default now()
);

-- ─── Attendance ───────────────────────────────────────────────────────────────

create table public.attendance (
  id          uuid primary key default uuid_generate_v4(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  student_id  uuid not null references public.students(id) on delete cascade,
  class_id    uuid not null references public.classes(id) on delete cascade,
  date        date not null,
  status      text not null check (status in ('present','absent','late','excused')),
  created_at  timestamptz not null default now(),
  unique (school_id, student_id, date)
);

-- ─── Fee Structures ───────────────────────────────────────────────────────────

create table public.fee_structures (
  id          uuid primary key default uuid_generate_v4(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  name        text not null,
  amount      numeric(12,2) not null,
  term        text not null,
  session     text not null,
  class_id    uuid references public.classes(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─── Payments ─────────────────────────────────────────────────────────────────

create table public.payments (
  id                  uuid primary key default uuid_generate_v4(),
  school_id           uuid not null references public.schools(id) on delete cascade,
  student_id          uuid not null references public.students(id) on delete cascade,
  fee_structure_id    uuid not null references public.fee_structures(id) on delete cascade,
  amount_paid         numeric(12,2) not null,
  paystack_reference  text not null unique,
  status              text not null default 'pending'
                        check (status in ('pending','success','failed')),
  paid_at             timestamptz,
  created_at          timestamptz not null default now()
);

-- ─── Events ───────────────────────────────────────────────────────────────────

create table public.events (
  id          uuid primary key default uuid_generate_v4(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  title       text not null,
  description text,
  start_date  timestamptz not null,
  end_date    timestamptz,
  created_at  timestamptz not null default now()
);

-- ─── Messages ─────────────────────────────────────────────────────────────────

create table public.messages (
  id            uuid primary key default uuid_generate_v4(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  sender_id     uuid not null references public.profiles(id) on delete cascade,
  recipient_id  uuid references public.profiles(id) on delete set null,
  subject       text not null,
  body          text not null,
  is_broadcast  boolean not null default false,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

-- ═════════════════════════════════════════════════════════════════════════════
-- Row Level Security Policies
-- Each policy ensures users can only access data belonging to their school.
-- ═════════════════════════════════════════════════════════════════════════════

-- Helper function: return the calling user's school_id from their profile
create or replace function public.my_school_id()
returns uuid language sql stable
as $$
  select school_id from public.profiles where id = auth.uid();
$$;

-- Enable RLS on all tables
alter table public.schools         enable row level security;
alter table public.profiles        enable row level security;
alter table public.classes         enable row level security;
alter table public.subjects        enable row level security;
alter table public.students        enable row level security;
alter table public.staff           enable row level security;
alter table public.results         enable row level security;
alter table public.attendance      enable row level security;
alter table public.fee_structures  enable row level security;
alter table public.payments        enable row level security;
alter table public.events          enable row level security;
alter table public.messages        enable row level security;

-- ── schools: only allow read of own school ───────────────────────────────────
create policy "schools: read own" on public.schools
  for select using (id = public.my_school_id());

-- ── profiles: scoped to school ───────────────────────────────────────────────
create policy "profiles: read own school" on public.profiles
  for select using (school_id = public.my_school_id() or id = auth.uid());

create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid());

-- ── Generic school-scoped select policy for remaining tables ─────────────────
-- (Apply same pattern for each table)

create policy "classes: school scope" on public.classes
  for all using (school_id = public.my_school_id());

create policy "subjects: school scope" on public.subjects
  for all using (school_id = public.my_school_id());

create policy "students: school scope" on public.students
  for all using (school_id = public.my_school_id());

create policy "staff: school scope" on public.staff
  for all using (school_id = public.my_school_id());

create policy "results: school scope" on public.results
  for all using (school_id = public.my_school_id());

create policy "attendance: school scope" on public.attendance
  for all using (school_id = public.my_school_id());

create policy "fee_structures: school scope" on public.fee_structures
  for all using (school_id = public.my_school_id());

create policy "payments: school scope" on public.payments
  for all using (school_id = public.my_school_id());

create policy "events: school scope" on public.events
  for all using (school_id = public.my_school_id());

create policy "messages: school scope" on public.messages
  for all using (school_id = public.my_school_id());
