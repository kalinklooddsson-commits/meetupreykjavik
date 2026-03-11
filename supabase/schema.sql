-- MeetupReykjavik schema derived from the March 10, 2026 build spec.
-- Note: the PDF claims 22 tables, but Section 4 enumerates 24 tables.
-- This file implements all 24 enumerated tables plus seeds, helper functions, and baseline RLS.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  slug text unique not null,
  email text,
  avatar_url text,
  bio text,
  city text not null default 'Reykjavik',
  languages text[] not null default '{}'::text[],
  interests uuid[] not null default '{}'::uuid[],
  locale text not null default 'en',
  age_range text,
  account_type text not null default 'user' check (account_type in ('admin', 'venue', 'organizer', 'user')),
  is_premium boolean not null default false,
  premium_tier text,
  premium_expires_at timestamptz,
  is_verified boolean not null default false,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_bio_length check (char_length(coalesce(bio, '')) <= 300),
  constraint profiles_locale_check check (locale in ('en', 'is'))
);

create table if not exists public.categories (
  id uuid primary key,
  name_en text not null,
  name_is text not null,
  slug text unique not null,
  icon_letter char(1) not null,
  bg_color text not null,
  text_color text not null,
  description_en text,
  description_is text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  legal_name text,
  kennitala text,
  type text not null check (type in ('bar', 'restaurant', 'club', 'cafe', 'coworking', 'studio', 'outdoor', 'other')),
  description text,
  address text not null,
  city text not null default 'Reykjavik',
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  capacity_seated integer,
  capacity_standing integer,
  capacity_total integer,
  amenities text[] not null default '{}'::text[],
  photos text[] not null default '{}'::text[],
  hero_photo_url text,
  website text,
  phone text,
  email text,
  social_links jsonb not null default '{}'::jsonb,
  opening_hours jsonb not null default '{}'::jsonb,
  happy_hour jsonb not null default '{}'::jsonb,
  partnership_tier text not null default 'free' check (partnership_tier in ('free', 'standard', 'premium')),
  is_verified boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'active', 'waitlisted', 'suspended', 'rejected')),
  avg_rating numeric(4, 2) not null default 0,
  review_count integer not null default 0,
  events_hosted integer not null default 0,
  total_attendees integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint venues_capacity_positive check (
    coalesce(capacity_seated, 0) >= 0
    and coalesce(capacity_standing, 0) >= 0
    and coalesce(capacity_total, 0) >= 0
  )
);

create table if not exists public.venue_availability (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  day_of_week integer check (day_of_week between 0 and 6),
  specific_date date,
  start_time time not null,
  end_time time not null,
  capacity_override integer,
  cost_type text check (cost_type in ('free', 'minimum_spend', 'flat_fee', 'negotiable')),
  cost_amount numeric(10, 2),
  notes text,
  is_recurring boolean not null default false,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint venue_availability_time_order check (end_time > start_time),
  constraint venue_availability_date_scope check (specific_date is not null or day_of_week is not null)
);

create table if not exists public.venue_deals (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  title text not null,
  description text,
  deal_type text not null check (deal_type in ('percentage', 'fixed_price', 'free_item', 'happy_hour', 'group_package', 'welcome_drink')),
  deal_tier text not null check (deal_tier in ('bronze', 'silver', 'gold')),
  discount_value text,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint venue_deals_window check (valid_until is null or valid_from is null or valid_until >= valid_from)
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  tags text[] not null default '{}'::text[],
  banner_url text,
  city text not null default 'Reykjavik',
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  join_mode text not null default 'open' check (join_mode in ('open', 'approval')),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  member_count integer not null default 1,
  status text not null default 'pending' check (status in ('pending', 'active', 'archived')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('organizer', 'co_organizer', 'member')),
  status text not null default 'active' check (status in ('active', 'pending', 'banned', 'left')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  group_id uuid references public.groups(id) on delete set null,
  host_id uuid not null references public.profiles(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  event_type text not null default 'in_person' check (event_type in ('in_person', 'online', 'hybrid')),
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled', 'completed')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue_name text,
  venue_address text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  online_link text,
  featured_photo_url text,
  gallery_photos text[] not null default '{}'::text[],
  attendee_limit integer,
  guest_limit integer not null default 0,
  age_restriction text not null default 'none',
  age_min integer,
  age_max integer,
  is_free boolean not null default true,
  is_featured boolean not null default false,
  is_sponsored boolean not null default false,
  comments_enabled boolean not null default true,
  rsvp_mode text not null default 'open' check (rsvp_mode in ('open', 'approval', 'invite_only')),
  recurrence_rule text,
  recurrence_end date,
  parent_event_id uuid references public.events(id) on delete set null,
  rsvp_count integer not null default 0,
  waitlist_count integer not null default 0,
  attendance_count integer not null default 0,
  avg_rating numeric(4, 2),
  created_at timestamptz not null default now(),
  constraint events_time_order check (ends_at is null or ends_at > starts_at),
  constraint events_limits_positive check (
    coalesce(attendee_limit, 1) >= 1
    and guest_limit >= 0
  ),
  constraint events_age_order check (
    age_min is null
    or age_max is null
    or age_max >= age_min
  )
);

create table if not exists public.event_invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  invited_email text,
  invited_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  invited_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint event_invites_target_check check (invited_email is not null or invited_user_id is not null)
);

create table if not exists public.blocked_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  blocked_by uuid not null references public.profiles(id) on delete cascade,
  scope text not null check (scope in ('platform', 'group', 'event', 'venue')),
  scope_id uuid,
  reason text,
  created_at timestamptz not null default now(),
  constraint blocked_users_scope_check check (
    (scope = 'platform' and scope_id is null)
    or (scope <> 'platform' and scope_id is not null)
  )
);

