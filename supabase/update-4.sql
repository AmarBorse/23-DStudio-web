-- 23D Studio — quotation history (who changed what, when). Run once in Supabase → SQL Editor. Safe to run again.
alter table quotations add column if not exists history jsonb not null default '[]';
notify pgrst, 'reload schema';
