-- ============================================================
--  RESET — verwijdert het oude dashboard (taken, bedrijven, berichten)
--  LET OP: dit is onomkeerbaar.
-- ============================================================

drop table if exists company_mail_logs cascade;
drop table if exists company_notes cascade;
drop table if exists mail_tracking cascade;
drop table if exists mail_tasks cascade;
drop table if exists onboarding_tasks cascade;
drop table if exists sent_messages cascade;
drop table if exists meetings cascade;
drop table if exists questions cascade;
drop table if exists tasks cascade;
drop table if exists companies cascade;
drop table if exists user_roles cascade;

-- ============================================================
--  SCHEMA — persoonlijk indelingsschema
-- ============================================================

-- Categorieën met hun weekdoel.
-- weekly_minutes = doel in minuten. weekly_count = doel in aantal keer
-- (null wanneer het doel in uren telt in plaats van in keren).
create table if not exists categories (
  slug           text primary key,
  label          text        not null,
  weekly_minutes int         not null default 0,
  weekly_count   int,
  default_block  int         not null default 60, -- voorgestelde blokduur in minuten
  sort_order     int         not null default 0
);

-- Eén rij met de persoonlijke instellingen.
create table if not exists settings (
  id                 int         primary key default 1 check (id = 1),
  wake_minute        int         not null default 450,  -- 07:30
  sleep_minute       int         not null default 1530, -- 01:30 (na middernacht)
  daily_work_minutes int         not null default 300,  -- 5 uur werk per dag
  updated_at         timestamptz not null default now()
);

-- Eén rij per dag. Wordt aangemaakt zodra je de dag opent.
-- Bevat tevens de no-go-checklist (null = nog niet beoordeeld).
create table if not exists days (
  day           date        primary key,
  no_shorts     boolean,
  no_youtube    boolean,
  room_cleaned  boolean,
  no_oversleep  boolean,
  note          text,
  updated_at    timestamptz not null default now()
);

-- Een ingedeeld blok. start_minute is null zolang het blok nog
-- niet in de tijdlijn geplaatst is (de "nog in te plannen"-lade).
create table if not exists blocks (
  id               uuid        primary key default gen_random_uuid(),
  day              date        not null references days(day) on delete cascade,
  category         text        not null references categories(slug) on delete cascade,
  start_minute     int,
  duration_minutes int         not null check (duration_minutes > 0),
  note             text,
  done             boolean     not null default false,
  auto             boolean     not null default false, -- automatisch aangemaakt werkblok
  created_at       timestamptz not null default now()
);

create index if not exists blocks_day_idx on blocks (day);

-- ============================================================
--  SEED
-- ============================================================

insert into settings (id) values (1) on conflict (id) do nothing;

insert into categories (slug, label, weekly_minutes, weekly_count, default_block, sort_order) values
  ('werk',     'Werk',             3510, null, 300, 1),
  ('sport',    'Sporten',           630, null,  90, 2),
  ('piano',    'Piano',             420, null,  60, 3),
  ('schaken',  'Schaken',           420, null,  60, 4),
  ('peterson', 'Peterson Academy',  420, null,  60, 5),
  ('kamer',    'Kamer opruimen',     60,    2,  30, 6)
on conflict (slug) do nothing;

-- ============================================================
--  BEVEILIGING
--  RLS aan zonder policies = niemand komt erbij met de publieke
--  anon-key. De app praat met de database via de service-role-key,
--  die alleen server-side bestaat. Toegang loopt via de pincode.
-- ============================================================

alter table categories enable row level security;
alter table settings   enable row level security;
alter table days       enable row level security;
alter table blocks     enable row level security;
