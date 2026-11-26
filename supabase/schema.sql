-- InsightPad schema. Run once in the Supabase SQL editor (or `supabase db push`).
-- Every table has Row Level Security enabled. Access is by workspace membership.

create extension if not exists "pgcrypto";

-- ---------- Core ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner','admin','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.subscriptions (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  plan text not null default 'community' check (plan in ('community','professional','team','enterprise')),
  status text not null default 'active',
  credits_total integer not null default 30,
  credits_used integer not null default 0,
  period_end timestamptz,
  updated_at timestamptz not null default now()
);

create or replace function public.is_member(ws uuid) returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.workspace_members m where m.workspace_id = ws and m.user_id = auth.uid());
$$;

create or replace function public.can_edit(ws uuid) returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.workspace_members m where m.workspace_id = ws and m.user_id = auth.uid() and m.role in ('owner','admin','editor'));
$$;

-- ---------- Product data ----------
create table if not exists public.datasets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  filename text,
  storage_path text,
  columns jsonb not null default '[]',
  row_count integer not null default 0,
  truncated boolean not null default false,
  rows jsonb not null default '[]',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  dataset_id uuid references public.datasets(id) on delete set null,
  title text not null default 'New thread',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.thread_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  plan jsonb,
  result jsonb,
  credits integer not null default 0,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notebooks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null default 'Untitled notebook',
  dataset_id uuid references public.datasets(id) on delete set null,
  cells jsonb not null default '[]',
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.notebook_versions (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid not null references public.notebooks(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  cells jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  dataset_id uuid references public.datasets(id) on delete set null,
  widgets jsonb not null default '[]',
  published boolean not null default false,
  share_token text unique default encode(gen_random_bytes(12), 'hex'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.context_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind text not null check (kind in ('metric','term','dataset_note')),
  name text not null,
  definition text not null,
  dataset_id uuid references public.datasets(id) on delete set null,
  endorsed boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.eval_suites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  dataset_id uuid references public.datasets(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.eval_cases (
  id uuid primary key default gen_random_uuid(),
  suite_id uuid not null references public.eval_suites(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  prompt text not null,
  expected numeric not null,
  tolerance numeric not null default 0.01,
  created_at timestamptz not null default now()
);
create table if not exists public.eval_runs (
  id uuid primary key default gen_random_uuid(),
  suite_id uuid not null references public.eval_suites(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  passed integer not null default 0,
  failed integer not null default 0,
  credits integer not null default 0,
  results jsonb not null default '[]',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- Usage, notifications, billing ----------
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  kind text not null,
  credits integer not null default 0,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- A user reports a completed payment; an administrator verifies it with the payment
-- provider before approving. A redirect alone never upgrades a plan.
create table if not exists public.payment_claims (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('professional','team','enterprise')),
  reference text not null,
  payer_email text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  name text,
  email text,
  company text,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_datasets_ws on public.datasets(workspace_id);
create index if not exists idx_threads_ws on public.threads(workspace_id);
create index if not exists idx_msgs_thread on public.thread_messages(thread_id, created_at);
create index if not exists idx_usage_ws on public.usage_events(workspace_id, created_at desc);

-- ---------- Credits (atomic) ----------
create or replace function public.consume_credits(ws uuid, amount integer, kind text, meta jsonb default '{}')
returns boolean language plpgsql security definer set search_path = public as $$
declare ok boolean;
begin
  if not public.can_edit(ws) then return false; end if;
  update public.subscriptions
     set credits_used = credits_used + amount, updated_at = now()
   where workspace_id = ws and credits_used + amount <= credits_total
   returning true into ok;
  if ok then
    insert into public.usage_events(workspace_id, user_id, kind, credits, meta) values (ws, auth.uid(), kind, amount, meta);
  end if;
  return coalesce(ok, false);
end $$;

-- ---------- New user bootstrap ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare ws uuid;
begin
  insert into public.profiles(id, email, full_name) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  insert into public.workspaces(name, owner_id) values (coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)) || '''s workspace', new.id) returning id into ws;
  insert into public.workspace_members(workspace_id, user_id, role) values (ws, new.id, 'owner');
  insert into public.subscriptions(workspace_id) values (ws);
  insert into public.notifications(user_id, title, body) values (new.id, 'Welcome to InsightPad', 'Upload a CSV on the Datasets page, then ask your first question in Threads.');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.subscriptions enable row level security;
alter table public.datasets enable row level security;
alter table public.threads enable row level security;
alter table public.thread_messages enable row level security;
alter table public.notebooks enable row level security;
alter table public.notebook_versions enable row level security;
alter table public.apps enable row level security;
alter table public.context_items enable row level security;
alter table public.eval_suites enable row level security;
alter table public.eval_cases enable row level security;
alter table public.eval_runs enable row level security;
alter table public.usage_events enable row level security;
alter table public.notifications enable row level security;
alter table public.payment_claims enable row level security;
alter table public.leads enable row level security; -- no policies: service role only

create policy "own profile" on public.profiles for select using (id = auth.uid());
create policy "update own profile" on public.profiles for update using (id = auth.uid());

create policy "members read workspace" on public.workspaces for select using (public.is_member(id));
create policy "owner updates workspace" on public.workspaces for update using (owner_id = auth.uid());
create policy "members read members" on public.workspace_members for select using (public.is_member(workspace_id));
-- Subscriptions are read-only to users. Only the service role (admin approval) writes plan changes;
-- credit consumption goes through consume_credits().
create policy "members read subscription" on public.subscriptions for select using (public.is_member(workspace_id));

-- Generic workspace-scoped policies
do $$
declare t text;
begin
  foreach t in array array['datasets','threads','thread_messages','notebooks','notebook_versions','apps','context_items','eval_suites','eval_cases','eval_runs'] loop
    execute format('create policy "read %1$s" on public.%1$s for select using (public.is_member(workspace_id))', t);
    execute format('create policy "insert %1$s" on public.%1$s for insert with check (public.can_edit(workspace_id))', t);
    execute format('create policy "update %1$s" on public.%1$s for update using (public.can_edit(workspace_id))', t);
    execute format('create policy "delete %1$s" on public.%1$s for delete using (public.can_edit(workspace_id))', t);
  end loop;
end $$;

create policy "read usage" on public.usage_events for select using (public.is_member(workspace_id));

create policy "own notifications read" on public.notifications for select using (user_id = auth.uid());
create policy "own notifications update" on public.notifications for update using (user_id = auth.uid());

create policy "own claims read" on public.payment_claims for select using (user_id = auth.uid());
create policy "own claims insert" on public.payment_claims for insert with check (user_id = auth.uid() and public.is_member(workspace_id) and status = 'pending');

-- ---------- Storage ----------
insert into storage.buckets (id, name, public) values ('datasets', 'datasets', false) on conflict do nothing;

-- Files are stored under "<workspace_id>/<file>"
create policy "members read dataset files" on storage.objects for select
  using (bucket_id = 'datasets' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "editors upload dataset files" on storage.objects for insert
  with check (bucket_id = 'datasets' and public.can_edit(((storage.foldername(name))[1])::uuid));
create policy "editors delete dataset files" on storage.objects for delete
  using (bucket_id = 'datasets' and public.can_edit(((storage.foldername(name))[1])::uuid));


-- Grants for the API roles (also in supabase/grants.sql)
-- Newer Supabase projects do not auto-grant table privileges to the API roles.
-- RLS policies still decide which rows each user can touch.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

grant execute on all functions in schema public to authenticated, service_role;

-- The leads table is unused by the site; keep it server-only.
revoke all on public.leads from authenticated;

alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant execute on functions to authenticated, service_role;
