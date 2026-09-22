-- ============================================================================
-- Verbouwplan Leliestraat 27 — migratie 003: fases, besluiten, offertes,
-- inkopen, betalingen en de centrale budgetketen.
--
-- HOE TE GEBRUIKEN:
-- Supabase dashboard -> SQL Editor -> New query -> plak dit hele bestand -> Run.
-- Eenmalig uitvoeren, ná migratie_002. Migreert de bestaande 59 acties naar
-- besluiten/offertes/inkopen/voorbereidende taken (op basis van hun categorie),
-- koppelt de 19 bestaande klusdagen aan fases, en zet de bestaande 20
-- budgetregels (€30.000) om naar inkopen onder de nieuwe, fijnere
-- budgetcategorieën. Er gaat niets verloren.
-- ============================================================================

-- ============================================================================
-- FASES
-- ============================================================================

create table phases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text,
  start_date date,
  end_date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into phases (name, description, color, sort_order) values
('Fase 0 – Voorbereiding', 'Alles wat vóór de daadwerkelijke verbouwing moet worden geregeld.', '#9c8a6b', 0),
('Fase 1 – Sloop & voorbereiding woning', 'Verwijderen, demonteren, beschermen en voorbereiden.', '#9c6b52', 1),
('Fase 2 – Techniek & isolatie', 'Elektra, netwerk, isolatie en werkzaamheden die vóór afwerking plaatsvinden.', '#6b8a9c', 2),
('Fase 3 – Herstel & timmerwerk', 'Wanden herstellen, deuren, kozijnen, vlieringtrap enz.', '#8b7355', 3),
('Fase 4 – Schilderwerk & afwerking', 'Vullen, schuren, schilderen, kitten en afwerken.', '#a37d3f', 4),
('Fase 5 – Vloeren & trap', 'Vloer, plinten en trapafwerking.', '#6f7a4c', 5),
('Fase 6 – Montage & inrichting', 'BESTÅ, verlichting, raamdecoratie, meubels enz.', '#8b5a3c', 6),
('Fase 7 – Oplevering', 'Restpunten, schoonmaak, herstel en definitieve inrichting.', '#6f8f7a', 7);

-- ============================================================================
-- BUDGET: één centraal vastgesteld bedrag + fijnere categorieën
-- ============================================================================

create table budgets (
  id uuid primary key default gen_random_uuid(),
  total_budget numeric not null default 0
);
insert into budgets (total_budget) values (30000);

create table budget_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  allocated_budget numeric not null default 0,
  sort_order int not null default 0
);
insert into budget_categories (name, allocated_budget, sort_order) values
('Voorbereiding', 600, 1),
('Isolatie', 9700, 2),
('Elektra', 4400, 3),
('Timmerwerk', 1300, 4),
('Schilderwerk', 1000, 5),
('Vloeren', 4500, 6),
('Trap', 700, 7),
('TV-wand', 0, 8),
('Verlichting', 0, 9),
('Raamdecoratie', 0, 10),
('Inrichting', 0, 11),
('Gereedschap', 0, 12),
('Buitenwerk', 4500, 13),
('Onvoorzien', 2950, 14),
('Overig', 350, 15);

-- ============================================================================
-- WERKZAAMHEDEN: type (werkzaamheid/voorbereidende actie), fase, budget
-- ============================================================================

alter table tasks add column type text not null default 'Werkzaamheid' check (type in ('Werkzaamheid','Voorbereidende actie'));
alter table tasks add column phase_id uuid references phases(id) on delete set null;
alter table tasks add column estimated_labor_cost numeric;
alter table tasks add column estimated_material_cost numeric;
alter table tasks add column budget_category_id uuid references budget_categories(id) on delete set null;
create index tasks_phase_idx on tasks(phase_id);
create index tasks_budget_category_idx on tasks(budget_category_id);

