create extension if not exists btree_gist;

create table public.owners (
  id uuid primary key default gen_random_uuid(),
  owner_wallet text,
  owner_email text,
  created_at timestamptz not null default now(),
  constraint owners_identity_check check (owner_wallet is not null or owner_email is not null)
);

create table public.ad_blocks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.owners(id) on delete set null,
  order_id text not null unique,
  x integer not null check (x >= 0 and x < 1000),
  y integer not null check (y >= 0 and y < 1000),
  width integer not null check (width > 0 and width <= 1000),
  height integer not null check (height > 0 and height <= 1000),
  unit_count integer generated always as (width * height) stored,
  buyer_label text not null,
  target_url text not null,
  alt_text text not null default '',
  original_upload_url text,
  processed_image_url text,
  creative_background text,
  crop_fit text not null default 'cover' check (crop_fit in ('cover', 'contain')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  status text not null default 'reserved' check (status in ('reserved', 'paid', 'pending_moderation', 'rejected', 'released')),
  transfer_status text not null default 'locked' check (transfer_status in ('locked', 'owned', 'listed', 'transferring')),
  boost_hours integer not null default 72,
  boost_until timestamptz,
  reserved_until timestamptz,
  acquired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ad_blocks_inside_board check (x + width <= 1000 and y + height <= 1000),
  constraint ad_blocks_no_overlap exclude using gist (
    int4range(x, x + width) with &&,
    int4range(y, y + height) with &&
  ) where (status in ('reserved', 'paid', 'pending_moderation'))
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  ad_block_id uuid not null references public.ad_blocks(id) on delete cascade,
  order_id text not null unique,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'USD',
  status text not null default 'pending',
  nowpayments_invoice_id text,
  nowpayments_invoice_url text,
  nowpayments_payment_id text,
  pay_address text,
  pay_currency text,
  actually_paid numeric,
  ipn_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ownership_events (
  id uuid primary key default gen_random_uuid(),
  ad_block_id uuid not null references public.ad_blocks(id) on delete cascade,
  from_owner_id uuid references public.owners(id) on delete set null,
  to_owner_id uuid references public.owners(id) on delete set null,
  event_type text not null check (event_type in ('purchase', 'transfer', 'listing_created', 'listing_cancelled')),
  payment_id uuid references public.payments(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.future_marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  ad_block_id uuid not null references public.ad_blocks(id) on delete cascade,
  seller_owner_id uuid references public.owners(id) on delete set null,
  asking_amount_cents bigint not null check (asking_amount_cents > 0),
  status text not null default 'draft' check (status in ('draft', 'active', 'cancelled', 'sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.owners enable row level security;
alter table public.ad_blocks enable row level security;
alter table public.payments enable row level security;
alter table public.ownership_events enable row level security;
alter table public.future_marketplace_listings enable row level security;

create policy "Public can read paid ad blocks"
  on public.ad_blocks
  for select
  using (status = 'paid' and moderation_status in ('pending', 'approved'));

create policy "Public can read purchase events"
  on public.ownership_events
  for select
  using (event_type = 'purchase');

create or replace function public.get_board_stats()
returns table (
  sold_units bigint,
  reserved_units bigint,
  total_revenue_cents bigint
)
language sql
stable
as $$
  select
    coalesce(sum(unit_count) filter (where status = 'paid'), 0)::bigint as sold_units,
    coalesce(sum(unit_count) filter (where status = 'reserved' and reserved_until > now()), 0)::bigint as reserved_units,
    coalesce((
      select sum(amount_cents)
      from public.payments
      where status in ('confirmed', 'finished')
    ), 0)::bigint as total_revenue_cents
  from public.ad_blocks;
$$;

create or replace function public.reserve_ad_block(
  p_order_id text,
  p_x integer,
  p_y integer,
  p_width integer,
  p_height integer,
  p_buyer_label text,
  p_target_url text,
  p_alt_text text,
  p_crop_fit text,
  p_original_upload_url text,
  p_processed_image_url text,
  p_amount_cents bigint,
  p_expires_minutes integer,
  p_boost_hours integer
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_block_id uuid;
begin
  update public.ad_blocks
  set status = 'released', updated_at = now()
  where status = 'reserved' and reserved_until <= now();

  insert into public.ad_blocks (
    order_id,
    x,
    y,
    width,
    height,
    buyer_label,
    target_url,
    alt_text,
    original_upload_url,
    processed_image_url,
    crop_fit,
    boost_hours,
    reserved_until
  )
  values (
    p_order_id,
    p_x,
    p_y,
    p_width,
    p_height,
    p_buyer_label,
    p_target_url,
    p_alt_text,
    p_original_upload_url,
    p_processed_image_url,
    p_crop_fit,
    p_boost_hours,
    now() + make_interval(mins => p_expires_minutes)
  )
  returning id into v_block_id;

  insert into public.payments (ad_block_id, order_id, amount_cents)
  values (v_block_id, p_order_id, p_amount_cents);

  return v_block_id;
exception
  when exclusion_violation then
    raise exception 'Selected plot overlaps an existing reservation or paid block';
end;
$$;

create or replace function public.complete_nowpayments_order(
  p_order_id text,
  p_status text
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_block_id uuid;
  v_payment_id uuid;
begin
  update public.payments
  set status = p_status, updated_at = now()
  where order_id = p_order_id
  returning ad_block_id, id into v_block_id, v_payment_id;

  if v_block_id is null then
    raise exception 'Payment order not found';
  end if;

  update public.ad_blocks
  set
    status = 'paid',
    transfer_status = 'owned',
    acquired_at = coalesce(acquired_at, now()),
    boost_until = now() + make_interval(hours => boost_hours),
    updated_at = now()
  where id = v_block_id;

  insert into public.ownership_events (ad_block_id, event_type, payment_id)
  values (v_block_id, 'purchase', v_payment_id)
  on conflict do nothing;
end;
$$;

create or replace function public.release_failed_order(
  p_order_id text,
  p_status text
)
returns void
language plpgsql
set search_path = public
as $$
begin
  update public.payments
  set status = p_status, updated_at = now()
  where order_id = p_order_id;

  update public.ad_blocks
  set status = 'released', updated_at = now()
  where order_id = p_order_id and status = 'reserved';
end;
$$;

insert into storage.buckets (id, name, public)
values ('ad-creatives', 'ad-creatives', false)
on conflict (id) do nothing;

revoke execute on function public.reserve_ad_block(
  text,
  integer,
  integer,
  integer,
  integer,
  text,
  text,
  text,
  text,
  text,
  text,
  bigint,
  integer,
  integer
) from anon, authenticated;

revoke execute on function public.complete_nowpayments_order(text, text) from anon, authenticated;
revoke execute on function public.release_failed_order(text, text) from anon, authenticated;
