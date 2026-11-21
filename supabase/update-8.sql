-- 23D Studio — studio stamp on offer letters and certificates. Run once in Supabase → SQL Editor → New query → Run. Safe to run again.
alter table offer_letters add column if not exists stamp text not null default '';
notify pgrst, 'reload schema';
