-- 23D Studio — Quotations. Run once in Supabase → SQL Editor → New query → Run. Safe to run more than once.
create table if not exists quotations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  number text not null,
  quote_date date not null default current_date,
  valid_till date,
  customer_id text not null default '',
  client_name text not null default '',
  client_address text not null default '',
  client_phone text not null default '',
  client_email text not null default '',
  prepared_by_name text not null default '',
  prepared_by_phone text not null default '',
  project_overview text not null default '',
  items jsonb not null default '[]',
  gst_enabled boolean not null default false,
  gst_percent numeric not null default 18,
  discount numeric not null default 0,
  terms text not null default '',
  closing text not null default '',
  notes text not null default '',
  status text not null default 'draft'
);
alter table quotations enable row level security;
notify pgrst, 'reload schema';
