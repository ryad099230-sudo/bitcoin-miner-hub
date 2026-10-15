
-- ===== Enums =====
create type public.app_role as enum ('admin','user');
create type public.deposit_status as enum ('created','awaiting_payment','detected','confirming','confirmed','rejected','expired');
create type public.withdrawal_status as enum ('requested','approved','broadcast','completed','rejected','cancelled');
create type public.commission_status as enum ('pending','approved','paid','reversed');
create type public.ledger_kind as enum ('deposit','withdrawal_reserve','withdrawal_release','distribution','commission','adjustment');

-- ===== Profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  referral_code text not null unique,
  referred_by uuid references public.profiles(id),
  verification_status text not null default 'unverified',
  account_status text not null default 'active',
  created_at timestamptz not null default now(),
  constraint no_self_ref check (referred_by is null or referred_by <> id)
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- users may only change full_name
create or replace function public.protect_profile_fields() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if public.has_role(auth.uid(),'admin') or auth.uid() is null then return new; end if;
  new.referral_code := old.referral_code; new.referred_by := old.referred_by;
  new.verification_status := old.verification_status; new.account_status := old.account_status;
  new.email := old.email; new.created_at := old.created_at;
  return new;
end $$;
create trigger trg_protect_profile before update on public.profiles for each row execute function public.protect_profile_fields();

-- ===== Settings (single row) =====
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  brand_name text not null default 'Bitcoin Mining Investment',
  calculator_monthly_rate numeric(8,6) not null default 0.01 check (calculator_monthly_rate >= 0 and calculator_monthly_rate <= 0.2),
  referral_rate numeric(8,6) not null default 0.01 check (referral_rate >= 0 and referral_rate <= 0.1),
  min_investment_usd numeric(20,2) not null default 10,
  deposits_enabled boolean not null default false,
  withdrawals_enabled boolean not null default false,
  payment_provider text not null default 'manual_review',
  payment_provider_configured boolean not null default false,
  supported_jurisdictions text not null default '',
  eligibility_notes text not null default '',
  environment_label text not null default 'setup',
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1);
grant select on public.site_settings to anon, authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);

-- ===== Networks =====
create table public.supported_networks (
  id uuid primary key default gen_random_uuid(),
  asset text not null check (asset in ('BTC','USDT')),
  network text not null,
  label text not null,
  decimals int not null check (decimals between 0 and 18),
  deposit_address text,
  required_confirmations int not null default 3 check (required_confirmations >= 0),
  min_deposit numeric(36,18) not null default 0,
  min_withdrawal numeric(36,18) not null default 0,
  withdrawal_fee numeric(36,18) not null default 0,
  enabled boolean not null default false,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (asset, network)
);
insert into public.supported_networks (asset, network, label, decimals) values
 ('BTC','bitcoin','Bitcoin (BTC)',8),
 ('USDT','tron','USDT · TRON (TRC-20)',6),
 ('USDT','ethereum','USDT · Ethereum (ERC-20)',6);
grant select on public.supported_networks to anon, authenticated;
grant all on public.supported_networks to service_role;
alter table public.supported_networks enable row level security;
create policy "read enabled networks" on public.supported_networks for select to anon, authenticated using (enabled and verified or public.has_role(auth.uid(),'admin'));

-- ===== Ledger (append-only, USD) =====
create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind ledger_kind not null,
  amount_usd numeric(20,2) not null,
  ref_type text not null,
  ref_id uuid not null,
  note text,
  created_at timestamptz not null default now(),
  unique (kind, ref_type, ref_id)
);
create index on public.ledger_entries(user_id);
grant select on public.ledger_entries to authenticated;
grant all on public.ledger_entries to service_role;
alter table public.ledger_entries enable row level security;
create policy "own ledger" on public.ledger_entries for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create or replace function public.ledger_immutable() returns trigger language plpgsql as $$
begin raise exception 'ledger entries are immutable'; end $$;
create trigger trg_ledger_immutable before update or delete on public.ledger_entries for each row execute function public.ledger_immutable();

