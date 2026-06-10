-- Berlitz Operations Platform
-- Initial Core Schema
-- Phase: Database Schema Foundation

create extension if not exists "pgcrypto";

-- =========================================================
-- Utility
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- Roles & Profiles
-- =========================================================

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  can_create_enrollment boolean not null default false,
  can_manage_program_catalog boolean not null default false,
  can_approve_requests boolean not null default false,
  can_override_tbo boolean not null default false,
  can_manage_documents boolean not null default false,
  can_import_eped boolean not null default false,
  can_view_sales_reports boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_roles_updated_at
before update on public.roles
for each row
execute function public.set_updated_at();

insert into public.roles (
  name,
  description,
  can_create_enrollment,
  can_manage_program_catalog,
  can_approve_requests,
  can_override_tbo,
  can_manage_documents,
  can_import_eped,
  can_view_sales_reports
)
values
  (
    'advisor',
    'Enrollment Advisor. Can create enrollments and requests.',
    true, false, false, false, false, false, true
  ),
  (
    'manager',
    'Manager. Can approve requests and view team reports.',
    true, false, true, true, true, false, true
  ),
  (
    'customer_service',
    'Customer Service / Operations. Can work cases, checklists and imports.',
    true, false, false, false, true, true, true
  ),
  (
    'admin',
    'System administrator. Full configuration and override access.',
    true, true, true, true, true, true, true
  )
on conflict (name) do nothing;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid references public.roles(id),
  full_name text not null,
  email text not null unique,
  initials text,
  department text,
  active boolean not null default true,
  digital_signature_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- =========================================================
-- Program Catalog
-- =========================================================

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,
  category text not null check (
    category in (
      'adult',
      'kids',
      'summer',
      'private',
      'private_intensive',
      'semi_private',
      'cyberteacher',
      'flex',
      'testing',
      'corporate',
      'other'
    )
  ),
  language text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, category, language)
);

create trigger set_programs_updated_at
before update on public.programs
for each row
execute function public.set_updated_at();

