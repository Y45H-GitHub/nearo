-- Nearo — auth support: auto-create profiles row on signup, mocked phone OTP storage.
-- Implements the M1 (Auth & Profiles) prerequisites called out in specs/implementation-plan.md.

-- ============================================================================
-- Auto-create a profiles row whenever auth.users gets a new row — covers both
-- email/password signup and Google OAuth uniformly, so no client code path
-- needs to remember to do this itself.
-- ============================================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    coalesce(new.raw_user_meta_data->>'city', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- phone_otps — backs the mocked phone verification flow (ADR 0006). Real data,
-- even though no real SMS is sent: a row per OTP issuance, consumed on verify.
-- ============================================================================
create table phone_otps (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  phone text not null,
  code text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_phone_otps_profile on phone_otps (profile_id, created_at desc);

alter table phone_otps enable row level security;

-- No client-side policies at all: only Server Actions using the service-role
-- client touch this table (per ADR 0007) — a user has no legitimate reason to
-- read or write their own OTP rows directly.
