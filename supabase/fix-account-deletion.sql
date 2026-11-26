-- Run once in the Supabase SQL editor. Lets a user account be deleted without being blocked by rows they created.
-- (New installs get this from schema.sql.)
alter table public.datasets drop constraint if exists datasets_created_by_fkey, add constraint datasets_created_by_fkey foreign key (created_by) references auth.users(id) on delete set null;
alter table public.threads drop constraint if exists threads_created_by_fkey, add constraint threads_created_by_fkey foreign key (created_by) references auth.users(id) on delete set null;
alter table public.notebooks drop constraint if exists notebooks_created_by_fkey, add constraint notebooks_created_by_fkey foreign key (created_by) references auth.users(id) on delete set null;
alter table public.apps drop constraint if exists apps_created_by_fkey, add constraint apps_created_by_fkey foreign key (created_by) references auth.users(id) on delete set null;
alter table public.context_items drop constraint if exists context_items_created_by_fkey, add constraint context_items_created_by_fkey foreign key (created_by) references auth.users(id) on delete set null;
alter table public.eval_suites drop constraint if exists eval_suites_created_by_fkey, add constraint eval_suites_created_by_fkey foreign key (created_by) references auth.users(id) on delete set null;
alter table public.eval_runs drop constraint if exists eval_runs_created_by_fkey, add constraint eval_runs_created_by_fkey foreign key (created_by) references auth.users(id) on delete set null;
alter table public.usage_events drop constraint if exists usage_events_user_id_fkey, add constraint usage_events_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;
