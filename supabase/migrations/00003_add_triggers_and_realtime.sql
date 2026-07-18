
-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Project count denormalisation trigger
create or replace function public.sync_project_counts()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_uid uuid;
begin
  v_uid := coalesce(new.user_id, old.user_id);
  update public.profiles
  set
    total_projects = (select count(*) from public.projects where user_id = v_uid and not is_archived),
    total_devices  = (select coalesce(sum(device_count), 0) from public.projects where user_id = v_uid and not is_archived)
  where id = v_uid;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_counts_insert on public.projects;
drop trigger if exists trg_sync_counts_update on public.projects;
drop trigger if exists trg_sync_counts_delete on public.projects;

create trigger trg_sync_counts_insert
  after insert on public.projects
  for each row execute function public.sync_project_counts();

create trigger trg_sync_counts_update
  after update on public.projects
  for each row execute function public.sync_project_counts();

create trigger trg_sync_counts_delete
  after delete on public.projects
  for each row execute function public.sync_project_counts();

-- Realtime for notifications
alter publication supabase_realtime add table public.notifications;
