-- Nearo — M8 admin moderation support
-- Adds the columns M8 (Admin Panel) needs that weren't required by any
-- earlier milestone: user suspension and dispute-resolution audit fields.
-- Implements as: specs/implementation-plan.md M8, specs/api-design.md
-- (suspendUser, resolveDispute).

alter table profiles
  add column is_suspended boolean not null default false,
  add column suspended_at timestamptz;

alter table bookings
  add column admin_notes text,
  add column resolved_by uuid references profiles(id);