create table if not exists public.program_packages (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  package_name text not null,
  package_code text,
  modality text not null check (
    modality in ('f2f', 'online', 'blo', 'self_study', 'testing', 'hybrid', 'other')
  ),
  level_range text,
  lesson_type text,
  number_of_lessons numeric(10,2),
  default_lesson_rate numeric(10,2),
  default_capacity_min integer,
  default_capacity_max integer,
  default_duration_weeks integer,
  default_completion_weeks integer,
  requires_tbo boolean not null default false,
  requires_private_case boolean not null default false,
  requires_main_enrollment_pdf boolean not null default true,
  requires_payment_authorization_if_plan boolean not null default true,
  requires_intensive_annex boolean not null default false,
  counts_toward_sales_default boolean not null default true,
  counts_toward_quorum_default boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_program_packages_updated_at
before update on public.program_packages
for each row
execute function public.set_updated_at();

create index if not exists idx_program_packages_program_id
on public.program_packages(program_id);

create index if not exists idx_program_packages_modality
on public.program_packages(modality);

create table if not exists public.program_prices (
  id uuid primary key default gen_random_uuid(),
  program_package_id uuid not null references public.program_packages(id) on delete cascade,
  effective_date date not null,
  expiration_date date,
  tuition numeric(10,2) not null default 0,
  registration_fee numeric(10,2) not null default 0,
  material_fee numeric(10,2) not null default 0,
  sales_tax_rate numeric(6,4) not null default 0,
  total_tax numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_program_prices_updated_at
before update on public.program_prices
for each row
execute function public.set_updated_at();

create index if not exists idx_program_prices_program_package_id
on public.program_prices(program_package_id);

create table if not exists public.payment_plan_options (
  id uuid primary key default gen_random_uuid(),
  program_package_id uuid not null references public.program_packages(id) on delete cascade,
  plan_name text not null,
  frequency_type text not null check (
    frequency_type in (
      'full_paid',
      'every_2_weeks',
      'every_4_weeks',
      'monthly',
      'by_level',
      'custom'
    )
  ),
  number_of_payments integer,
  requires_authorization boolean not null default false,
  requires_manager_approval boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_payment_plan_options_updated_at
before update on public.payment_plan_options
for each row
execute function public.set_updated_at();

create index if not exists idx_payment_plan_options_program_package_id
on public.payment_plan_options(program_package_id);


-- =========================================================
-- Students & Enrollments
-- =========================================================

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  customer_id text not null unique,
  customer_id_last5 text not null check (customer_id_last5 ~ '^[0-9]{5}$'),
  first_name text not null,
  last_name text not null,
  full_name text generated always as (
    trim(first_name || ' ' || last_name)
  ) stored,
  email text,
  phone_day text,
  phone_mobile text,
  phone_evening text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  postal_code text,
  country text default 'Puerto Rico',
  date_of_birth date,
  company_name text,
  corporate_number text,
  created_by_user_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_students_updated_at
before update on public.students
for each row
execute function public.set_updated_at();

create index if not exists idx_students_customer_id
on public.students(customer_id);

create index if not exists idx_students_full_name
on public.students(full_name);

create index if not exists idx_students_email
on public.students(email);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  advisor_user_id uuid references public.profiles(id),
  created_by_user_id uuid references public.profiles(id),
  customer_id text not null,
  contract_id text,
  enrollment_date date not null default current_date,
  agreement_date date not null default current_date,
  contract_start_date date,
  contract_expiration_date date,
  tentative_start_date date,
  updated_start_date date,
  confirmed_start_date date,
  program_package_id uuid references public.program_packages(id),
  modality text not null check (
    modality in ('f2f', 'online', 'blo', 'self_study', 'testing', 'hybrid', 'other')
  ),
  enrollment_type text not null check (
    enrollment_type in (
      'group',
      'private',
      'private_intensive',
      'semi_private',
      'kids',
      'summer',
      'cyberteacher',
      'flex',
      'testing',
      'corporate',
      'other'
    )
  ),
  language text,
  level text,
  lesson_type text,
  contract_lessons numeric(10,2),
  lesson_rate numeric(10,2),
  group_or_private text,
  status text not null default 'draft' check (
    status in (
      'draft',
      'active',
      'assigned_to_tbo',
      'private_case_created',
      'pending_review',
      'checklist',
      'started',
      'tbd',
      'cancelled',
      'refunded',
      'completed'
    )
  ),
  counts_toward_sales boolean not null default true,
  counts_toward_quorum boolean not null default true,
  is_complimentary boolean not null default false,
  needs_review boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint enrollments_customer_id_matches_student
    foreign key (customer_id)
    references public.students(customer_id)
);

create trigger set_enrollments_updated_at
before update on public.enrollments
for each row
execute function public.set_updated_at();

create index if not exists idx_enrollments_student_id
on public.enrollments(student_id);

create index if not exists idx_enrollments_advisor_user_id
on public.enrollments(advisor_user_id);

create index if not exists idx_enrollments_enrollment_date
on public.enrollments(enrollment_date);

create index if not exists idx_enrollments_status
on public.enrollments(status);

create index if not exists idx_enrollments_program_package_id
on public.enrollments(program_package_id);

-- =========================================================
-- Payment Plans
-- =========================================================

create table if not exists public.enrollment_payment_plans (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  plan_type text not null check (
    plan_type in (
      'full_paid',
      'every_2_weeks',
      'every_4_weeks',
      'monthly',
      'by_level',
      'custom'
    )
  ),
  total_amount numeric(10,2) not null default 0,
  deposit_amount numeric(10,2) not null default 0,
  start_confirmation_amount numeric(10,2) not null default 0,
  balance_amount numeric(10,2) not null default 0,
  number_of_payments integer,
  payment_frequency text,
  first_payment_date date,
  payment_method text,
  requires_authorization boolean not null default false,
  authorization_document_id uuid,
  status text not null default 'active' check (
    status in (
      'full_paid',
      'active',
      'pending_authorization',
      'pending_deposit',
      'pending_start_confirmation_payment',
      'completed',
      'cancelled'
    )
  ),
  created_by_user_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_enrollment_payment_plans_updated_at
before update on public.enrollment_payment_plans
for each row
execute function public.set_updated_at();

create index if not exists idx_enrollment_payment_plans_enrollment_id
on public.enrollment_payment_plans(enrollment_id);

create table if not exists public.payment_schedule_items (
  id uuid primary key default gen_random_uuid(),
  payment_plan_id uuid not null references public.enrollment_payment_plans(id) on delete cascade,
  due_date date not null,
  amount numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  total_due numeric(10,2) not null default 0,
  payment_label text,
  status text not null default 'pending' check (
    status in (
      'pending',
      'due_soon',
      'overdue',
      'paid',
      'waived',
      'cancelled'
    )
  ),
  paid_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_payment_schedule_items_updated_at
before update on public.payment_schedule_items
for each row
execute function public.set_updated_at();

create index if not exists idx_payment_schedule_items_payment_plan_id
on public.payment_schedule_items(payment_plan_id);

create index if not exists idx_payment_schedule_items_due_date
on public.payment_schedule_items(due_date);

create index if not exists idx_payment_schedule_items_status
on public.payment_schedule_items(status);