create table if not exists public.ticket_tiers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  price_isk numeric(10, 2) not null default 0,
  price_usd numeric(10, 2) not null default 0,
  quantity integer not null,
  sold_count integer not null default 0,
  sort_order integer not null default 0,
  constraint ticket_tiers_quantity_check check (quantity >= 0 and sold_count >= 0 and sold_count <= quantity)
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  ticket_tier_id uuid references public.ticket_tiers(id) on delete set null,
  status text not null default 'going' check (status in ('going', 'not_going', 'waitlisted', 'cancelled')),
  guest_count integer not null default 0,
  attended text check (attended in ('attended', 'no_show') or attended is null),
  checked_in_at timestamptz,
  waitlisted_at timestamptz,
  qr_code text unique,
  payment_id text,
  payment_status text not null default 'na',
  amount_paid numeric(10, 2),
  created_at timestamptz not null default now(),
  unique (event_id, user_id),
  constraint rsvps_guest_count_check check (guest_count >= 0)
);

create table if not exists public.event_comments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  is_pinned boolean not null default false,
  parent_id uuid references public.event_comments(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.event_ratings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  text text,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists public.discussions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  is_pinned boolean not null default false,
  reply_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.discussion_replies (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.venue_reviews (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  reviewer_type text not null check (reviewer_type in ('organizer', 'attendee')),
  rating integer not null check (rating between 1 and 5),
  text text,
  venue_response text,
  created_at timestamptz not null default now(),
  unique (venue_id, reviewer_id, event_id)
);

create table if not exists public.venue_bookings (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  requested_date date not null,
  requested_start time not null,
  requested_end time not null,
  expected_attendance integer,
  event_description text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'counter_offered', 'cancelled', 'completed')),
  venue_response text,
  counter_offer jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint venue_bookings_time_order check (requested_end > requested_start),
  constraint venue_bookings_expected_attendance_check check (coalesce(expected_attendance, 0) >= 0)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('event_reminder', 'new_event', 'rsvp_confirmed', 'waitlist_promoted', 'booking_request', 'booking_response', 'new_member', 'review', 'admin_message')),
  title text not null,
  body text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  subject text,
  body text not null,
  is_read boolean not null default false,
  thread_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('subscription', 'ticket', 'promotion', 'venue_partnership', 'refund')),
  description text not null,
  amount_isk numeric(10, 2),
  amount_usd numeric(10, 2),
  commission_amount numeric(10, 2),
  payment_provider text,
  payment_id text,
  status text not null default 'pending',
  related_event_id uuid references public.events(id) on delete set null,
  related_venue_id uuid references public.venues(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  target_type text not null,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.event_templates (
  id uuid primary key,
  name text not null,
  description_en text not null,
  description_is text not null,
  category_id uuid references public.categories(id) on delete set null,
  best_venue_type text,
  best_time text,
  suggested_capacity text,
  amenities_needed text[] not null default '{}'::text[],
  is_active boolean not null default true
);

create index if not exists profiles_account_type_idx on public.profiles (account_type);
create index if not exists profiles_slug_idx on public.profiles (slug);
create index if not exists venues_owner_idx on public.venues (owner_id);
create index if not exists venues_status_idx on public.venues (status);
create index if not exists venue_availability_venue_idx on public.venue_availability (venue_id);
create index if not exists venue_deals_venue_idx on public.venue_deals (venue_id);
create index if not exists groups_organizer_idx on public.groups (organizer_id);
create index if not exists groups_category_idx on public.groups (category_id);
create index if not exists group_members_group_idx on public.group_members (group_id);
create index if not exists events_group_idx on public.events (group_id);
create index if not exists events_host_idx on public.events (host_id);
create index if not exists events_venue_idx on public.events (venue_id);
create index if not exists events_category_idx on public.events (category_id);
create index if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists event_invites_event_idx on public.event_invites (event_id);
create index if not exists blocked_users_user_idx on public.blocked_users (user_id);
create index if not exists ticket_tiers_event_idx on public.ticket_tiers (event_id);
create index if not exists rsvps_event_idx on public.rsvps (event_id);
create index if not exists rsvps_user_idx on public.rsvps (user_id);
create index if not exists event_comments_event_idx on public.event_comments (event_id);
create index if not exists event_ratings_event_idx on public.event_ratings (event_id);
create index if not exists discussions_group_idx on public.discussions (group_id);
create index if not exists discussion_replies_discussion_idx on public.discussion_replies (discussion_id);
create index if not exists venue_reviews_venue_idx on public.venue_reviews (venue_id);
create index if not exists venue_bookings_venue_idx on public.venue_bookings (venue_id);
create index if not exists notifications_user_idx on public.notifications (user_id);
create index if not exists messages_thread_idx on public.messages (thread_id);
create index if not exists transactions_user_idx on public.transactions (user_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_venues_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

create trigger set_venue_bookings_updated_at
before update on public.venue_bookings
for each row execute function public.set_updated_at();

create trigger set_platform_settings_updated_at
before update on public.platform_settings
for each row execute function public.set_updated_at();

create or replace function public.current_account_type()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select account_type from public.profiles where id = auth.uid()),
    'user'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_account_type() = 'admin';
$$;

create or replace function public.is_group_member(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = target_group_id
      and gm.user_id = auth.uid()
      and gm.status = 'active'
  );
$$;

create or replace function public.can_manage_group(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.groups g
    left join public.group_members gm
      on gm.group_id = g.id
      and gm.user_id = auth.uid()
      and gm.status = 'active'
    where g.id = target_group_id
      and (
        g.organizer_id = auth.uid()
        or gm.role in ('organizer', 'co_organizer')
      )
  );
$$;

create or replace function public.can_manage_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.events e
    where e.id = target_event_id
      and (
        e.host_id = auth.uid()
        or (e.group_id is not null and public.can_manage_group(e.group_id))
      )
  );
