-- Cole este SQL no Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null check (role in ('student','admin')) default 'student',
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  theme text not null,
  difficulty int not null default 1 check (difficulty between 1 and 5),
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.case_stages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  stage_index int not null check (stage_index between 1 and 10),
  title text not null,
  content text not null,
  question text not null,
  max_score int not null default 2 check (max_score between 1 and 3),
  created_at timestamptz not null default now(),
  unique(case_id, stage_index)
);

create table if not exists public.case_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  status text not null check (status in ('in_progress','completed')) default 'in_progress',
  current_stage_index int not null default 1,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  final_score int not null default 0,
  total_max_score int not null default 10,
  critical_flags int not null default 0
);

create table if not exists public.stage_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.case_sessions(id) on delete cascade,
  stage_index int not null,
  attempt_no int not null default 1,
  student_text text not null,
  ai_feedback text not null,
  ai_score int not null,
  ai_justification text not null,
  ai_next_hint text,
  unsafe_flag boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.student_case_history (
  student_id uuid not null references public.profiles(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key(student_id, case_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'student')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_stages enable row level security;
alter table public.case_sessions enable row level security;
alter table public.stage_attempts enable row level security;
alter table public.student_case_history enable row level security;

create policy "profiles_self_select"
on public.profiles for select
using (id = auth.uid());

create policy "profiles_admin_select"
on public.profiles for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "cases_student_select_active"
on public.cases for select
using (is_active = true);

create policy "cases_admin_all"
on public.cases for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "stages_student_select"
on public.case_stages for select
using (exists (select 1 from public.cases c where c.id = case_id and c.is_active = true));

create policy "stages_admin_all"
on public.case_stages for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "sessions_student_own"
on public.case_sessions for all
using (student_id = auth.uid())
with check (student_id = auth.uid());

create policy "sessions_admin_select"
on public.case_sessions for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "attempts_student_own"
on public.stage_attempts for all
using (exists (select 1 from public.case_sessions s where s.id = session_id and s.student_id = auth.uid()))
with check (exists (select 1 from public.case_sessions s where s.id = session_id and s.student_id = auth.uid()));

create policy "attempts_admin_select"
on public.stage_attempts for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "history_student_own"
on public.student_case_history for all
using (student_id = auth.uid())
with check (student_id = auth.uid());

create policy "history_admin_select"
on public.student_case_history for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
