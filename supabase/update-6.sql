-- 23D Studio — Offer letters. Run once in Supabase → SQL Editor → New query → Run. Safe to run again.
create table if not exists offer_letters (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  number text not null,
  letter_date date not null default current_date,
  candidate_name text not null default '',
  candidate_address text not null default '',
  candidate_email text not null default '',
  candidate_phone text not null default '',
  greeting_name text not null default '',
  position text not null default '',
  start_date date,
  reporting_to text not null default '',
  work_location text not null default '',
  salary text not null default '',
  benefits text not null default '',
  accept_by date,
  body text not null default '',
  closing text not null default '',
  signatory_name text not null default '',
  signatory_title text not null default '',
  signature text not null default '',
  private_notes text not null default '',
  status text not null default 'draft',
  history jsonb not null default '[]'
);
alter table offer_letters enable row level security;
notify pgrst, 'reload schema';
