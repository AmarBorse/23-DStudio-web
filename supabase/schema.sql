-- 23D Studio — database setup. Run once in Supabase → SQL Editor → New query → Run.

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('visualisation', 'walkthroughs', 'vr')),
  description text not null default '',
  link text not null default '',
  images jsonb not null default '[]',
  published boolean not null default true,
  sort integer not null default 0,
  caption text not null default '',
  card_image jsonb,
  has_page boolean
);

create table if not exists team (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  role text not null default '',
  photo text not null,
  sort integer not null default 0
);

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null default '',
  message text not null,
  read boolean not null default false
);

-- Only the website's server (service_role key) may read or write. No public access.
alter table projects enable row level security;
alter table team enable row level security;
alter table enquiries enable row level security;

-- Public bucket for uploaded images
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;

-- Starting content (the projects and team already on the site)
insert into projects (slug, title, category, images, sort) values
  ('bed-room', 'Bed room', 'visualisation', '[{"src":"/images/work-bedroom.jpg","w":980,"h":907,"alt":"Interior render of a bedroom with a study desk and warm cove lighting"}]', 0),
  ('bungalow', 'Bungalow', 'visualisation', '[{"src":"/images/work-bungalow.jpg","w":1048,"h":968,"alt":"Exterior render of a white bungalow with a cantilevered balcony among trees"}]', 1),
  ('012-bungalow', '012 Bungalow', 'visualisation', '[{"src":"/images/work-012-bungalow.jpg","w":924,"h":855,"alt":"Exterior render of a two-storey bungalow with timber fins and a white car"}]', 2),
  ('shrinathji-old-age-home', 'Shrinathji old age home by TCL', 'walkthroughs', '[{"src":"/images/work-old-age-home.jpg","w":1415,"h":795,"alt":"Exterior render of the Shrinathji old age home with a landscaped lawn"}]', 3),
  ('row-house-malegaon', 'Row house project in Malegoan', 'walkthroughs', '[{"src":"/images/work-row-house.jpg","w":1152,"h":647,"alt":"Exterior render of row houses with palm trees in Malegaon"}]', 4),
  ('town-project', 'Town Project.', 'vr', '[{"src":"/images/work-town.jpg","w":1536,"h":827,"alt":"Aerial render of a riverside township under clouds"}]', 5)
on conflict (slug) do nothing;

insert into team (name, role, photo, sort)
select * from (values
  ('Gaurav Duse', 'Founder', '/images/team-gaurav.jpg', 0),
  ('Ritika Yeole', 'Interior designer', '/images/team-ritika.jpg', 1),
  ('Pratiksha', '2d Artist', '/images/team-pratiksha.jpg', 2)
) as v(name, role, photo, sort)
where not exists (select 1 from team);
-- Quotations
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
alter table quotations add column if not exists history jsonb not null default '[]';