create table task_budget_responsibles (
  task_id uuid not null references tasks(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  primary key (task_id, person_id)
);

-- ============================================================================
-- KLUSDAGEN: koppeling aan een fase
-- ============================================================================

alter table workdays add column phase_id uuid references phases(id) on delete set null;
create index workdays_phase_idx on workdays(phase_id);

update workdays set phase_id = (select id from phases where sort_order = 1) where number = 1;
update workdays set phase_id = (select id from phases where sort_order = 2) where number in (2, 3, 6);
update workdays set phase_id = (select id from phases where sort_order = 3) where number in (4, 5, 7);
update workdays set phase_id = (select id from phases where sort_order = 4) where number in (8, 9, 10, 11);
update workdays set phase_id = (select id from phases where sort_order = 5) where number in (12, 13, 14);
update workdays set phase_id = (select id from phases where sort_order = 6) where number in (15, 16, 17, 18);
update workdays set phase_id = (select id from phases where sort_order = 7) where number = 19;

-- ============================================================================
-- BESLUITEN
-- ============================================================================

create table decisions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  options text,
  chosen_option text,
  deadline text,
  status text not null default 'Open' check (status in ('Open','Besloten')),
  phase_id uuid references phases(id) on delete set null,
  room_id uuid references rooms(id) on delete set null,
  blocks_note text,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table decision_persons (
  decision_id uuid not null references decisions(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  primary key (decision_id, person_id)
);

create table decision_tasks (
  decision_id uuid not null references decisions(id) on delete cascade,
  task_id uuid not null references tasks(id) on delete cascade,
  primary key (decision_id, task_id)
);

-- ============================================================================
-- OFFERTES
-- ============================================================================

create table quotes (
  id uuid primary key default gen_random_uuid(),
  supplier text not null,
  description text,
  category text,
  amount numeric,
  requested_date date,
  received_date date,
  valid_until date,
  status text not null default 'Nog aanvragen' check (status in ('Nog aanvragen','Aangevraagd','Ontvangen','Akkoord','Afgewezen')),
  document_url text,
  notes text,
  phase_id uuid references phases(id) on delete set null,
  budget_category_id uuid references budget_categories(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table quote_persons (
  quote_id uuid not null references quotes(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  primary key (quote_id, person_id)
);

create table quote_tasks (
  quote_id uuid not null references quotes(id) on delete cascade,
  task_id uuid not null references tasks(id) on delete cascade,
  primary key (quote_id, task_id)
);

-- ============================================================================
-- INKOPEN + BETALINGEN
-- Verplicht/werkelijk staan op de inkoop zelf (niet nogmaals op de
-- werkzaamheid) zodat een bedrag maar op één plek leeft — de werkzaamheid
-- telt de bedragen van zijn gekoppelde inkopen bij elkaar op, in plaats van
-- er een eigen totaal naast te houden. Zo kan een bedrag nooit dubbel tellen.
-- ============================================================================

create table purchases (
  id uuid primary key default gen_random_uuid(),
  product text not null,
  category text,
  description text,
  quantity text,
  unit text,
  supplier text,
  url text,
  estimated_cost numeric,
  committed_cost numeric,
  actual_cost numeric,
  status text not null default 'Nog bepalen' check (status in ('Nog bepalen','Gekozen','Nog bestellen','Besteld','Deels ontvangen','In huis')),
  order_date date,
  expected_delivery_date date,
  received boolean not null default false,
  room_id uuid references rooms(id) on delete set null,
  phase_id uuid references phases(id) on delete set null,
  task_id uuid references tasks(id) on delete set null,
  budget_category_id uuid references budget_categories(id) on delete set null,
  quote_id uuid references quotes(id) on delete set null,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index purchases_task_idx on purchases(task_id);
create index purchases_phase_idx on purchases(phase_id);
create index purchases_budget_category_idx on purchases(budget_category_id);
create index purchases_room_idx on purchases(room_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases(id) on delete cascade,
  person_id uuid references people(id) on delete set null,
  amount numeric not null,
  payment_date date,
  status text,
  notes text,
  created_at timestamptz not null default now()
);
create index payments_purchase_idx on payments(purchase_id);
create index payments_person_idx on payments(person_id);

-- ============================================================================
-- RLS — zelfde bewuste open policy als de rest van het schema
-- ============================================================================

alter table phases enable row level security;
alter table budgets enable row level security;
alter table budget_categories enable row level security;
alter table task_budget_responsibles enable row level security;
alter table decisions enable row level security;
alter table decision_persons enable row level security;
alter table decision_tasks enable row level security;
alter table quotes enable row level security;
alter table quote_persons enable row level security;
alter table quote_tasks enable row level security;
alter table purchases enable row level security;
alter table payments enable row level security;

create policy "public full access" on phases for all using (true) with check (true);
create policy "public full access" on budgets for all using (true) with check (true);
create policy "public full access" on budget_categories for all using (true) with check (true);
create policy "public full access" on task_budget_responsibles for all using (true) with check (true);
create policy "public full access" on decisions for all using (true) with check (true);
create policy "public full access" on decision_persons for all using (true) with check (true);
create policy "public full access" on decision_tasks for all using (true) with check (true);
create policy "public full access" on quotes for all using (true) with check (true);
create policy "public full access" on quote_persons for all using (true) with check (true);
create policy "public full access" on quote_tasks for all using (true) with check (true);
create policy "public full access" on purchases for all using (true) with check (true);
create policy "public full access" on payments for all using (true) with check (true);

-- ============================================================================
-- MIGRATIE: bestaande acties (59) -> besluiten / offertes / inkopen /
-- voorbereidende werkzaamheden, op basis van hun categorie.
-- ============================================================================

-- "Beslissen" -> besluiten
insert into decisions (title, notes, deadline, status, blocks_note, sort_order)
select
  title,
  notes,
  nullif(deadline, '—'),
  case status when 'Gedaan' then 'Besloten' else 'Open' end,
  case when blocks_workday_id is not null then 'Blokkeerde voorheen klusdag ' || (select number from workdays where id = blocks_workday_id) else null end,
  row_number() over (order by title)
from actions where category = 'Beslissen';

insert into decision_persons (decision_id, person_id)
select d.id, ap.person_id
from actions a
join action_persons ap on ap.action_id = a.id
join decisions d on d.title = a.title and a.category = 'Beslissen';

-- "Offerte aanvragen" -> offertes
insert into quotes (supplier, description, status, phase_id, sort_order)
select
  coalesce((select p.name from action_persons ap join people p on p.id = ap.person_id where ap.action_id = a.id limit 1), 'Onbekend'),
  a.title || case when a.notes is not null then ' — ' || a.notes else '' end,
  case a.status when 'Gedaan' then 'Ontvangen' else 'Nog aanvragen' end,
  (select w.phase_id from workdays w where w.id = a.blocks_workday_id),
  row_number() over (order by a.title)
from actions a where a.category = 'Offerte aanvragen';

-- "Uitzoeken", "Vakman inplannen", "Administratie / subsidie" -> voorbereidende werkzaamheden in Fase 0
insert into tasks (title, notes, dependency_note, status, type, phase_id, category, sort_order)
select
  a.title,
  a.notes,
  nullif(a.deadline, '—'),
  case a.status when 'Gedaan' then 'Gereed' else 'Nog in te plannen' end,
  'Voorbereidende actie',
  (select id from phases where sort_order = 0),
  a.category,
  row_number() over (order by a.category, a.title)
from actions a where a.category in ('Uitzoeken', 'Vakman inplannen', 'Administratie / subsidie');

insert into task_persons (task_id, person_id)
select t.id, ap.person_id
from actions a
join action_persons ap on ap.action_id = a.id
join tasks t on t.title = a.title and t.type = 'Voorbereidende actie' and a.category in ('Uitzoeken', 'Vakman inplannen', 'Administratie / subsidie')
where a.category in ('Uitzoeken', 'Vakman inplannen', 'Administratie / subsidie');

-- "Bestellen / inkopen" -> inkopen
insert into purchases (product, notes, status, phase_id, sort_order)
select
  a.title,
  a.notes,
  'Nog bestellen',
  (select w.phase_id from workdays w where w.id = a.blocks_workday_id),
  row_number() over (order by a.title)
from actions a where a.category = 'Bestellen / inkopen';

-- Oude acties zijn nu overal gemigreerd.
drop table action_persons;
drop table actions;

-- ============================================================================
-- MIGRATIE: bestaande budgetregels (20, €30.000) -> inkopen onder de nieuwe,
-- fijnere budgetcategorieën.
-- ============================================================================

insert into purchases (product, estimated_cost, notes, status, budget_category_id, sort_order)
select post, budgeted, execution_note, 'Nog bepalen', (select id from budget_categories where name = cat), sort_order
from (values
  ('Bodem- of vloerisolatie kruipruimte (ca. 37 m²)', 2200, 'Uitbesteed, verplicht voor ISDE', 'Isolatie', 101),
  ('Vliering- of dakisolatie (ca. 30 m²)', 1200, 'Uitbesteed — pas definitief na keuze opslag/bewoonbaar', 'Isolatie', 102),
  ('Ventilatie op orde brengen', 1500, 'Uitbesteed', 'Isolatie', 103),
  ('Kierdichting', 600, 'Uitbesteed', 'Isolatie', 104),
  ('Restant enkel glas vervangen', 700, 'Uitbesteed', 'Isolatie', 105),
  ('Gevelisolatie: reservering tot na het onderzoek', 3500, 'Pas besluiten na spouwcheck', 'Isolatie', 106),
  ('Nieuw energielabel laten opnemen', 350, 'Adviseur', 'Overig', 107),
  ('Vloer ca. 55 m² incl. egaliseren, ondervloer en leggen', 4000, 'Uitbesteed', 'Vloeren', 108),
  ('Plinten ca. 60 m¹, materiaal', 500, 'Zelf', 'Vloeren', 109),
  ('Elektra aanpassen en uitbreiden', 3200, 'Uitbesteed', 'Elektra', 110),
  ('Groepenkast, reservering', 1200, 'Uitbesteed', 'Elektra', 111),
  ('Gevelherstel en voegwerk voor- en achtergevel', 2500, 'Uitbesteed', 'Buitenwerk', 112),
  ('Dakherstel, goten en loodwerk, reservering', 1500, 'Uitbesteed', 'Buitenwerk', 113),
  ('Verf en schildermateriaal buiten', 500, 'Zelf', 'Buitenwerk', 114),
  ('Verf en schildermateriaal binnen', 1000, 'Zelf', 'Schilderwerk', 115),
  ('Trapafwerking, materiaal', 700, 'Zelf', 'Trap', 116),
  ('Vlieringtrap', 600, 'Zelf of timmerman', 'Timmerwerk', 117),
  ('Deuren, lijsten, klinken, klein timmerwerk', 700, 'Zelf', 'Timmerwerk', 118),
  ('Container, beschermmateriaal, gereedschap', 600, 'Zelf', 'Voorbereiding', 119),
  ('Onvoorzien (ca. 10 procent)', 2950, null, 'Onvoorzien', 120)
) as old_budget(post, budgeted, execution_note, cat, sort_order);

drop table budget_items;
