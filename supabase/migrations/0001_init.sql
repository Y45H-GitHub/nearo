-- Nearo — initial schema
-- Implements specs/database-schema.md. Keep both in sync when either changes.

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "btree_gist"; -- EXCLUDE constraint on daterange

-- ============================================================================
-- Enums
-- ============================================================================
create type user_role as enum ('user', 'admin');
create type product_condition as enum ('new', 'like_new', 'good', 'fair');
create type product_status as enum ('draft', 'available', 'booking_requested', 'booked', 'rented', 'returned', 'hidden', 'maintenance');
create type booking_status as enum ('requested', 'accepted', 'rejected', 'cancelled', 'active', 'returned', 'disputed', 'completed');
create type cancelled_by_party as enum ('customer', 'owner', 'admin');
create type payment_type as enum ('rental_charge', 'deposit_hold', 'deposit_release', 'refund', 'payout');
create type payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');
create type payment_provider as enum ('mock', 'razorpay');
create type availability_reason as enum ('booking', 'owner_block');
create type report_target_type as enum ('user', 'product');
create type report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

-- ============================================================================
-- profiles
-- ============================================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  bio text,
  phone text,
  phone_verified_at timestamptz,
  city text,
  role user_role not null default 'user',
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  response_rate numeric(5,2),
  cancellation_count int not null default 0,
  rejection_count int not null default 0,
  id_verification_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function profile_is_verified(profile_id uuid)
returns boolean
language sql
stable
as $$
  select
    p.phone_verified_at is not null
    and u.email_confirmed_at is not null
  from profiles p
  join auth.users u on u.id = p.id
  where p.id = profile_id;
$$;

-- ============================================================================
-- categories
-- ============================================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  parent_id uuid references categories(id) on delete restrict,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- platform_settings
-- ============================================================================
create table platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into platform_settings (key, value) values ('platform_fee_rate', '0.12');

-- ============================================================================
-- products
-- ============================================================================
create table products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  category_id uuid not null references categories(id),
  subcategory_id uuid references categories(id),
  brand text,
  model text,
  condition product_condition not null default 'good',
  price_per_day numeric(10,2) not null check (price_per_day >= 0),
  security_deposit numeric(10,2) not null default 0 check (security_deposit >= 0),
  min_rental_days int not null default 1 check (min_rental_days >= 1),
  max_rental_days int check (max_rental_days is null or max_rental_days >= min_rental_days),
  pickup_available boolean not null default true,
  delivery_available boolean not null default false,
  delivery_radius_km numeric(5,2),
  address_text text not null default '',
  city text not null default '',
  lat double precision not null default 0,
  lng double precision not null default 0,
  visibility_radius_km numeric(5,2) not null default 5,
  status product_status not null default 'draft',
  slug text unique,
  cover_image_url text,
  view_count int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category_status on products (category_id, status);
create index idx_products_owner on products (owner_id);
create index idx_products_lat_lng on products (lat, lng);

-- ============================================================================
-- product_images
-- ============================================================================
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_product_images_product on product_images (product_id);

-- ============================================================================
-- bookings (created before availability_blocks so the FK below can point to it)
-- ============================================================================
create table bookings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  customer_id uuid not null references profiles(id),
  owner_id uuid not null references profiles(id),
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  status booking_status not null default 'requested',
  subtotal_amount numeric(10,2) not null,
  platform_fee_rate numeric(5,4),
  platform_fee_amount numeric(10,2),
  deposit_amount numeric(10,2) not null default 0,
  owner_payout_amount numeric(10,2),
  cancelled_by cancelled_by_party,
  cancellation_reason text,
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  started_at timestamptz,
  returned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bookings_customer on bookings (customer_id);
create index idx_bookings_owner on bookings (owner_id);
create index idx_bookings_product on bookings (product_id);
create index idx_bookings_status on bookings (status);

-- ============================================================================
-- availability_blocks
-- ============================================================================
create table availability_blocks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  reason availability_reason not null,
  booking_id uuid references bookings(id) on delete cascade,
  created_at timestamptz not null default now(),
  exclude using gist (
    product_id with =,
    daterange(start_date, end_date, '[]') with &&
  )
);

create index idx_availability_blocks_product on availability_blocks (product_id);

-- ============================================================================
-- payments
-- ============================================================================
create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  type payment_type not null,
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  status payment_status not null default 'pending',
  provider payment_provider not null default 'mock',
  provider_reference text,
  created_at timestamptz not null default now()
);

create index idx_payments_booking on payments (booking_id);

-- ============================================================================
-- reviews
-- ============================================================================
create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  reviewer_id uuid not null references profiles(id),
  reviewee_id uuid not null references profiles(id),
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (booking_id, reviewer_id)
);

create index idx_reviews_reviewee on reviews (reviewee_id);

create or replace function recompute_profile_rating()
returns trigger
language plpgsql
as $$
begin
  update profiles
  set
    rating_avg = coalesce((select avg(rating)::numeric(3,2) from reviews where reviewee_id = new.reviewee_id), 0),
    rating_count = (select count(*) from reviews where reviewee_id = new.reviewee_id)
  where id = new.reviewee_id;
  return new;