$$;

create or replace function public.can_manage_venue(target_venue_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.venues v
    where v.id = target_venue_id
      and v.owner_id = auth.uid()
  );
$$;

grant execute on function public.current_account_type() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_group_member(uuid) to anon, authenticated;
grant execute on function public.can_manage_group(uuid) to anon, authenticated;
grant execute on function public.can_manage_event(uuid) to anon, authenticated;
grant execute on function public.can_manage_venue(uuid) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.venues enable row level security;
alter table public.venue_availability enable row level security;
alter table public.venue_deals enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.events enable row level security;
alter table public.event_invites enable row level security;
alter table public.blocked_users enable row level security;
alter table public.ticket_tiers enable row level security;
alter table public.rsvps enable row level security;
alter table public.event_comments enable row level security;
alter table public.event_ratings enable row level security;
alter table public.discussions enable row level security;
alter table public.discussion_replies enable row level security;
alter table public.venue_reviews enable row level security;
alter table public.venue_bookings enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;
alter table public.transactions enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.platform_settings enable row level security;
alter table public.event_templates enable row level security;

create policy "profiles_select_public"
on public.profiles
for select
using (true);

create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_self_or_admin"
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

create policy "profiles_delete_self_or_admin"
on public.profiles
for delete
to authenticated
using (auth.uid() = id or public.is_admin());

create policy "categories_select_public"
on public.categories
for select
using (true);

create policy "categories_admin_write"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "venues_select_public_or_owner"
on public.venues
for select
using (
  status = 'active'
  or public.can_manage_venue(id)
);

create policy "venues_insert_owner"
on public.venues
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and public.current_account_type() in ('venue', 'admin')
);

create policy "venues_update_owner_or_admin"
on public.venues
for update
to authenticated
using (public.can_manage_venue(id))
with check (public.can_manage_venue(id));

create policy "venues_delete_owner_or_admin"
on public.venues
for delete
to authenticated
using (public.can_manage_venue(id));

create policy "venue_availability_select"
on public.venue_availability
for select
using (
  exists (
    select 1
    from public.venues v
    where v.id = venue_id
      and (v.status = 'active' or public.can_manage_venue(v.id))
  )
);

