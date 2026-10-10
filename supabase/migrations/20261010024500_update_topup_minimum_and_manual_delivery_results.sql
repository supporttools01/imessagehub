begin;

-- Keep payment destination and minimum recharge in one shared database setting.
alter table public.settings
  add column if not exists payment_wallet_address text not null default 'TWhUtsbWiR3gQE6yi9CirRQsR1zKAR9FJd',
  add column if not exists minimum_topup_amount numeric(12,2) not null default 10;

alter table public.settings
  drop constraint if exists settings_minimum_topup_amount_check;
alter table public.settings
  add constraint settings_minimum_topup_amount_check
  check (minimum_topup_amount >= 10);

update public.settings
set payment_wallet_address = 'TWhUtsbWiR3gQE6yi9CirRQsR1zKAR9FJd',
    minimum_topup_amount = 10,
    updated_at = now();

-- Enforce the same minimum on the server, not just in the browser.
drop policy if exists "topups own pending insert" on public.topup_requests;
create policy "topups own pending insert"
on public.topup_requests
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and status = 'pending'
  and approved_at is null
  and approved_by is null
  and amount >= 10
  and network = 'TRC20'
  and nullif(btrim(tx_hash), '') is not null
  and user_email = (select auth.jwt()->>'email')
);

-- Admin-only removal for uncredited payment requests. Credited records remain auditable.
create or replace function public.admin_delete_topup_request(p_topup_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_status text;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  select status into v_status
  from public.topup_requests
  where id = p_topup_id
  for update;

  if not found then
    raise exception 'Top-up request not found';
  end if;
  if v_status = 'paid' then
    raise exception 'Credited top-up requests cannot be deleted';
  end if;

  delete from public.topup_requests where id = p_topup_id;
  return true;
end;
$function$;

revoke all on function public.admin_delete_topup_request(uuid) from public, anon;
grant execute on function public.admin_delete_topup_request(uuid) to authenticated;

-- Save manually verified recipient outcomes before the admin completes campaign billing.
create or replace function public.admin_set_campaign_results(
  p_campaign_id uuid,
  p_delivered_count integer,
  p_failed_count integer
)
returns table (
  campaign_id uuid,
  delivered_count integer,
  failed_count integer,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_campaign public.campaigns%rowtype;
  v_delivered integer := coalesce(p_delivered_count, -1);
  v_failed integer := coalesce(p_failed_count, -1);
  v_total integer;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  if v_delivered < 0 or v_failed < 0 then
    raise exception 'Delivered and failed counts must be zero or greater';
  end if;

  select * into v_campaign
  from public.campaigns
  where id = p_campaign_id
  for update;

  if not found then
    raise exception 'Campaign not found';
  end if;

  select count(*)::integer into v_total
  from public.campaign_messages
  where public.campaign_messages.campaign_id = p_campaign_id;

  v_total := greatest(
    coalesce(v_campaign.total_recipients, 0),
    coalesce(v_campaign.recipient_count, 0),
    coalesce(v_total, 0)
  );

  if v_delivered + v_failed > v_total then
    raise exception 'Delivered plus failed cannot exceed the recipient count (%)', v_total;
  end if;

  -- Map the manual totals onto individual records for user-visible Outbox statuses.
  with ranked as (
    select cm.id,
           row_number() over (order by cm.created_at asc, cm.id asc) as rn,
           count(*) over () as row_total
    from public.campaign_messages cm
    where cm.campaign_id = p_campaign_id
  ),
  desired as (
    select id,
      case
        when rn <= v_delivered then 'delivered'
        when rn > row_total - v_failed then 'failed'
        else 'sent'
      end as new_status
    from ranked
  )
  update public.campaign_messages cm
  set status = desired.new_status,
      provider = coalesce(cm.provider, 'manual'),
      provider_status = desired.new_status,
      sent_at = coalesce(cm.sent_at, now()),
      delivered_at = case when desired.new_status = 'delivered' then coalesce(cm.delivered_at, now()) else cm.delivered_at end,
      failed_at = case when desired.new_status = 'failed' then coalesce(cm.failed_at, now()) else cm.failed_at end,
      updated_at = now()
  from desired
  where cm.id = desired.id;

  update public.campaigns c
  set delivered_count = v_delivered,
      failed_count = v_failed,
      sent_count = greatest(v_total - v_delivered - v_failed, 0),
      pending_count = 0,
      queued_count = 0,
      updated_at = now()
  where c.id = p_campaign_id
  returning c.id, c.delivered_count, c.failed_count, c.updated_at
  into campaign_id, delivered_count, failed_count, updated_at;

  return next;
end;
$function$;

revoke all on function public.admin_set_campaign_results(uuid, integer, integer) from public, anon;
grant execute on function public.admin_set_campaign_results(uuid, integer, integer) to authenticated;

commit;