-- 23D Studio — database update for the new project form (card image, card caption, "Create a project page").
-- Run once in Supabase → SQL Editor → New query → Run. Safe to run more than once.
alter table projects add column if not exists caption text not null default '';
alter table projects add column if not exists card_image jsonb;
alter table projects add column if not exists has_page boolean;