create policy "venue_availability_manage"
on public.venue_availability
for all
to authenticated
using (public.can_manage_venue(venue_id))
with check (public.can_manage_venue(venue_id));

create policy "venue_deals_select"
on public.venue_deals
for select
using (
  is_active
  or public.can_manage_venue(venue_id)
);

create policy "venue_deals_manage"
on public.venue_deals
for all
to authenticated
using (public.can_manage_venue(venue_id))
with check (public.can_manage_venue(venue_id));

create policy "groups_select_visible"
on public.groups
for select
using (
  status = 'active'
  or public.can_manage_group(id)
  or public.is_group_member(id)
);

create policy "groups_insert_organizer"
on public.groups
for insert
to authenticated
with check (
  organizer_id = auth.uid()
  and public.current_account_type() in ('organizer', 'admin')
);

create policy "groups_manage_organizer"
on public.groups
for update
to authenticated
using (public.can_manage_group(id))
with check (public.can_manage_group(id));

create policy "groups_delete_organizer"
on public.groups
for delete
to authenticated
using (public.can_manage_group(id));

create policy "group_members_select"
on public.group_members
for select
using (
  user_id = auth.uid()
  or public.can_manage_group(group_id)
  or exists (
    select 1
    from public.groups g
    where g.id = group_id
      and g.status = 'active'
  )
);

create policy "group_members_insert"
on public.group_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  or public.can_manage_group(group_id)
);

create policy "group_members_update"
on public.group_members
for update
to authenticated
using (user_id = auth.uid() or public.can_manage_group(group_id))
with check (user_id = auth.uid() or public.can_manage_group(group_id));

create policy "group_members_delete"
on public.group_members
for delete
to authenticated
using (user_id = auth.uid() or public.can_manage_group(group_id));

create policy "events_select_visible"
on public.events
for select
using (
  status in ('published', 'completed')
  or public.can_manage_event(id)
  or (venue_id is not null and public.can_manage_venue(venue_id))
);

create policy "events_insert_host"
on public.events
for insert
to authenticated
with check (
  host_id = auth.uid()
  and public.current_account_type() in ('organizer', 'admin')
);

create policy "events_update_host"
on public.events
for update
to authenticated
using (public.can_manage_event(id))
with check (public.can_manage_event(id));

create policy "events_delete_host"
on public.events
for delete
to authenticated
using (public.can_manage_event(id));

create policy "event_invites_select"
on public.event_invites
for select
using (
  invited_user_id = auth.uid()
  or invited_by = auth.uid()
  or public.can_manage_event(event_id)
);

create policy "event_invites_insert"
on public.event_invites
for insert
to authenticated
with check (public.can_manage_event(event_id));

create policy "event_invites_update"
on public.event_invites
for update
to authenticated
using (
  invited_user_id = auth.uid()
  or public.can_manage_event(event_id)
)
with check (
  invited_user_id = auth.uid()
  or public.can_manage_event(event_id)
);

create policy "event_invites_delete"
on public.event_invites
for delete
to authenticated
using (
  invited_user_id = auth.uid()
  or public.can_manage_event(event_id)
);

create policy "blocked_users_select"
on public.blocked_users
for select
to authenticated
using (
  public.is_admin()
  or blocked_by = auth.uid()
  or (scope = 'group' and public.can_manage_group(scope_id))
  or (scope = 'event' and public.can_manage_event(scope_id))
  or (scope = 'venue' and public.can_manage_venue(scope_id))
);

create policy "blocked_users_insert"
on public.blocked_users
for insert
to authenticated
with check (
  blocked_by = auth.uid()
  and (
    public.is_admin()
    or (scope = 'group' and public.can_manage_group(scope_id))
    or (scope = 'event' and public.can_manage_event(scope_id))
    or (scope = 'venue' and public.can_manage_venue(scope_id))
  )
);

create policy "blocked_users_delete"
on public.blocked_users
for delete
to authenticated
using (
  public.is_admin()
  or blocked_by = auth.uid()
  or (scope = 'group' and public.can_manage_group(scope_id))
  or (scope = 'event' and public.can_manage_event(scope_id))
  or (scope = 'venue' and public.can_manage_venue(scope_id))
);

create policy "ticket_tiers_select"
on public.ticket_tiers
for select
using (
  exists (
    select 1
    from public.events e
    where e.id = event_id
      and (e.status in ('published', 'completed') or public.can_manage_event(e.id))
  )
);

create policy "ticket_tiers_manage"
on public.ticket_tiers
for all
to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

