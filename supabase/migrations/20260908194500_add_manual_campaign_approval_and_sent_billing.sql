begin;

alter table public.campaigns
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.profiles(id),
  add column if not exists sent_at timestamptz,
  add column if not exists sent_by uuid references public.profiles(id),
  add column if not exists billing_completed_at timestamptz;

alter table public.campaigns drop constraint if exists campaigns_status_check;
alter table public.campaigns add constraint campaigns_status_check
  check (status in ('draft', 'processing', 'submitted', 'approved', 'sent', 'completed', 'failed', 'cancelled'));

create index if not exists idx_campaigns_approved_by on public.campaigns (approved_by);
create index if not exists idx_campaigns_sent_by on public.campaigns (sent_by);

update public.campaigns
set status = 'submitted', updated_at = now()
where status = 'processing';

create unique index if not exists wallet_transactions_campaign_debit_uidx
  on public.wallet_transactions (reference)
  where type = 'debit' and reference like 'campaign:%';

create or replace function public.submit_campaign(
  p_route_id uuid,
  p_name text,
  p_sender_id text,
  p_message text,
  p_recipients text[]
)
returns table(campaign_id uuid, total_cost numeric, new_balance numeric, recipient_count integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_route public.routes%rowtype;
  v_wallet_balance numeric;
  v_reserved numeric := 0;
  v_count integer;
  v_total numeric;
  v_campaign_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.profiles where id = v_user_id and status = 'active') then
    raise exception 'This account is blocked';
  end if;

  v_count := coalesce(array_length(p_recipients, 1), 0);
  if v_count <= 0 then raise exception 'At least one recipient is required'; end if;
  if nullif(btrim(p_message), '') is null then raise exception 'Message content is required'; end if;

  select r.* into v_route
  from public.routes r
  left join public.user_route_access ura
    on ura.user_id = v_user_id and ura.route_id = r.id
  where r.id = p_route_id
    and r.enabled = true
    and coalesce(ura.enabled, true) = true;
  if not found then raise exception 'Selected route is unavailable for this account'; end if;

  v_total := round((v_count::numeric * v_route.price_per_message), 4);

  insert into public.wallets (user_id, balance, updated_at)
  values (v_user_id, 0, now())
  on conflict (user_id) do nothing;

  select balance into v_wallet_balance
  from public.wallets
  where user_id = v_user_id
  for update;

  select coalesce(sum(c.total_cost), 0) into v_reserved
  from public.campaigns c
  where c.user_id = v_user_id
    and c.status in ('processing', 'submitted', 'approved')
    and not exists (
      select 1 from public.wallet_transactions wt
      where wt.type = 'debit'
        and wt.reference = 'campaign:' || c.id::text
    );

  if (v_wallet_balance - v_reserved) < v_total then
    raise exception 'Insufficient available balance. Required $%, available $%',
      to_char(v_total, 'FM999999990.00'),
      to_char(greatest(v_wallet_balance - v_reserved, 0), 'FM999999990.00');
  end if;

  insert into public.campaigns (
    user_id, route_id, name, sender_id, message, recipient_count,
    total_recipients, pending_count, queued_count, sent_count,
    delivered_count, failed_count, total_cost, status, updated_at
  ) values (
    v_user_id, p_route_id, coalesce(nullif(btrim(p_name), ''), 'Campaign'),
    coalesce(nullif(btrim(p_sender_id), ''), 'iMessage-Direct'), p_message,
    v_count, v_count, v_count, 0, 0, 0, 0, v_total, 'submitted', now()
  ) returning id into v_campaign_id;

  insert into public.campaign_messages (campaign_id, user_id, phone, status)
  select v_campaign_id, v_user_id, recipient, 'pending'
  from unnest(p_recipients) as recipient;

  return query select v_campaign_id, v_total, v_wallet_balance, v_count;
end;
$$;

