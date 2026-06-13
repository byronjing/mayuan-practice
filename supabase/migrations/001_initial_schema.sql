create table if not exists public.app_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  student_id text not null unique check (student_id ~ '^[A-Za-z0-9._-]+$'),
  display_name text not null default '',
  role text not null default 'student' check (role in ('admin', 'student')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.practice_records (
  user_id uuid primary key references auth.users(id) on delete cascade,
  records jsonb not null default '{"attempts":[],"wrongBook":{},"answerOverrides":{},"backupMeta":{"backupVersion":1,"questionBankVersion":"2026-05-28-release","updatedAt":null}}'::jsonb,
  question_bank_version text not null default '2026-05-28-release',
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_is_active()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.app_users
    where user_id = auth.uid()
      and is_active
  );
$$;

create or replace function public.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.app_users
    where user_id = auth.uid()
      and role = 'admin'
      and is_active
  );
$$;

drop trigger if exists app_users_touch_updated_at on public.app_users;
create trigger app_users_touch_updated_at
before update on public.app_users
for each row execute function public.touch_updated_at();

alter table public.app_users enable row level security;
alter table public.practice_records enable row level security;

drop policy if exists "Users can read own active profile; admins can read user list" on public.app_users;
create policy "Users can read own active profile; admins can read user list"
on public.app_users for select
to authenticated
using (
  (user_id = (select auth.uid()) and is_active)
  or public.current_user_is_admin()
);

drop policy if exists "Active users can read own practice records" on public.practice_records;
create policy "Active users can read own practice records"
on public.practice_records for select
to authenticated
using (
  user_id = (select auth.uid())
  and public.current_user_is_active()
);

drop policy if exists "Active users can create own practice records" on public.practice_records;
create policy "Active users can create own practice records"
on public.practice_records for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.current_user_is_active()
);

drop policy if exists "Active users can update own practice records" on public.practice_records;
create policy "Active users can update own practice records"
on public.practice_records for update
to authenticated
using (
  user_id = (select auth.uid())
  and public.current_user_is_active()
)
with check (
  user_id = (select auth.uid())
  and public.current_user_is_active()
);
