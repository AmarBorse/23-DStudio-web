-- 23D Studio — Invoices. Run once in Supabase → SQL Editor → New query → Run. Safe to run again.
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  number text not null,
  invoice_date date not null default current_date,
  due_date date,
  quote_id uuid,
  quote_number text not null default '',
  customer_id text not null default '',
  client_name text not null default '',
  client_address text not null default '',
  client_phone text not null default '',
  client_email text not null default '',
  heading text not null default '',
  items jsonb not null default '[]',
  discount numeric not null default 0,
  gst_enabled boolean not null default false,
  gst_percent numeric not null default 18,
  notes text not null default '',
  bank text not null default '',
  closing text not null default '',
  private_notes text not null default '',
  status text not null default 'unpaid',
  amount_paid numeric not null default 0,
  paid_on date,
  history jsonb not null default '[]'
);
alter table invoices enable row level security;
notify pgrst, 'reload schema';