create or replace function public.user_available_balance(_uid uuid) returns numeric language sql stable security definer set search_path=public as $$
  select coalesce(sum(amount_usd),0)::numeric(20,2) from public.ledger_entries where user_id = _uid
$$;

-- ===== Deposits =====
create table public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  network_id uuid not null references public.supported_networks(id),
  asset text not null,
  network text not null,
  reference text not null unique,
  destination_address text not null,
  expected_amount numeric(36,18) not null check (expected_amount > 0),
  received_amount numeric(36,18),
  usd_value numeric(20,2),
  tx_hash text,
  confirmations int not null default 0,
  status deposit_status not null default 'awaiting_payment',
  reviewed_by uuid,
  reject_reason text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours',
  confirmed_at timestamptz
);
create unique index deposits_tx_unique on public.deposits(network, tx_hash) where tx_hash is not null;
create index on public.deposits(user_id);
grant select on public.deposits to authenticated;
grant all on public.deposits to service_role;
alter table public.deposits enable row level security;
create policy "own deposits" on public.deposits for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- processed external events (webhook idempotency)
create table public.processed_chain_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  received_at timestamptz not null default now(),
  unique (provider, event_id)
);
grant all on public.processed_chain_events to service_role;
alter table public.processed_chain_events enable row level security;

-- ===== Withdrawals =====
create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  network_id uuid not null references public.supported_networks(id),
  asset text not null,
  network text not null,
  destination_address text not null,
  amount_usd numeric(20,2) not null check (amount_usd > 0),
  fee_usd numeric(20,2) not null default 0,
  client_request_id uuid not null unique,
  status withdrawal_status not null default 'requested',
  tx_hash text,
  reviewed_by uuid,
  reject_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.withdrawals(user_id);
grant select on public.withdrawals to authenticated;
grant all on public.withdrawals to service_role;
alter table public.withdrawals enable row level security;
create policy "own withdrawals" on public.withdrawals for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- ===== Referral commissions =====
create table public.referral_commissions (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null,
  referred_id uuid not null,
  source_deposit_id uuid not null unique references public.deposits(id),
  basis_usd numeric(20,2) not null,
  rate numeric(8,6) not null,
  amount_usd numeric(20,2) not null,
  status commission_status not null default 'pending',
  reviewed_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (referrer_id <> referred_id)
);
grant select on public.referral_commissions to authenticated;
grant all on public.referral_commissions to service_role;
alter table public.referral_commissions enable row level security;
create policy "own commissions" on public.referral_commissions for select to authenticated using (referrer_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- referred list (limited fields) via function
create or replace function public.my_referral_stats() returns json language sql stable security definer set search_path=public as $$
  select json_build_object(
    'registrations', (select count(*) from public.profiles where referred_by = auth.uid()),
    'eligible', (select count(distinct referred_id) from public.referral_commissions where referrer_id = auth.uid() and status <> 'reversed'),
    'volume', (select coalesce(sum(basis_usd),0) from public.referral_commissions where referrer_id = auth.uid() and status <> 'reversed'),
    'pending', (select coalesce(sum(amount_usd),0) from public.referral_commissions where referrer_id = auth.uid() and status='pending'),
    'approved', (select coalesce(sum(amount_usd),0) from public.referral_commissions where referrer_id = auth.uid() and status='approved'),
    'paid', (select coalesce(sum(amount_usd),0) from public.referral_commissions where referrer_id = auth.uid() and status='paid')
  )
$$;

-- ===== Mining ops =====
create table public.mining_equipment (
  id uuid primary key default gen_random_uuid(),
  model text not null,
  serial_number text,
  location text,
  status text not null default 'active' check (status in ('active','maintenance','offline','retired')),
  hashrate_ths numeric(14,3),
  power_watts int,
  notes text,
  created_at timestamptz not null default now()
);
create table public.mining_reports (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  pool_name text,
  btc_mined numeric(24,8) not null default 0,
  pool_fees_btc numeric(24,8) not null default 0,
  avg_hashrate_ths numeric(14,3),
  uptime_pct numeric(5,2),
  btc_usd_price numeric(20,2),
  price_timestamp timestamptz,
  source text not null default 'manual',
  published boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  check (period_end >= period_start)
);
create table public.mining_expenses (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.mining_reports(id) on delete set null,
  category text not null check (category in ('electricity','maintenance','hosting','other')),
  amount_usd numeric(20,2) not null check (amount_usd >= 0),
  incurred_on date not null,
  description text,
  created_by uuid,
  created_at timestamptz not null default now()
);
create table public.revenue_distributions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.mining_reports(id),
  user_id uuid not null,
  amount_usd numeric(20,2) not null check (amount_usd > 0),
  status text not null default 'recorded',
  created_by uuid,
  created_at timestamptz not null default now()
);
grant all on public.mining_equipment, public.mining_reports, public.mining_expenses, public.revenue_distributions to service_role;
grant select, insert, update, delete on public.mining_equipment, public.mining_reports, public.mining_expenses to authenticated;
grant select on public.revenue_distributions to authenticated;
grant select on public.mining_reports to anon;
alter table public.mining_equipment enable row level security;
alter table public.mining_reports enable row level security;
alter table public.mining_expenses enable row level security;
alter table public.revenue_distributions enable row level security;
create policy "admin equipment" on public.mining_equipment for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin reports" on public.mining_reports for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "published reports" on public.mining_reports for select to anon, authenticated using (published);
create policy "admin expenses" on public.mining_expenses for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "own distributions" on public.revenue_distributions for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- ===== Notifications & audit =====
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  body text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "mark read" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "admin audit" on public.audit_logs for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.write_audit(_action text, _ttype text, _tid text, _details jsonb) returns void
language sql security definer set search_path=public as $$
  insert into public.audit_logs(actor_id, action, target_type, target_id, details) values (auth.uid(), _action, _ttype, _tid, coalesce(_details,'{}'::jsonb))