create policy "rsvps_select"
on public.rsvps
for select
to authenticated
using (
  user_id = auth.uid()
  or public.can_manage_event(event_id)
);

create policy "rsvps_insert"
on public.rsvps
for insert
to authenticated
with check (
  user_id = auth.uid()
  or public.is_admin()
);

create policy "rsvps_update"
on public.rsvps
for update
to authenticated
using (
  user_id = auth.uid()
  or public.can_manage_event(event_id)
)
with check (
  user_id = auth.uid()
  or public.can_manage_event(event_id)
);

create policy "rsvps_delete"
on public.rsvps
for delete
to authenticated
using (
  user_id = auth.uid()
  or public.can_manage_event(event_id)
);

create policy "event_comments_select"
on public.event_comments
for select
using (true);

create policy "event_comments_insert"
on public.event_comments
for insert
to authenticated
with check (user_id = auth.uid());

create policy "event_comments_update"
on public.event_comments
for update
to authenticated
using (
  user_id = auth.uid()
  or public.can_manage_event(event_id)
)
with check (
  user_id = auth.uid()
  or public.can_manage_event(event_id)
);

create policy "event_comments_delete"
on public.event_comments
for delete
to authenticated
using (
  user_id = auth.uid()
  or public.can_manage_event(event_id)
);

create policy "event_ratings_select"
on public.event_ratings
for select
using (true);

create policy "event_ratings_insert"
on public.event_ratings
for insert
to authenticated
with check (user_id = auth.uid());

create policy "event_ratings_update"
on public.event_ratings
for update
to authenticated
using (
  user_id = auth.uid()
  or public.can_manage_event(event_id)
)
with check (
  user_id = auth.uid()
  or public.can_manage_event(event_id)
);

create policy "event_ratings_delete"
on public.event_ratings
for delete
to authenticated
using (
  user_id = auth.uid()
  or public.can_manage_event(event_id)
);

create policy "discussions_select"
on public.discussions
for select
using (
  public.can_manage_group(group_id)
  or public.is_group_member(group_id)
  or exists (
    select 1
    from public.groups g
    where g.id = group_id
      and g.status = 'active'
  )
);

create policy "discussions_insert"
on public.discussions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (public.is_group_member(group_id) or public.can_manage_group(group_id))
);

create policy "discussions_update"
on public.discussions
for update
to authenticated
using (
  user_id = auth.uid()
  or public.can_manage_group(group_id)
)
with check (
  user_id = auth.uid()
  or public.can_manage_group(group_id)
);

create policy "discussions_delete"
on public.discussions
for delete
to authenticated
using (
  user_id = auth.uid()
  or public.can_manage_group(group_id)
);

create policy "discussion_replies_select"
on public.discussion_replies
for select
using (true);

create policy "discussion_replies_insert"
on public.discussion_replies
for insert
to authenticated
with check (user_id = auth.uid());

create policy "discussion_replies_update"
on public.discussion_replies
for update
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.discussions d
    where d.id = discussion_id
      and public.can_manage_group(d.group_id)
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.discussions d
    where d.id = discussion_id
      and public.can_manage_group(d.group_id)
  )
);

create policy "discussion_replies_delete"
on public.discussion_replies
for delete
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.discussions d
    where d.id = discussion_id
      and public.can_manage_group(d.group_id)
  )
);

create policy "venue_reviews_select"
on public.venue_reviews
for select
using (true);

create policy "venue_reviews_insert"
on public.venue_reviews
for insert
to authenticated
with check (reviewer_id = auth.uid());

create policy "venue_reviews_update"
on public.venue_reviews
for update
to authenticated
using (
  reviewer_id = auth.uid()
  or public.can_manage_venue(venue_id)
)
with check (
  reviewer_id = auth.uid()
  or public.can_manage_venue(venue_id)
);

create policy "venue_reviews_delete"
on public.venue_reviews
for delete
to authenticated
using (
  reviewer_id = auth.uid()
  or public.can_manage_venue(venue_id)
  or public.is_admin()
);

create policy "venue_bookings_select"
on public.venue_bookings
for select
to authenticated
using (
  organizer_id = auth.uid()
  or public.can_manage_venue(venue_id)
  or public.is_admin()
);

create policy "venue_bookings_insert"
on public.venue_bookings
for insert
to authenticated
with check (
  organizer_id = auth.uid()
  and public.current_account_type() in ('organizer', 'admin')
);

create policy "venue_bookings_update"
on public.venue_bookings
for update
to authenticated
using (
  organizer_id = auth.uid()
  or public.can_manage_venue(venue_id)
  or public.is_admin()
)
with check (
  organizer_id = auth.uid()
  or public.can_manage_venue(venue_id)
  or public.is_admin()
);