create or replace function public.submit_campaign(
  p_route_id uuid,
  p_name text,
  p_sender_id text,
  p_message text,
  p_recipients text[],
  p_source_file_name text
)
returns table(campaign_id uuid, total_cost numeric, new_balance numeric, recipient_count integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result record;
begin
  select * into v_result
  from public.submit_campaign(p_route_id, p_name, p_sender_id, p_message, p_recipients);

  update public.campaigns
  set source_file_name = nullif(btrim(p_source_file_name), '')
  where id = v_result.campaign_id and user_id = auth.uid();

  return query select v_result.campaign_id, v_result.total_cost,
    v_result.new_balance, v_result.recipient_count;
end;
$$;

create or replace function public.admin_approve_campaign(p_campaign_id uuid)
returns table(campaign_id uuid, campaign_status text, approved_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_campaign public.campaigns%rowtype;
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;

  select * into v_campaign from public.campaigns
  where id = p_campaign_id for update;
  if not found then raise exception 'Campaign not found'; end if;

  if v_campaign.status in ('submitted', 'processing') then
    update public.campaigns c
    set status = 'approved', approved_at = now(), approved_by = auth.uid(), updated_at = now()
    where id = p_campaign_id
    returning c.id, c.status, c.approved_at
      into campaign_id, campaign_status, approved_at;
  elsif v_campaign.status = 'approved' then
    campaign_id := v_campaign.id;
    campaign_status := v_campaign.status;
    approved_at := v_campaign.approved_at;
  elsif v_campaign.status in ('sent', 'completed') then
    raise exception 'Campaign is already marked as sent';
  else
    raise exception 'Campaign cannot be approved from status %', v_campaign.status;
  end if;

  return next;
end;
$$;

create or replace function public.admin_mark_campaign_sent(p_campaign_id uuid)
returns table(campaign_id uuid, campaign_status text, total_cost numeric, new_balance numeric, charged boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_campaign public.campaigns%rowtype;
  v_balance numeric;
  v_already_charged boolean;
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;

  select * into v_campaign from public.campaigns
  where id = p_campaign_id for update;
  if not found then raise exception 'Campaign not found'; end if;

  if v_campaign.status in ('sent', 'completed') then
    select balance into v_balance from public.wallets where user_id = v_campaign.user_id;
    campaign_id := v_campaign.id;
    campaign_status := v_campaign.status;
    total_cost := v_campaign.total_cost;
    new_balance := coalesce(v_balance, 0);
    charged := false;
    return next;
    return;
  end if;

  if v_campaign.status <> 'approved' then
    raise exception 'Approve this campaign before marking it as sent';
  end if;

  insert into public.wallets (user_id, balance, updated_at)
  values (v_campaign.user_id, 0, now())
  on conflict (user_id) do nothing;

  select balance into v_balance from public.wallets
  where user_id = v_campaign.user_id for update;

  select exists (
    select 1 from public.wallet_transactions wt
    where wt.type = 'debit'
      and wt.reference = 'campaign:' || v_campaign.id::text
  ) into v_already_charged;

  if not v_already_charged then
    if v_balance < v_campaign.total_cost then
      raise exception 'Customer balance is insufficient. Required $%, available $%',
        to_char(v_campaign.total_cost, 'FM999999990.00'),
        to_char(v_balance, 'FM999999990.00');
    end if;

    update public.wallets
    set balance = balance - v_campaign.total_cost, updated_at = now()
    where user_id = v_campaign.user_id
    returning balance into v_balance;

    insert into public.wallet_transactions (user_id, type, amount, reference, created_by)
    values (v_campaign.user_id, 'debit', v_campaign.total_cost,
      'campaign:' || v_campaign.id::text, auth.uid());
  end if;

  update public.campaign_messages
  set status = 'sent', provider = 'manual', provider_status = 'sent',
      sent_at = coalesce(sent_at, now()), updated_at = now()
  where campaign_messages.campaign_id = p_campaign_id
    and status in ('pending', 'sending');

  update public.campaigns c
  set status = 'sent', pending_count = 0, queued_count = 0,
      sent_count = greatest(total_recipients, recipient_count),
      sent_at = now(), sent_by = auth.uid(), billing_completed_at = now(), updated_at = now()
  where id = p_campaign_id
  returning c.id, c.status, c.total_cost
    into campaign_id, campaign_status, total_cost;

  new_balance := v_balance;
  charged := not v_already_charged;
  return next;
end;
$$;

drop function if exists public.admin_sending_history();
create function public.admin_sending_history()
returns table(
  campaign_id uuid, user_id uuid, user_email text, campaign_name text,
  source_file_name text, sender_id text, message text, total_recipients integer,
  delivered_count integer, failed_count integer, campaign_status text,
  total_cost numeric, created_at timestamptz, approved_at timestamptz,
  approved_by uuid, sent_at timestamptz, sent_by uuid,
  wallet_charged boolean, phones text[]
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;

  return query
  select c.id, c.user_id, p.email, c.name, c.source_file_name, c.sender_id,
    c.message,
    coalesce(c.total_recipients, c.recipient_count, cardinality(coalesce(m.phones, array[]::text[])), 0)::integer,
    coalesce(m.delivered_count, c.delivered_count, 0)::integer,
    coalesce(m.failed_count, c.failed_count, 0)::integer,
    c.status, c.total_cost, c.created_at, c.approved_at, c.approved_by,
    c.sent_at, c.sent_by,
    exists (
      select 1 from public.wallet_transactions wt
      where wt.type = 'debit' and wt.reference = 'campaign:' || c.id::text
    ),
    coalesce(m.phones, array[]::text[])
  from public.campaigns c
  left join public.profiles p on p.id = c.user_id
  left join lateral (
    select array_agg(cm.phone order by cm.created_at, cm.id) filter (where cm.phone is not null) as phones,
      count(*) filter (where cm.status = 'delivered')::integer as delivered_count,
      count(*) filter (where cm.status = 'failed')::integer as failed_count
    from public.campaign_messages cm where cm.campaign_id = c.id
  ) m on true
  order by c.created_at desc
  limit 500;
end;
$$;

revoke all on function public.admin_approve_campaign(uuid) from public, anon;
revoke all on function public.admin_mark_campaign_sent(uuid) from public, anon;
revoke all on function public.admin_sending_history() from public, anon;
grant execute on function public.admin_approve_campaign(uuid) to authenticated;
grant execute on function public.admin_mark_campaign_sent(uuid) to authenticated;
grant execute on function public.admin_sending_history() to authenticated;

commit;
