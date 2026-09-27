-- ============================================================================
-- Shared Calendar — schema, triggers, RPC functions, and RLS policies.
-- Jalankan seluruh file ini sekali di Supabase Dashboard -> SQL Editor.
-- Aman dijalankan ulang (idempotent) berkat "if not exists" / "or replace".
--
-- Login di app ini pakai USERNAME + PASSWORD (bukan email) — lihat
-- lib/auth-username.ts. Supabase Auth tetap butuh kolom email secara internal,
-- jadi tiap username dipetakan ke email palsu ("user@kalender.local") yang
-- dibuat lewat endpoint /api/signup (pakai service role key) supaya akun
-- langsung "confirmed" tanpa perlu mengirim email verifikasi sungguhan.
--
-- CATATAN MIGRASI: kalau project Supabase kamu sudah pernah menjalankan versi
-- schema LAMA (yang masih pakai kolom nama/email di profiles), jalankan dulu:
--   drop table if exists public.events, public.environment_members,
--     public.environments, public.profiles cascade;
-- baru jalankan seluruh file ini dari awal.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- tanpa 0/O/1/I biar tidak ambigu
  code text;
  already_exists boolean;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(chars, floor(random() * length(chars))::int + 1, 1);
    end loop;
    select exists(select 1 from public.environments where invite_code = code) into already_exists;
    exit when not already_exists;
  end loop;
  return code;
end;
$$;

create table if not exists public.environments (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  invite_code text not null unique default public.generate_invite_code(),
  created_at timestamptz not null default now()
);

create table if not exists public.environment_members (
  environment_id uuid not null references public.environments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (environment_id, user_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  environment_id uuid not null references public.environments (id) on delete cascade,
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  judul text not null,
  tanggal date not null,
  jam_mulai time,
  jam_selesai time,
  lokasi text,
  catatan text,
  created_at timestamptz not null default now()
);

create index if not exists idx_environment_members_user on public.environment_members (user_id);
create index if not exists idx_events_environment_tanggal on public.events (environment_id, tanggal);

-- ----------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS (security definer -> aman dari rekursi RLS)
-- ----------------------------------------------------------------------------

create or replace function public.is_environment_member(env_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.environment_members
    where environment_id = env_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_environment_owner(env_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.environment_members
    where environment_id = env_id and user_id = auth.uid() and role = 'owner'
  );
$$;

create or replace function public.shares_environment_with(target_user uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.environment_members em1
    join public.environment_members em2 on em1.environment_id = em2.environment_id
    where em1.user_id = auth.uid() and em2.user_id = target_user
  );
$$;

-- ----------------------------------------------------------------------------
-- 3. TRIGGERS
-- ----------------------------------------------------------------------------

-- Buat profil otomatis saat user baru daftar lewat Supabase Auth.
-- Username dikirim lewat user_metadata saat akun dibuat (lihat app/api/signup).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Jadikan pembuat environment sebagai owner otomatis di environment_members.
create or replace function public.handle_new_environment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.environment_members (environment_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (environment_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_environment_created on public.environments;
create trigger on_environment_created
  after insert on public.environments
  for each row execute function public.handle_new_environment();

-- ----------------------------------------------------------------------------
-- 4. RPC: join & invite (security definer supaya tidak butuh SELECT policy
--    terbuka pada tabel environments/profiles untuk orang yang belum jadi anggota)
-- ----------------------------------------------------------------------------

create or replace function public.join_environment_by_code(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_env_id uuid;
begin
  select id into v_env_id
  from public.environments
  where invite_code = upper(trim(p_invite_code));

  if v_env_id is null then
    raise exception 'Kode undangan tidak ditemukan';
  end if;

  insert into public.environment_members (environment_id, user_id, role)
  values (v_env_id, auth.uid(), 'member')
  on conflict (environment_id, user_id) do nothing;

  return v_env_id;
end;
$$;

grant execute on function public.join_environment_by_code(text) to authenticated;

create or replace function public.add_member_by_username(p_environment_id uuid, p_username text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if not public.is_environment_member(p_environment_id) then
    raise exception 'Anda bukan anggota environment ini';
  end if;

  select id into v_user_id from public.profiles where lower(username) = lower(trim(p_username));

  if v_user_id is null then
    raise exception 'Username tersebut belum terdaftar di aplikasi ini';
  end if;

  insert into public.environment_members (environment_id, user_id, role)
  values (p_environment_id, v_user_id, 'member')
  on conflict (environment_id, user_id) do nothing;
end;
$$;

grant execute on function public.add_member_by_username(uuid, text) to authenticated;

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.environments enable row level security;
alter table public.environment_members enable row level security;
alter table public.events enable row level security;

-- profiles: lihat diri sendiri + orang yang satu environment dengan kita
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.shares_environment_with(id));

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- environments: hanya anggota yang bisa lihat; hanya owner yang bisa ubah/hapus
drop policy if exists "environments_select" on public.environments;
create policy "environments_select" on public.environments
  for select using (public.is_environment_member(id));

drop policy if exists "environments_insert" on public.environments;
create policy "environments_insert" on public.environments
  for insert with check (owner_id = auth.uid());

drop policy if exists "environments_update_owner" on public.environments;
create policy "environments_update_owner" on public.environments
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "environments_delete_owner" on public.environments;
create policy "environments_delete_owner" on public.environments
  for delete using (owner_id = auth.uid());

-- environment_members: hanya anggota environment yang sama yang bisa lihat daftar
-- anggota. Insert normal terjadi lewat trigger/RPC (security definer), jadi
-- sengaja TIDAK ada insert policy untuk role authenticated di sini.
drop policy if exists "environment_members_select" on public.environment_members;
create policy "environment_members_select" on public.environment_members
  for select using (public.is_environment_member(environment_id));

drop policy if exists "environment_members_delete" on public.environment_members;
create policy "environment_members_delete" on public.environment_members
  for delete using (
    (user_id = auth.uid() and role = 'member') -- keluar sendiri
    or (public.is_environment_owner(environment_id) and user_id <> auth.uid()) -- owner keluarkan anggota
  );

-- events: lihat semua event di environment yang kita ikuti, tapi hanya boleh
-- ubah/hapus event milik sendiri.
drop policy if exists "events_select" on public.events;
create policy "events_select" on public.events
  for select using (public.is_environment_member(environment_id));

drop policy if exists "events_insert_own" on public.events;
create policy "events_insert_own" on public.events
  for insert with check (
    owner_user_id = auth.uid() and public.is_environment_member(environment_id)
  );

drop policy if exists "events_update_own" on public.events;
create policy "events_update_own" on public.events
  for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

drop policy if exists "events_delete_own" on public.events;
create policy "events_delete_own" on public.events
  for delete using (owner_user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 6. REALTIME
-- ----------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'events'
  ) then
    alter publication supabase_realtime add table public.events;
  end if;
end $$;