$$;
revoke execute on function public.write_audit(text,text,text,jsonb) from public, anon, authenticated;

-- ===== Signup trigger =====
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare _code text; _ref uuid; _given text;
begin
  loop
    _code := upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
    exit when not exists (select 1 from public.profiles where referral_code = _code);
  end loop;
  _given := upper(trim(coalesce(new.raw_user_meta_data->>'referral_code','')));
  if _given <> '' then select id into _ref from public.profiles where referral_code = _given; end if;
  insert into public.profiles(id, full_name, email, referral_code, referred_by)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email, _code, _ref);
  insert into public.user_roles(user_id, role) values (new.id, 'user');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ===== RPCs =====
create or replace function public.create_deposit(_network_id uuid, _amount numeric) returns public.deposits
language plpgsql security definer set search_path=public as $$
declare n public.supported_networks; s public.site_settings; d public.deposits; recent int;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into s from public.site_settings where id=1;
  if not s.deposits_enabled then raise exception 'deposits are not enabled yet'; end if;
  select * into n from public.supported_networks where id=_network_id;
  if n.id is null or not n.enabled or not n.verified or coalesce(n.deposit_address,'')='' then raise exception 'network not available'; end if;
  if _amount is null or _amount <= 0 or _amount < n.min_deposit or _amount > 1000000 then raise exception 'invalid amount'; end if;
  if round(_amount, n.decimals) <> _amount then raise exception 'too many decimals'; end if;
  select count(*) into recent from public.deposits where user_id=auth.uid() and created_at > now() - interval '1 hour';
  if recent >= 10 then raise exception 'rate limit: too many deposit requests'; end if;
  insert into public.deposits(user_id, network_id, asset, network, reference, destination_address, expected_amount)
  values (auth.uid(), n.id, n.asset, n.network, 'DEP-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)), n.deposit_address, _amount)
  returning * into d;
  return d;
end $$;

create or replace function public.admin_confirm_deposit(_deposit_id uuid, _tx_hash text, _received numeric, _usd_value numeric) returns void
language plpgsql security definer set search_path=public as $$
declare d public.deposits; p public.profiles; s public.site_settings;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  if coalesce(trim(_tx_hash),'')='' or _usd_value is null or _usd_value <= 0 or _received is null or _received <= 0 then raise exception 'tx hash, received amount and USD value are required'; end if;
  select * into d from public.deposits where id=_deposit_id for update;
  if d.id is null then raise exception 'not found'; end if;
  if d.status = 'confirmed' then raise exception 'already confirmed'; end if;
  if d.status in ('rejected','expired') then raise exception 'deposit is closed'; end if;
  update public.deposits set status='confirmed', tx_hash=trim(_tx_hash), received_amount=_received, usd_value=round(_usd_value,2), confirmed_at=now(), reviewed_by=auth.uid() where id=d.id;
  insert into public.ledger_entries(user_id, kind, amount_usd, ref_type, ref_id, note) values (d.user_id,'deposit',round(_usd_value,2),'deposit',d.id,d.reference);
  select * into p from public.profiles where id=d.user_id;
  select * into s from public.site_settings where id=1;
  if p.referred_by is not null and p.referred_by <> p.id then
    insert into public.referral_commissions(referrer_id, referred_id, source_deposit_id, basis_usd, rate, amount_usd)
    values (p.referred_by, p.id, d.id, round(_usd_value,2), s.referral_rate, round(round(_usd_value,2) * s.referral_rate, 2))
    on conflict (source_deposit_id) do nothing;
  end if;
  insert into public.notifications(user_id, title, body) values (d.user_id, 'Deposit confirmed', d.reference || ' · $' || round(_usd_value,2));
  perform public.write_audit('deposit.confirm','deposit',d.id::text, jsonb_build_object('tx',_tx_hash,'usd',_usd_value,'received',_received));
end $$;

create or replace function public.admin_reject_deposit(_deposit_id uuid, _reason text) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  update public.deposits set status='rejected', reject_reason=_reason, reviewed_by=auth.uid() where id=_deposit_id and status not in ('confirmed','rejected');
  if not found then raise exception 'cannot reject'; end if;
  perform public.write_audit('deposit.reject','deposit',_deposit_id::text, jsonb_build_object('reason',_reason));
end $$;

create or replace function public.request_withdrawal(_network_id uuid, _address text, _amount numeric, _client_request_id uuid) returns public.withdrawals
language plpgsql security definer set search_path=public as $$
declare n public.supported_networks; s public.site_settings; w public.withdrawals; bal numeric; pending int;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into w from public.withdrawals where client_request_id=_client_request_id;
  if w.id is not null then
    if w.user_id <> auth.uid() then raise exception 'invalid request id'; end if;
    return w;
  end if;
  select * into s from public.site_settings where id=1;
  if not s.withdrawals_enabled then raise exception 'withdrawals are not enabled yet'; end if;
  select * into n from public.supported_networks where id=_network_id;
  if n.id is null or not n.enabled or not n.verified then raise exception 'network not available'; end if;
  _address := trim(coalesce(_address,''));
  if length(_address) < 20 or length(_address) > 120 or _address !~ '^[A-Za-z0-9]+$' then raise exception 'invalid address'; end if;
  if _amount is null or _amount <= 0 or round(_amount,2) <> _amount then raise exception 'invalid amount'; end if;
  if _amount < n.min_withdrawal then raise exception 'below minimum'; end if;
  perform 1 from public.profiles where id=auth.uid() for update; -- serialize per user
  select count(*) into pending from public.withdrawals where user_id=auth.uid() and status in ('requested','approved');
  if pending >= 3 then raise exception 'too many pending withdrawals'; end if;
  bal := public.user_available_balance(auth.uid());
  if _amount + round(n.withdrawal_fee,2) > bal then raise exception 'insufficient balance'; end if;
  insert into public.withdrawals(user_id, network_id, asset, network, destination_address, amount_usd, fee_usd, client_request_id)
  values (auth.uid(), n.id, n.asset, n.network, _address, _amount, round(n.withdrawal_fee,2), _client_request_id) returning * into w;
  insert into public.ledger_entries(user_id, kind, amount_usd, ref_type, ref_id) values (auth.uid(),'withdrawal_reserve', -(w.amount_usd + w.fee_usd),'withdrawal',w.id);
  return w;
end $$;

create or replace function public.admin_update_withdrawal(_id uuid, _status withdrawal_status, _tx_hash text, _reason text) returns void
language plpgsql security definer set search_path=public as $$
declare w public.withdrawals;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  select * into w from public.withdrawals where id=_id for update;
  if w.id is null then raise exception 'not found'; end if;
  if w.status in ('completed','rejected','cancelled') then raise exception 'withdrawal is closed'; end if;
  if _status = 'approved' and w.status <> 'requested' then raise exception 'invalid transition'; end if;
  if _status in ('broadcast','completed') and coalesce(trim(_tx_hash), w.tx_hash, '') = '' then raise exception 'tx hash required'; end if;
  if _status = 'broadcast' and w.status <> 'approved' then raise exception 'approve first'; end if;
  update public.withdrawals set status=_status, tx_hash=coalesce(nullif(trim(_tx_hash),''), tx_hash), reject_reason=_reason, reviewed_by=auth.uid(), updated_at=now() where id=_id;
  if _status in ('rejected','cancelled') then
    insert into public.ledger_entries(user_id, kind, amount_usd, ref_type, ref_id) values (w.user_id,'withdrawal_release', w.amount_usd + w.fee_usd,'withdrawal',w.id);
  end if;
  insert into public.notifications(user_id, title, body) values (w.user_id, 'Withdrawal ' || _status, '$' || w.amount_usd);
  perform public.write_audit('withdrawal.' || _status,'withdrawal',_id::text, jsonb_build_object('tx',_tx_hash,'reason',_reason));
end $$;

create or replace function public.admin_set_commission_status(_id uuid, _status commission_status) returns void
language plpgsql security definer set search_path=public as $$
declare c public.referral_commissions;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  select * into c from public.referral_commissions where id=_id for update;
  if c.id is null then raise exception 'not found'; end if;
  if c.status in ('paid','reversed') then raise exception 'commission is closed'; end if;
  if _status='approved' and c.status<>'pending' then raise exception 'invalid transition'; end if;
  if _status='paid' and c.status<>'approved' then raise exception 'approve first'; end if;
  update public.referral_commissions set status=_status, reviewed_by=auth.uid(), updated_at=now() where id=_id;
  if _status='paid' then
    insert into public.ledger_entries(user_id, kind, amount_usd, ref_type, ref_id) values (c.referrer_id,'commission',c.amount_usd,'commission',c.id);
  end if;
  perform public.write_audit('commission.' || _status,'commission',_id::text,'{}');
end $$;

create or replace function public.admin_record_distribution(_user_id uuid, _report_id uuid, _amount numeric) returns void
language plpgsql security definer set search_path=public as $$
declare rid uuid;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  if _amount is null or _amount <= 0 or round(_amount,2) <> _amount then raise exception 'invalid amount'; end if;
  insert into public.revenue_distributions(report_id, user_id, amount_usd, created_by) values (_report_id, _user_id, _amount, auth.uid()) returning id into rid;
  insert into public.ledger_entries(user_id, kind, amount_usd, ref_type, ref_id) values (_user_id,'distribution',_amount,'distribution',rid);
  perform public.write_audit('distribution.record','user',_user_id::text, jsonb_build_object('amount',_amount,'report',_report_id));
end $$;

create or replace function public.admin_update_settings(_patch jsonb) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  update public.site_settings set
    brand_name = coalesce(_patch->>'brand_name', brand_name),
    calculator_monthly_rate = coalesce((_patch->>'calculator_monthly_rate')::numeric, calculator_monthly_rate),
    referral_rate = coalesce((_patch->>'referral_rate')::numeric, referral_rate),
    min_investment_usd = coalesce((_patch->>'min_investment_usd')::numeric, min_investment_usd),
    deposits_enabled = coalesce((_patch->>'deposits_enabled')::boolean, deposits_enabled),
    withdrawals_enabled = coalesce((_patch->>'withdrawals_enabled')::boolean, withdrawals_enabled),
    payment_provider = coalesce(_patch->>'payment_provider', payment_provider),
    supported_jurisdictions = coalesce(_patch->>'supported_jurisdictions', supported_jurisdictions),
    eligibility_notes = coalesce(_patch->>'eligibility_notes', eligibility_notes),
    environment_label = coalesce(_patch->>'environment_label', environment_label),
    updated_at = now()
  where id=1;
  perform public.write_audit('settings.update','site_settings','1',_patch);
end $$;

create or replace function public.admin_update_network(_id uuid, _patch jsonb) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  update public.supported_networks set
    deposit_address = coalesce(_patch->>'deposit_address', deposit_address),
    required_confirmations = coalesce((_patch->>'required_confirmations')::int, required_confirmations),
    min_deposit = coalesce((_patch->>'min_deposit')::numeric, min_deposit),
    min_withdrawal = coalesce((_patch->>'min_withdrawal')::numeric, min_withdrawal),
    withdrawal_fee = coalesce((_patch->>'withdrawal_fee')::numeric, withdrawal_fee),
    enabled = coalesce((_patch->>'enabled')::boolean, enabled),
    verified = coalesce((_patch->>'verified')::boolean, verified)
  where id=_id;
  perform public.write_audit('network.update','network',_id::text,_patch);
end $$;

create or replace function public.admin_set_account_status(_user_id uuid, _account text, _verification text) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  if _account not in ('active','suspended') or _verification not in ('unverified','pending','verified','rejected') then raise exception 'invalid status'; end if;
  update public.profiles set account_status=_account, verification_status=_verification where id=_user_id;
  perform public.write_audit('user.status','user',_user_id::text, jsonb_build_object('account',_account,'verification',_verification));
end $$;

create or replace function public.my_summary() returns json language sql stable security definer set search_path=public as $$
  select json_build_object(
    'available', public.user_available_balance(auth.uid()),
    'confirmed_deposits', (select coalesce(sum(usd_value),0) from public.deposits where user_id=auth.uid() and status='confirmed'),
    'pending_deposits', (select count(*) from public.deposits where user_id=auth.uid() and status in ('created','awaiting_payment','detected','confirming')),
    'pending_withdrawals', (select coalesce(sum(amount_usd+fee_usd),0) from public.withdrawals where user_id=auth.uid() and status in ('requested','approved','broadcast')),
    'distributions', (select coalesce(sum(amount_usd),0) from public.revenue_distributions where user_id=auth.uid()),
    'commissions_paid', (select coalesce(sum(amount_usd),0) from public.referral_commissions where referrer_id=auth.uid() and status='paid')
  )
$$;

revoke execute on function public.admin_confirm_deposit, public.admin_reject_deposit, public.admin_update_withdrawal, public.admin_set_commission_status, public.admin_record_distribution, public.admin_update_settings, public.admin_update_network, public.admin_set_account_status, public.create_deposit, public.request_withdrawal, public.my_summary, public.my_referral_stats from anon, public;
grant execute on function public.admin_confirm_deposit, public.admin_reject_deposit, public.admin_update_withdrawal, public.admin_set_commission_status, public.admin_record_distribution, public.admin_update_settings, public.admin_update_network, public.admin_set_account_status, public.create_deposit, public.request_withdrawal, public.my_summary, public.my_referral_stats to authenticated;
revoke execute on function public.user_available_balance(uuid) from anon, public, authenticated;
