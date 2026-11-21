-- 23D Studio — internship offer letters. Run once in Supabase → SQL Editor → New query → Run. Safe to run again.
alter table offer_letters add column if not exists letter_type text not null default 'job';
alter table offer_letters add column if not exists department text not null default '';
alter table offer_letters add column if not exists end_date date;
alter table offer_letters add column if not exists duration text not null default '';
alter table offer_letters add column if not exists work_mode text not null default '';
alter table offer_letters add column if not exists working_hours text not null default '';
alter table offer_letters add column if not exists notice text not null default '';
alter table offer_letters add column if not exists about text not null default '';
alter table offer_letters add column if not exists responsibilities text not null default '';
alter table offer_letters add column if not exists terms text not null default '';
notify pgrst, 'reload schema';
