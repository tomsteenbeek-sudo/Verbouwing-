-- ============================================================================
-- Verbouwplan Leliestraat 27 — migratie 002: meerdere personen, klusdag-
-- aanwezigheid, kamerafbeeldingen als data, gereedschap-verantwoordelijke.
--
-- HOE TE GEBRUIKEN:
-- Supabase dashboard -> SQL Editor -> New query -> plak dit hele bestand -> Run.
-- Eenmalig uitvoeren, ná migratie/schema.sql. Bestaande koppelingen (wie was
-- aan een werkzaamheid/actie toegewezen) worden overgezet naar de nieuwe
-- koppeltabellen — er gaat niets verloren. Personen zelf worden nooit
-- verwijderd door een taak/actie te verwijderen en andersom (on delete cascade
-- staat alleen op de koppelrij, nooit op de taak/actie/persoon zelf).
-- ============================================================================

-- ============================================================================
-- NIEUWE KOPPELTABELLEN: meerdere personen per werkzaamheid/actie
-- ============================================================================

create table task_persons (
  task_id uuid not null references tasks(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  primary key (task_id, person_id)
);
create index task_persons_person_idx on task_persons(person_id);

create table action_persons (
  action_id uuid not null references actions(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  primary key (action_id, person_id)
);
create index action_persons_person_idx on action_persons(person_id);

-- Migreer bestaande enkelvoudige koppelingen naar de nieuwe koppeltabellen.
insert into task_persons (task_id, person_id)
  select id, person_id from tasks where person_id is not null;
insert into action_persons (action_id, person_id)
  select id, person_id from actions where person_id is not null;

alter table tasks drop column person_id;
alter table actions drop column person_id;

-- ============================================================================
-- KLUSDAG-AANWEZIGHEID: los van taaktoewijzing
-- ============================================================================

create table workday_persons (
  workday_id uuid not null references workdays(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  primary key (workday_id, person_id)
);
create index workday_persons_person_idx on workday_persons(person_id);

-- ============================================================================
-- KLUSDAGEN: titel/omschrijving vervallen — de werkzaamheden zelf zijn leidend
-- ============================================================================

alter table workdays drop column name;
alter table workdays drop column description;

-- ============================================================================
-- GEREEDSCHAP: verantwoordelijke persoon
-- ============================================================================

alter table tools add column responsible_person_id uuid references people(id) on delete set null;

-- ============================================================================
-- KAMERAFBEELDINGEN: één centrale tabel i.p.v. bestandsnaam-conventie raden
-- ============================================================================

create table room_images (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  image_url text not null,
  type text not null check (type in ('desired','current')),
  caption text,
  is_cover boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index room_images_room_idx on room_images(room_id);

-- ============================================================================
-- RLS — zelfde bewuste open policy als de rest van het schema
-- ============================================================================

alter table task_persons enable row level security;
alter table action_persons enable row level security;
alter table workday_persons enable row level security;
alter table room_images enable row level security;

create policy "public full access" on task_persons for all using (true) with check (true);
create policy "public full access" on action_persons for all using (true) with check (true);
create policy "public full access" on workday_persons for all using (true) with check (true);
create policy "public full access" on room_images for all using (true) with check (true);

-- ============================================================================
-- SEED: kamerafbeeldingen die al als bestand in images/rooms/ staan
-- ============================================================================

insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/entree-en-gang.jpg', 'current', 1, true from rooms where slug = 'entree-en-gang';
insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/woonkamer-moodboard-1.jpg', 'desired', 1, true from rooms where slug = 'woonkamer';
insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/keuken.jpg', 'current', 1, true from rooms where slug = 'keuken';
insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/tweede-hal-en-bijkeuken.jpg', 'current', 1, true from rooms where slug = 'tweede-hal-en-bijkeuken';
insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/toilet-beneden.jpg', 'current', 1, true from rooms where slug = 'toilet-beneden';
insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/trap.jpg', 'current', 1, true from rooms where slug = 'trap';
insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/overloop.jpg', 'current', 1, true from rooms where slug = 'overloop';

insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/ouderslaapkamer-moodboard-1.jpg', 'desired', 1, true from rooms where slug = 'ouderslaapkamer';
insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/ouderslaapkamer-moodboard-2.jpg', 'desired', 2, false from rooms where slug = 'ouderslaapkamer';

insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/tweede-slaapkamer-moodboard-1.jpg', 'desired', 1, true from rooms where slug = 'tweede-slaapkamer';

insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/badkamer-en-toilet-boven-moodboard-1.jpg', 'desired', 1, true from rooms where slug = 'badkamer-en-toilet-boven';
insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/badkamer-en-toilet-boven.jpg', 'current', 1, false from rooms where slug = 'badkamer-en-toilet-boven';
insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/badkamer-en-toilet-boven-2.jpg', 'current', 2, false from rooms where slug = 'badkamer-en-toilet-boven';

insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/dakterras.jpg', 'current', 1, true from rooms where slug = 'dakterras';
insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/achtertuin.jpg', 'current', 1, true from rooms where slug = 'achtertuin';
insert into room_images (room_id, image_url, type, sort_order, is_cover)
  select id, 'images/rooms/gevel-en-dak.jpg', 'current', 1, true from rooms where slug = 'gevel-en-dak';