create policy "notifications_select"
on public.notifications
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "notifications_insert"
on public.notifications
for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

create policy "notifications_update"
on public.notifications
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "messages_select"
on public.messages
for select
to authenticated
using (
  sender_id = auth.uid()
  or receiver_id = auth.uid()
  or public.is_admin()
);

create policy "messages_insert"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  or public.is_admin()
);

create policy "messages_update"
on public.messages
for update
to authenticated
using (
  sender_id = auth.uid()
  or receiver_id = auth.uid()
  or public.is_admin()
)
with check (
  sender_id = auth.uid()
  or receiver_id = auth.uid()
  or public.is_admin()
);

create policy "transactions_select"
on public.transactions
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

create policy "transactions_insert"
on public.transactions
for insert
to authenticated
with check (
  user_id = auth.uid()
  or public.is_admin()
);

create policy "transactions_update"
on public.transactions
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin_audit_log_admin_only"
on public.admin_audit_log
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "platform_settings_admin_only"
on public.platform_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "event_templates_select_public"
on public.event_templates
for select
using (is_active);

create policy "event_templates_admin_write"
on public.event_templates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.categories (
  id, name_en, name_is, slug, icon_letter, bg_color, text_color, description_en, description_is, sort_order
) values
  ('00000000-0000-0000-0000-000000000001', 'Nightlife', 'Næturlíf', 'nightlife', 'N', '#EDE9FE', '#5B21B6', 'Late nights, mixers, bars, and social city energy.', 'Kvöldlíf, hittingar, barir og félagslegt borgarlíf.', 1),
  ('00000000-0000-0000-0000-000000000002', 'Outdoors', 'Útivist', 'outdoors', 'O', '#D4E4D7', '#2D5F3A', 'Hikes, walks, cold dips, and outdoor adventures.', 'Göngur, útivera, sjóböð og útivistarævintýri.', 2),
  ('00000000-0000-0000-0000-000000000003', 'Social', 'Félagslíf', 'social', 'S', '#FDE8E4', '#B33D2C', 'Casual social gatherings and easy meetups.', 'Afslappaðar samkomur og auðveld kynni.', 3),
  ('00000000-0000-0000-0000-000000000004', 'Tech', 'Tækni', 'tech', 'T', '#C7D2FE', '#3730A3', 'Developers, founders, operators, and product communities.', 'Forritarar, frumkvöðlar, rekstrarfólk og tæknisamfélög.', 4),
  ('00000000-0000-0000-0000-000000000005', 'Arts', 'Listir', 'arts', 'A', '#FEF3C7', '#92400E', 'Creative practice, exhibitions, and performance culture.', 'Sköpun, sýningar og menningartengdir viðburðir.', 5),
  ('00000000-0000-0000-0000-000000000006', 'Food', 'Matur', 'food', 'F', '#FFEDD5', '#9A3412', 'Dining clubs, tastings, brunches, and city flavors.', 'Matarhópar, smakk, brunch og bragð Reykjavíkur.', 6),
  ('00000000-0000-0000-0000-000000000007', 'Language', 'Tungumál', 'language', 'L', '#E0E7FF', '#3730A3', 'Language exchange and cross-cultural conversation.', 'Tungumálaskipti og fjölmenningarleg samtöl.', 7),
  ('00000000-0000-0000-0000-000000000008', 'Expat', 'Alþjóðlegt samfélag', 'expat', 'E', '#FCE7F3', '#9D174D', 'New-in-town communities and international life.', 'Samfélag nýrra íbúa og alþjóðlegs borgarlífs.', 8),
  ('00000000-0000-0000-0000-000000000009', 'Sports', 'Íþróttir', 'sports', 'P', '#D1FAE5', '#065F46', 'Training, clubs, movement, and active routines.', 'Æfingar, klúbbar, hreyfing og virkt daglegt líf.', 9),
  ('00000000-0000-0000-0000-000000000010', 'Professional', 'Faglegt tengslanet', 'professional', 'R', '#F1F5F9', '#475569', 'Industry circles, networking, and career growth.', 'Fagleg samfélög, tengslamyndun og starfsþróun.', 10),
  ('00000000-0000-0000-0000-000000000011', 'Music', 'Tónlist', 'music', 'M', '#EDE9FE', '#5B21B6', 'Listening sessions, live shows, and scene discovery.', 'Hlustun, tónleikar og uppgötvun á tónlistarsenunni.', 11),
  ('00000000-0000-0000-0000-000000000012', 'Wellness', 'Vellíðan', 'wellness', 'W', '#D4E4D7', '#2D5F3A', 'Wellbeing, yoga, mindfulness, and recovery.', 'Vellíðan, jóga, núvitund og endurheimt.', 12),
  ('00000000-0000-0000-0000-000000000013', 'Books', 'Bækur', 'books', 'B', '#FEF3C7', '#92400E', 'Reading circles, writing rooms, and literary evenings.', 'Leshringir, skrifstofur og bókmenntakvöld.', 13),
  ('00000000-0000-0000-0000-000000000014', 'Family', 'Fjölskylda', 'family', 'F', '#FFEDD5', '#9A3412', 'Family-friendly gatherings and community activities.', 'Fjölskylduvænar samkomur og samfélagsviðburðir.', 14),
  ('00000000-0000-0000-0000-000000000015', 'Gaming', 'Leikir', 'gaming', 'G', '#E0E7FF', '#3730A3', 'Board games, tabletop, and friendly competition.', 'Borðspil, hlutverkaspil og létt keppni.', 15)