end;
$$;

create trigger trg_recompute_profile_rating
after insert on reviews
for each row execute function recompute_profile_rating();

-- ============================================================================
-- message_threads / messages
-- ============================================================================
create table message_threads (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  booking_id uuid references bookings(id),
  customer_id uuid not null references profiles(id),
  owner_id uuid not null references profiles(id),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (product_id, customer_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references message_threads(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_messages_thread on messages (thread_id);

create or replace function touch_thread_last_message()
returns trigger
language plpgsql
as $$
begin
  update message_threads set last_message_at = new.created_at where id = new.thread_id;
  return new;
end;
$$;

create trigger trg_touch_thread_last_message
after insert on messages
for each row execute function touch_thread_last_message();

-- ============================================================================
-- wishlists
-- ============================================================================
create table wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ============================================================================
-- notifications
-- ============================================================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  template_key text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications (user_id, read_at);

-- ============================================================================
-- reports
-- ============================================================================
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id),
  target_type report_target_type not null,
  target_id uuid not null,
  reason text not null,
  description text,
  status report_status not null default 'open',
  resolved_by uuid references profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- updated_at maintenance
-- ============================================================================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on profiles for each row execute function set_updated_at();
create trigger trg_products_updated_at before update on products for each row execute function set_updated_at();
create trigger trg_bookings_updated_at before update on bookings for each row execute function set_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table availability_blocks enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table message_threads enable row level security;
alter table messages enable row level security;
alter table wishlists enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;
alter table platform_settings enable row level security;

create or replace function is_admin()
returns boolean
language sql
stable
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles
create policy "profiles_public_read" on profiles for select using (true);
create policy "profiles_self_update" on profiles for update using (auth.uid() = id or is_admin());
create policy "profiles_self_insert" on profiles for insert with check (auth.uid() = id);

-- categories
create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_write" on categories for all using (is_admin());

-- products
create policy "products_public_read" on products for select
  using (status in ('available','booking_requested','booked','rented','returned') or owner_id = auth.uid() or is_admin());
create policy "products_owner_write" on products for all
  using (owner_id = auth.uid() or is_admin());

-- product_images
create policy "product_images_read" on product_images for select
  using (exists (select 1 from products p where p.id = product_id and (p.status in ('available','booking_requested','booked','rented','returned') or p.owner_id = auth.uid() or is_admin())));
create policy "product_images_owner_write" on product_images for all
  using (exists (select 1 from products p where p.id = product_id and (p.owner_id = auth.uid() or is_admin())));

-- availability_blocks
create policy "availability_blocks_read" on availability_blocks for select using (true);
create policy "availability_blocks_owner_write" on availability_blocks for all
  using (exists (select 1 from products p where p.id = product_id and (p.owner_id = auth.uid() or is_admin())));

-- bookings
create policy "bookings_participant_read" on bookings for select
  using (customer_id = auth.uid() or owner_id = auth.uid() or is_admin());
create policy "bookings_customer_insert" on bookings for insert
  with check (customer_id = auth.uid());
create policy "bookings_participant_update" on bookings for update
  using (customer_id = auth.uid() or owner_id = auth.uid() or is_admin());

-- payments (service-role/server-only writes; no client insert/update policy)
create policy "payments_participant_read" on payments for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.customer_id = auth.uid() or b.owner_id = auth.uid())) or is_admin());

-- reviews
create policy "reviews_public_read" on reviews for select using (true);
create policy "reviews_participant_insert" on reviews for insert
  with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from bookings b
      where b.id = booking_id
        and b.status in ('returned','completed')
        and (b.customer_id = auth.uid() or b.owner_id = auth.uid())
    )
  );

-- message_threads / messages
create policy "threads_participant_read" on message_threads for select
  using (customer_id = auth.uid() or owner_id = auth.uid() or is_admin());
create policy "threads_participant_insert" on message_threads for insert
  with check (customer_id = auth.uid() or owner_id = auth.uid());
create policy "messages_participant_read" on messages for select
  using (exists (select 1 from message_threads t where t.id = thread_id and (t.customer_id = auth.uid() or t.owner_id = auth.uid())) or is_admin());
create policy "messages_participant_insert" on messages for insert
  with check (sender_id = auth.uid() and exists (select 1 from message_threads t where t.id = thread_id and (t.customer_id = auth.uid() or t.owner_id = auth.uid())));

-- wishlists
create policy "wishlists_self" on wishlists for all using (user_id = auth.uid());

-- notifications
create policy "notifications_self_read" on notifications for select using (user_id = auth.uid());
create policy "notifications_self_update" on notifications for update using (user_id = auth.uid());

-- reports
create policy "reports_reporter_read" on reports for select using (reporter_id = auth.uid() or is_admin());
create policy "reports_reporter_insert" on reports for insert with check (reporter_id = auth.uid());
create policy "reports_admin_update" on reports for update using (is_admin());

-- platform_settings
create policy "platform_settings_public_read" on platform_settings for select using (true);
create policy "platform_settings_admin_write" on platform_settings for all using (is_admin());