on conflict (id) do update
set
  name_en = excluded.name_en,
  name_is = excluded.name_is,
  slug = excluded.slug,
  icon_letter = excluded.icon_letter,
  bg_color = excluded.bg_color,
  text_color = excluded.text_color,
  description_en = excluded.description_en,
  description_is = excluded.description_is,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.event_templates (
  id, name, description_en, description_is, category_id, best_venue_type, best_time, suggested_capacity, amenities_needed, is_active
) values
  ('10000000-0000-0000-0000-000000000001', 'Pub Quiz Night', 'A recurring trivia format with teams, prizes, and easy sponsor tie-ins.', 'Endurtekið pub quiz kvöld með liðum, verðlaunum og einföldum samstarfsaðilum.', '00000000-0000-0000-0000-000000000003', 'bar', 'Weekday evening', '40-90', array['projector', 'microphone'], true),
  ('10000000-0000-0000-0000-000000000002', 'Singles Night', 'Structured social night with check-in flow and low-friction matching.', 'Skipulagt kvöld fyrir einhleypa með skráningu og mjúkri tengslamyndun.', '00000000-0000-0000-0000-000000000001', 'bar', 'Friday evening', '50-120', array['bar', 'host desk'], true),
  ('10000000-0000-0000-0000-000000000003', 'Language Exchange', 'Hosted conversation circles with simple table prompts and rotation.', 'Tungumálaskipti með umræðuborðum og einfaldri hringrás.', '00000000-0000-0000-0000-000000000007', 'cafe', 'Weekday evening', '20-45', array['quiet space', 'tea'], true),
  ('10000000-0000-0000-0000-000000000004', 'Coffee and Conversation', 'Low-pressure morning meetup for newcomers and regulars.', 'Lágstemmdur morgunhittingur fyrir nýja og vana þátttakendur.', '00000000-0000-0000-0000-000000000003', 'cafe', 'Weekend morning', '15-35', array['coffee', 'seating'], true),
  ('10000000-0000-0000-0000-000000000005', 'Board Game Night', 'Social tabletop night with host-led game tables and rotating groups.', 'Félagslegt borðspilakvöld með gestgjafa og skiptum á borðum.', '00000000-0000-0000-0000-000000000015', 'cafe', 'Weekday evening', '20-50', array['tables', 'games'], true),
  ('10000000-0000-0000-0000-000000000006', 'Women in Tech Breakfast', 'Focused networking breakfast for operators, founders, and engineers.', 'Markviss morgunverðarsamvera fyrir frumkvöðla, stjórnendur og verkfræðinga.', '00000000-0000-0000-0000-000000000004', 'coworking', 'Weekday morning', '20-60', array['projector', 'coffee'], true),
  ('10000000-0000-0000-0000-000000000007', 'Startup Demo Night', 'Short product demos followed by networking and venue partner offers.', 'Stuttar kynningar á vörum með tengslamyndun og tilboðum frá samstarfsstöðum.', '00000000-0000-0000-0000-000000000004', 'coworking', 'Thursday evening', '40-100', array['projector', 'microphone'], true),
  ('10000000-0000-0000-0000-000000000008', 'Running Club Meetup', 'Community run with a social warmup and optional coffee after.', 'Hlaupaklúbbur með sameiginlegri upphitun og kaffistoppi eftir á.', '00000000-0000-0000-0000-000000000009', 'outdoor', 'Weekday morning', '10-35', array['water'], true),
  ('10000000-0000-0000-0000-000000000009', 'Morning Yoga Flow', 'Small-group yoga with premium venue positioning and calm pacing.', 'Jógatími í litlum hópi með rólegum takti og vönduðu umhverfi.', '00000000-0000-0000-0000-000000000012', 'studio', 'Weekend morning', '10-24', array['mats', 'sound system'], true),
  ('10000000-0000-0000-0000-000000000010', 'Photography Walk', 'City walk with prompts, stop points, and an optional gallery finish.', 'Ljósmyndaganga um borgina með verkefnum og mögulegri lokaáfanga á sýningu.', '00000000-0000-0000-0000-000000000005', 'outdoor', 'Golden hour', '12-30', array['walking route'], true),
  ('10000000-0000-0000-0000-000000000011', 'Open Mic Session', 'Creator-friendly performance night for music, poetry, or comedy.', 'Opin sviðskynning fyrir tónlist, ljóð eða uppistand.', '00000000-0000-0000-0000-000000000011', 'bar', 'Late evening', '30-80', array['microphone', 'small stage'], true),
  ('10000000-0000-0000-0000-000000000012', 'Wine Tasting', 'Guided tasting with pairings, pacing, and optional premium ticket tiers.', 'Leidd vínsmökkun með pörunum, góðum takti og mögulegum miðaflokkum.', '00000000-0000-0000-0000-000000000006', 'restaurant', 'Evening', '18-40', array['seated tasting', 'glassware'], true),
  ('10000000-0000-0000-0000-000000000013', 'Book Club Evening', 'Moderated reading discussion with repeat attendance and notes.', 'Stýrður leshringur með umræðu og endurkomu þátttakenda.', '00000000-0000-0000-0000-000000000013', 'cafe', 'Weekday evening', '12-28', array['quiet space'], true),
  ('10000000-0000-0000-0000-000000000014', 'Coding Workshop', 'Hands-on workshop with clear learning goals and practical outcomes.', 'Verkstæði með skýrum námsmarkmiðum og raunhæfum niðurstöðum.', '00000000-0000-0000-0000-000000000004', 'coworking', 'Weekday evening', '15-45', array['wifi', 'projector'], true),
  ('10000000-0000-0000-0000-000000000015', 'Networking Mixer', 'Semi-structured networking with host prompts and premium venue ties.', 'Hálfskipulögð tengslamyndun með umræðuefnum og tengingu við staði.', '00000000-0000-0000-0000-000000000010', 'bar', 'After work', '40-120', array['name tags', 'host'], true),
  ('10000000-0000-0000-0000-000000000016', 'Hike and Hot Chocolate', 'Accessible outdoor meetup with a cozy finish point and repeatability.', 'Aðgengileg útivistarferð með notalegum lokaáfanga og reglulegri endurtekningu.', '00000000-0000-0000-0000-000000000002', 'outdoor', 'Weekend afternoon', '12-35', array['walking route', 'warm drinks'], true),
  ('10000000-0000-0000-0000-000000000017', 'Brunch Social', 'Late-morning social event that works well for new members.', 'Seinnibrunch hittingur sem hentar vel nýjum meðlimum.', '00000000-0000-0000-0000-000000000006', 'restaurant', 'Weekend late morning', '20-60', array['tables', 'set menu'], true),
  ('10000000-0000-0000-0000-000000000018', 'Creative Meetup', 'Bring-your-own-project meetup for artists, makers, and designers.', 'Komdu með þitt verkefni hittingur fyrir listafólk, hönnuði og skapandi fólk.', '00000000-0000-0000-0000-000000000005', 'studio', 'Weekday evening', '15-40', array['tables', 'power'], true),
  ('10000000-0000-0000-0000-000000000019', 'Expat Welcome Night', 'A recurring welcome night for people new to the city and country.', 'Reglulegt velkomukvöld fyrir fólk sem er nýtt í borginni og á landinu.', '00000000-0000-0000-0000-000000000008', 'bar', 'Wednesday evening', '30-90', array['host desk', 'conversation prompts'], true),
  ('10000000-0000-0000-0000-000000000020', 'Professional Panel', 'Expert-led conversation with moderated Q&A and premium seating.', 'Sérfræðingaspjall með stýrðri umræðu og fyrirspurnum.', '00000000-0000-0000-0000-000000000010', 'coworking', 'Weekday evening', '35-80', array['projector', 'microphone', 'seating'], true)
on conflict (id) do update
set
  name = excluded.name,
  description_en = excluded.description_en,
  description_is = excluded.description_is,
  category_id = excluded.category_id,
  best_venue_type = excluded.best_venue_type,
  best_time = excluded.best_time,
  suggested_capacity = excluded.suggested_capacity,
  amenities_needed = excluded.amenities_needed,
  is_active = excluded.is_active;
