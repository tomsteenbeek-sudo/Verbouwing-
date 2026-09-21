-- ============================================================================
-- Verbouwplan Leliestraat 27 — database schema + migratie van bestaande data
--
-- HOE TE GEBRUIKEN:
-- Supabase dashboard -> SQL Editor -> New query -> plak dit hele bestand -> Run.
-- Eenmalig uitvoeren. Maakt alle tabellen aan, zet RLS open (bewust, geen login)
-- en vult ze met alle werkzaamheden, acties, materialen, gereedschap, risico's,
-- opleverpunten en budgetregels die al in het plan stonden.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- TABELLEN
-- ============================================================================

create table people (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  floor text not null check (floor in ('begane-grond','verdieping','buiten')),
  current_state text,
  target_state text,
  is_out_of_scope boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table workdays (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  name text not null,
  description text,
  date date,
  prerequisite_note text,
  drying_time text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table workday_dependencies (
  workday_id uuid not null references workdays(id) on delete cascade,
  depends_on_workday_id uuid not null references workdays(id) on delete cascade,
  primary key (workday_id, depends_on_workday_id)
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  room_id uuid references rooms(id) on delete set null,
  workday_id uuid references workdays(id) on delete set null,
  person_id uuid references people(id) on delete set null,
  category text,
  status text not null default 'Nog in te plannen' check (status in ('Nog in te plannen','Te doen','Bezig','Gereed')),
  is_external boolean not null default false,
  dependency_note text,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_room_idx on tasks(room_id);
create index tasks_workday_idx on tasks(workday_id);
create index tasks_person_idx on tasks(person_id);

create table materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  room_id uuid references rooms(id) on delete set null,
  quantity_needed text,
  unit text,
  quantity_purchased text,
  store text,
  price numeric,
  url text,
  status text not null default 'Nog bepalen' check (status in ('Nog bepalen','Uitzoeken','Bestellen','Besteld','In huis')),
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index materials_room_idx on materials(room_id);

create table task_materials (
  task_id uuid not null references tasks(id) on delete cascade,
  material_id uuid not null references materials(id) on delete cascade,
  primary key (task_id, material_id)
);

create table tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  have_it boolean not null default false,
  acquire_method text check (acquire_method in ('Kopen','Lenen','Huren')),
  quantity text,
  status text,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table task_tools (
  task_id uuid not null references tasks(id) on delete cascade,
  tool_id uuid not null references tools(id) on delete cascade,
  primary key (task_id, tool_id)
);

create table actions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  deadline text,
  person_id uuid references people(id) on delete set null,
  status text not null default 'Open' check (status in ('Open','Gedaan')),
  notes text,
  related_task_id uuid references tasks(id) on delete set null,
  related_material_id uuid references materials(id) on delete set null,
  blocks_workday_id uuid references workdays(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index actions_person_idx on actions(person_id);
create index actions_blocks_idx on actions(blocks_workday_id);

create table risks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  why text,
  impact text,
  check_text text,
  sort_order int not null default 0
);

create table handover_checklist (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('technisch','dossier')),
  item text not null,
  is_done boolean not null default false,
  sort_order int not null default 0
);

create table budget_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('Verduurzaming','Regulier','Onvoorzien')),
  post text not null,
  budgeted numeric not null default 0,
  actual numeric not null default 0,
  execution_note text,
  sort_order int not null default 0
);

-- ============================================================================
-- ROW LEVEL SECURITY — bewust open, geen login (eigen keuze)
-- ============================================================================

alter table people enable row level security;
alter table rooms enable row level security;
alter table workdays enable row level security;
alter table workday_dependencies enable row level security;
alter table tasks enable row level security;
alter table materials enable row level security;
alter table task_materials enable row level security;
alter table tools enable row level security;
alter table task_tools enable row level security;
alter table actions enable row level security;
alter table risks enable row level security;
alter table handover_checklist enable row level security;
alter table budget_items enable row level security;

create policy "public full access" on people for all using (true) with check (true);
create policy "public full access" on rooms for all using (true) with check (true);
create policy "public full access" on workdays for all using (true) with check (true);
create policy "public full access" on workday_dependencies for all using (true) with check (true);
create policy "public full access" on tasks for all using (true) with check (true);
create policy "public full access" on materials for all using (true) with check (true);
create policy "public full access" on task_materials for all using (true) with check (true);
create policy "public full access" on tools for all using (true) with check (true);
create policy "public full access" on task_tools for all using (true) with check (true);
create policy "public full access" on actions for all using (true) with check (true);
create policy "public full access" on risks for all using (true) with check (true);
create policy "public full access" on handover_checklist for all using (true) with check (true);
create policy "public full access" on budget_items for all using (true) with check (true);

-- ============================================================================
-- SEED: personen
-- ============================================================================

insert into people (name) values
('Tom'), ('Thomas van Ooijen'), ('Ben Nikkels'), ('Marcel Haagsman'), ('John'),
('Barry'), ('Isolatiebedrijf'), ('Elektricien'), ('Dakdekker'), ('Loodgieter'),
('Keuringsbedrijf'), ('Schilder/gevelpartij'), ('Gecertificeerd bureau'), ('Gemeente'),
('Nog niet toegewezen');

-- ============================================================================
-- SEED: kamers
-- ============================================================================

insert into rooms (slug, name, floor, current_state, target_state, is_out_of_scope, sort_order) values
('entree-en-gang','Entree en gang','begane-grond','Klein, donker en het eerste wat je ziet. Hier win je met licht en met een nette meterkast, niet met kleur.','Lichte, opgeruimde entree met warme basiskleur, nette meterkast en een duidelijke plek voor jassen en schoenen.',false,1),
('woonkamer','Woonkamer','begane-grond','De hoofdruimte van het huis, nog in originele staat.','Eén groene wand als accent, de rest warm neutraal. Geen hoge kasten, alles laag en horizontaal zodat het plafond hoger lijkt.',false,2),
('keuken','Keuken','begane-grond','Vernieuwde keuken met wit blad, houtlook fronten, inductie, afzuigkap, oven en vaatwasser. Blijft staan.','Zelfde keuken, met een opgeloste vloeraansluiting en een nette doorgang naar de woonkamer.',true,3),
('tweede-hal-en-bijkeuken','Tweede hal en bijkeuken','begane-grond','Stond niet in het oude plan, maar hier komt alles samen: was, afvoer naar de tuin, toilet.','Praktische, lichte werkruimte met een goede was- en drogeropstelling en waterbestendige vloer.',false,4),
('toilet-beneden','Toilet beneden','begane-grond','Functioneel, staat verder niet beoordeeld.','Blijft zoals het is — buiten scope van deze verbouwing.',true,5),
('trap','Trap','begane-grond','Originele trap, staat en afwerking nog te beoordelen.','Veilige, nette trap: geschilderd en/of bekleed, met verlichting die in het lichtplan is meegenomen.',false,6),
('overloop','Overloop','verdieping','Doorgangsruimte boven, originele staat.','Doorlopende nieuwe vloer vanaf de trap, herstelde wanden en plafond en een nette vlieringtoegang.',false,7),
('ouderslaapkamer','Ouderslaapkamer','verdieping','Voorzijde, volle breedte. Wanden zijn al gestuukt en er staat een grote kledingkast — dat scheelt werk.','Warm accent (niet het groen van beneden), nieuwe vloer uit dezelfde familie en een doordacht stopcontactplan rond het bed.',false,8),
('tweede-slaapkamer','Tweede slaapkamer','verdieping','Achterzijde. Functie nog niet vastgesteld: werkkamer, logeerkamer of kinderkamer.','Ingericht op de gekozen functie, met het stopcontactplan daarop afgestemd.',false,9),
('badkamer-en-toilet-boven','Badkamer en toilet boven','verdieping','Beide in 2023 vernieuwd, met vloerverwarming.','Zelfde staat — alleen controleren, niet aanpakken.',true,10),
('bergvliering','Bergvliering','verdieping','Onbenutte vliering, toegankelijkheid en vloer nog te beoordelen.','Nog te bepalen: alleen opslag of ooit meer — dat bepaalt vliering- of dakisolatie. Veilige vlieringtrap, verlichting en een stopcontact.',false,11),
('dakterras','Dakterras','buiten','Ca. 18 m², stond niet in het oude plan. Het enige buitenverblijf dat zon krijgt — de achtertuin ligt op het noorden.','Fors terras met groen uitzicht: waterdicht, met vlonder, hekwerk, buitenverlichting en stopcontact.',false,12),
('achtertuin','Achtertuin','buiten','18 m², smal en diep (8,40 × 2,10 m), op het noorden.','Geen zonneterras, maar een groene doorgang en bergingszone met schaduwminnende beplanting.',false,13),
('voortuin','Voortuin','buiten','Onbekende staat, betaald parkeren in de straat.','Onderhoudsarm ingericht, met een duidelijke fietsenplek.',false,14),
('bergingen','Twee bergingen','buiten','Aangebouwde stenen bergingen met elektra.','Blijven zoals ze zijn — buiten scope van deze verbouwing.',true,15),
('gevel-en-dak','Gevel en dak','buiten','Zadeldak met pannen, gevel van bijna honderd jaar oud — voegwerk en loodwerk nog te beoordelen.','Hersteld voegwerk, dicht dakwerk en fris buitenschilderwerk; kleine details zoals huisnummer en buitenlamp vervangen.',false,16);

-- ============================================================================
-- SEED: klusdagen
-- ============================================================================

insert into workdays (number, name, description, prerequisite_note, drying_time, sort_order) values
(1,'Woning voorbereiden / sloop','Sloop en casco-herstel','Sleutel/toegang tot de woning',null,1),
(2,'Elektra voorbereiden','Elektra en leidingwerk','Klusdag 1 afgerond',null,2),
(3,'Elektricien','Elektra en leidingwerk','Klusdag 2 afgerond, elektra-inventarisatie en offerte rond, elektraplan definitief',null,3),
(4,'Timmer- en herstelwerk','Sloop en casco-herstel','Klusdag 3 afgerond (elektra dicht in de wanden)',null,4),
(5,'Vlieringtrap maken of herstellen','Sloop en casco-herstel','Besluit vliering (opslag/bewoonbaar) genomen, asbestcheck gedaan',null,5),
(6,'Isolatiewerk','Isolatie vloer en dak','Kruipruimte- en spouwonderzoek afgerond, isolatie-offertes rond, klusdag 1 afgerond','Kit/schuim bij kierdichting: laat volgens fabrieksvoorschrift uitharden vóór je verder afwerkt.',6),
(7,'Wand- en plafondherstel','Herstel en schilderwerk','Klusdag 3 en 6 afgerond (elektra en isolatie dicht)','Stucwerk: minimaal 24 uur droogtijd voor je gaat schuren.',7),
(8,'Schuren, vullen en kitten','Herstel en schilderwerk','Klusdag 7 afgerond en volledig droog','Laat plamuur en kit minimaal 24 uur drogen voordat je verder schuurt of schildert.',8),
(9,'Schilderwerk plafonds','Herstel en schilderwerk','Klusdag 8 afgerond, stofvrij','Minimaal 4 tot 24 uur tussen de lagen, afhankelijk van de verf — check het blik.',9),
(10,'Schilderwerk wanden','Herstel en schilderwerk','Klusdag 9 afgerond (plafonds droog)','Minimaal 4 tot 24 uur tussen de lagen, afhankelijk van de verf.',10),
(11,'Deuren, kozijnen en plinten afwerken','Herstel en schilderwerk','Klusdag 10 afgerond','Lak: 12 tot 24 uur droogtijd per laag.',11),
(12,'Vloer leggen','Vloer, plinten en trap','Schilderwerk volledig droog, vloerisolatie klaar, materiaal/kleur/legpatroon definitief, exacte m² opgemeten, offerte Barry rond','Afhankelijk van het systeem (lijm/klik) — vraag de vloerlegger naar de exacte loop-/belastingtijd.',12),
(13,'Vloerplinten monteren','Vloer, plinten en trap','Klusdag 12 afgerond, vloer volledig belastbaar',null,13),
(14,'Trap afwerken','Vloer, plinten en trap','Besluit trapafwerking genomen, schilderwerk grotendeels klaar',null,14),
(15,'TV-wand / BESTÅ-meubel plaatsen','Interieur en oplevering','Vloer en plinten klaar, meubel besteld en geleverd',null,15),
(16,'Verlichting monteren','Interieur en oplevering','Elektra klaar, definitieve lampenlijst, armaturen in huis',null,16),
(17,'Raamdecoratie','Interieur en oplevering','Gordijnen/rails besteld en geleverd, schilderwerk droog',null,17),
(18,'Meubels plaatsen','Interieur en oplevering','Vloer, plinten en schilderwerk klaar',null,18),
(19,'Restpunten en oplevering','Interieur en oplevering','Alle voorgaande klusdagen afgerond',null,19);

insert into workday_dependencies (workday_id, depends_on_workday_id)
select w1.id, w2.id from workdays w1, workdays w2 where (w1.number, w2.number) in
  ((2,1),(3,2),(4,3),(6,1),(7,3),(7,6),(8,7),(9,8),(10,9),(11,10),(12,11),(13,12),(14,10),(15,13),(16,3),(17,10),(18,13),(19,15),(19,16),(19,17),(19,18));

-- ============================================================================
-- SEED: werkzaamheden (per kamer)
-- ============================================================================

insert into tasks (title, room_id, workday_id, person_id, category) values
('Meterkast beoordelen: groepen, aardlek, eventuele oude bedrading', (select id from rooms where slug='entree-en-gang'), (select id from workdays where number=2), (select id from people where name='Tom'), 'Elektra'),
('Meterkastdeur strak in wandkleur schilderen zodat hij wegvalt', (select id from rooms where slug='entree-en-gang'), (select id from workdays where number=10), (select id from people where name='Tom'), 'Schilderwerk'),
('Wand- en plafondherstel, daarna schilderen in de warme basiskleur', (select id from rooms where slug='entree-en-gang'), (select id from workdays where number=7), (select id from people where name='Tom'), 'Herstel'),
('Verlichting vervangen: plafondpunt plus eventueel een wandpunt bij de trap', (select id from rooms where slug='entree-en-gang'), (select id from workdays where number=16), (select id from people where name='Tom'), 'Installatie'),
('Schakelmateriaal vervangen, één serie door het hele huis', (select id from rooms where slug='entree-en-gang'), (select id from workdays where number=3), (select id from people where name='Elektricien'), 'Elektra'),
('Vloer laten doorlopen of bewust een afwijkende, robuuste entreeoplossing', (select id from rooms where slug='entree-en-gang'), (select id from workdays where number=12), (select id from people where name='Barry'), 'Vloer'),
('Plek voor jassen en schoenen bepalen: kapstok of smalle kast', (select id from rooms where slug='entree-en-gang'), (select id from workdays where number=18), (select id from people where name='Tom'), 'Interieur'),

('Groene accentwand definitief kiezen: alleen de TV-wand, niet meer', (select id from rooms where slug='woonkamer'), (select id from workdays where number=10), (select id from people where name='Tom'), 'Schilderwerk'),
('Overige wanden en plafond in de warme basistint', (select id from rooms where slug='woonkamer'), (select id from workdays where number=10), (select id from people where name='Tom'), 'Schilderwerk'),
('Trapkast onder de trap: behouden, opnieuw indelen of dichtzetten', (select id from rooms where slug='woonkamer'), (select id from workdays where number=4), (select id from people where name='Tom'), 'Timmerwerk'),
('Bekabeling TV-wand wegwerken: stroom, data, HDMI-loze leiding', (select id from rooms where slug='woonkamer'), (select id from workdays where number=2), (select id from people where name='Tom'), 'Elektra'),
('Zwevend TV-meubel over vrijwel de volle breedte, op maat laten maken of kopen', (select id from rooms where slug='woonkamer'), (select id from workdays where number=15), (select id from people where name='Tom'), 'Interieur'),
('Houtaccent of lattenwand in walnoot of gerookt eiken, hoogte en breedte vastleggen', (select id from rooms where slug='woonkamer'), (select id from workdays where number=15), (select id from people where name='Tom'), 'Interieur'),
('Lichtplan: spots plus minimaal twee sfeerpunten, alles dimbaar en warm wit', (select id from rooms where slug='woonkamer'), (select id from workdays where number=16), (select id from people where name='Tom'), 'Installatie'),
('Bestaande koof of inbouwspots controleren en meenemen in het plan', (select id from rooms where slug='woonkamer'), (select id from workdays where number=2), (select id from people where name='Tom'), 'Elektra'),
('Gordijnrail zo hoog mogelijk, liefst tegen het plafond', (select id from rooms where slug='woonkamer'), (select id from workdays where number=17), (select id from people where name='Tom'), 'Interieur'),
('Positie van de hoekbank vastleggen vóór de stopcontacten definitief zijn', (select id from rooms where slug='woonkamer'), (select id from workdays where number=2), (select id from people where name='Tom'), 'Elektra'),
('Eventuele airco-binnenunit positie bepalen', (select id from rooms where slug='woonkamer'), (select id from workdays where number=2), (select id from people where name='Tom'), 'Elektra'),
('Deur naar de gang: houden, vervangen of vervangen door een variant met glas', (select id from rooms where slug='woonkamer'), (select id from workdays where number=11), (select id from people where name='Tom'), 'Afwerking'),

('Als de schuifdeur eruit gaat: opening herstellen en omlijsting strak afwerken', (select id from rooms where slug='keuken'), (select id from workdays where number=4), (select id from people where name='Tom'), 'Timmerwerk'),
('Plinten en omlijsting rond de doorgang nalopen', (select id from rooms where slug='keuken'), (select id from workdays where number=13), (select id from people where name='Tom'), 'Afwerking'),
('Afzuigkap controleren: naar buiten afvoerend of recirculatie', (select id from rooms where slug='keuken'), (select id from workdays where number=1), (select id from people where name='Tom'), 'Controle'),
('Stopcontacten op het werkblad tellen en waar nodig uitbreiden', (select id from rooms where slug='keuken'), (select id from workdays where number=3), (select id from people where name='Elektricien'), 'Elektra'),
('Positie wijnkoelkast bepalen: stroom en voldoende ventilatieruimte', (select id from rooms where slug='keuken'), (select id from workdays where number=2), (select id from people where name='Tom'), 'Elektra'),

('Wasmachine- en drogeropstelling beoordelen: aansluiting, afvoer, vloerput', (select id from rooms where slug='tweede-hal-en-bijkeuken'), (select id from workdays where number=1), (select id from people where name='Tom'), 'Controle'),
('Als de droger een condensdroger is: afvoer of opvang controleren', (select id from rooms where slug='tweede-hal-en-bijkeuken'), (select id from workdays where number=1), (select id from people where name='Tom'), 'Controle'),
('Ventilatie bijkeuken: mechanisch of rooster', (select id from rooms where slug='tweede-hal-en-bijkeuken'), (select id from workdays where number=6), (select id from people where name='Isolatiebedrijf'), 'Isolatie'),
('Wanden en plafond herstellen en schilderen in een praktische, lichte tint', (select id from rooms where slug='tweede-hal-en-bijkeuken'), (select id from workdays where number=7), (select id from people where name='Tom'), 'Herstel'),
('Verlichting en schakelmateriaal vervangen (bijkeuken)', (select id from rooms where slug='tweede-hal-en-bijkeuken'), (select id from workdays where number=16), (select id from people where name='Tom'), 'Installatie'),
('Vloer: praktisch en waterbestendig, hoeft niet dezelfde als de woonkamer', (select id from rooms where slug='tweede-hal-en-bijkeuken'), (select id from workdays where number=12), (select id from people where name='Barry'), 'Vloer'),
('Achterdeur controleren op tocht, sluitwerk en hang- en sluitwerk', (select id from rooms where slug='tweede-hal-en-bijkeuken'), (select id from workdays where number=4), (select id from people where name='Tom'), 'Timmerwerk'),

('Staat beoordelen: is dit ook in 2023 meegenomen of nog het oude?', (select id from rooms where slug='toilet-beneden'), null, (select id from people where name='Tom'), 'Controle'),
('Ventilatie controleren (toilet beneden)', (select id from rooms where slug='toilet-beneden'), null, (select id from people where name='Tom'), 'Controle'),

('Staat beoordelen: treden, stootborden, leuning, kraken', (select id from rooms where slug='trap'), (select id from workdays where number=1), (select id from people where name='Tom'), 'Controle'),
('Beschadigingen en naden herstellen vóór afwerking (trap)', (select id from rooms where slug='trap'), (select id from workdays where number=7), (select id from people where name='Tom'), 'Herstel'),
('Leuning: behouden en schilderen, of vervangen', (select id from rooms where slug='trap'), (select id from workdays where number=14), (select id from people where name='Tom'), 'Trap'),
('Traploper leggen (indien gekozen)', (select id from rooms where slug='trap'), (select id from workdays where number=14), (select id from people where name='Tom'), 'Trap'),
('Verlichting op de trap meenemen in het lichtplan', (select id from rooms where slug='trap'), (select id from workdays where number=16), (select id from people where name='Tom'), 'Installatie'),

('Nieuwe vloer doorzetten vanaf de trap', (select id from rooms where slug='overloop'), (select id from workdays where number=12), (select id from people where name='Barry'), 'Vloer'),
('Wanden en plafond herstellen en schilderen (overloop)', (select id from rooms where slug='overloop'), (select id from workdays where number=7), (select id from people where name='Tom'), 'Herstel'),
('Verlichting en schakelmateriaal vervangen (overloop)', (select id from rooms where slug='overloop'), (select id from workdays where number=16), (select id from people where name='Tom'), 'Installatie'),
('Toegang tot de vliering netjes afwerken', (select id from rooms where slug='overloop'), (select id from workdays where number=5), (select id from people where name='Tom'), 'Timmerwerk'),
('Overgang trap naar overloopvloer detailleren', (select id from rooms where slug='overloop'), (select id from workdays where number=13), (select id from people where name='Tom'), 'Afwerking'),

('Bestaande kledingkast beoordelen: behouden, aanpassen of vervangen', (select id from rooms where slug='ouderslaapkamer'), (select id from workdays where number=1), (select id from people where name='Tom'), 'Controle'),
('Stucwerk nalopen op scheuren, daarna schilderen (ouderslaapkamer)', (select id from rooms where slug='ouderslaapkamer'), (select id from workdays where number=7), (select id from people where name='Tom'), 'Herstel'),
('Accentkleur bepalen en de positie ervan: achter het bed of één hele wand', (select id from rooms where slug='ouderslaapkamer'), (select id from workdays where number=10), (select id from people where name='Tom'), 'Schilderwerk'),
('Nieuwe vloer, zelfde familie als beneden (ouderslaapkamer)', (select id from rooms where slug='ouderslaapkamer'), (select id from workdays where number=12), (select id from people where name='Barry'), 'Vloer'),
('Bedpositie vastleggen vóór de stopcontacten: twee kanten stroom en USB', (select id from rooms where slug='ouderslaapkamer'), (select id from workdays where number=2), (select id from people where name='Tom'), 'Elektra'),
('Verlichting: plafondpunt plus twee bedpunten, apart schakelbaar', (select id from rooms where slug='ouderslaapkamer'), (select id from workdays where number=16), (select id from people where name='Tom'), 'Installatie'),
('Raamdecoratie straatzijde: verduisterend, privacy overdag', (select id from rooms where slug='ouderslaapkamer'), (select id from workdays where number=17), (select id from people where name='Tom'), 'Interieur'),
('Deurklink binnendeur vervangen (ouderslaapkamer)', (select id from rooms where slug='ouderslaapkamer'), (select id from workdays where number=11), (select id from people where name='Tom'), 'Afwerking'),
('Deurlijst of omlijsting plaatsen of vervangen (ouderslaapkamer)', (select id from rooms where slug='ouderslaapkamer'), (select id from workdays where number=11), (select id from people where name='Tom'), 'Afwerking'),
('Radiator beoordelen: positie, capaciteit, uiterlijk', (select id from rooms where slug='ouderslaapkamer'), (select id from workdays where number=4), (select id from people where name='Tom'), 'Timmerwerk'),

('Bij werkkamer: bureaupositie, extra stroom en netwerk', (select id from rooms where slug='tweede-slaapkamer'), (select id from workdays where number=2), (select id from people where name='Tom'), 'Elektra'),
('Nieuwe vloer, zelfde familie (tweede slaapkamer)', (select id from rooms where slug='tweede-slaapkamer'), (select id from workdays where number=12), (select id from people where name='Barry'), 'Vloer'),
('Wanden en plafond herstellen en schilderen (tweede slaapkamer)', (select id from rooms where slug='tweede-slaapkamer'), (select id from workdays where number=7), (select id from people where name='Tom'), 'Herstel'),
('Verlichting en schakelmateriaal (tweede slaapkamer)', (select id from rooms where slug='tweede-slaapkamer'), (select id from workdays where number=16), (select id from people where name='Tom'), 'Installatie'),
('Raamdecoratie (tweede slaapkamer)', (select id from rooms where slug='tweede-slaapkamer'), (select id from workdays where number=17), (select id from people where name='Tom'), 'Interieur'),
('Deurklink en deurlijst gelijktrekken met de andere slaapkamer', (select id from rooms where slug='tweede-slaapkamer'), (select id from workdays where number=11), (select id from people where name='Tom'), 'Afwerking'),

('Kitnaden en voegen nalopen', (select id from rooms where slug='badkamer-en-toilet-boven'), null, (select id from people where name='Tom'), 'Controle'),
('Ventilatie testen, zeker voordat je gaat kierdichten', (select id from rooms where slug='badkamer-en-toilet-boven'), (select id from workdays where number=6), (select id from people where name='Tom'), 'Isolatie'),
('Doorgang naar het dakterras controleren op waterdichtheid en drempel', (select id from rooms where slug='badkamer-en-toilet-boven'), null, (select id from people where name='Tom'), 'Controle'),

('Vlieringtrap maken of vervangen, veilig en stevig', (select id from rooms where slug='bergvliering'), (select id from workdays where number=5), (select id from people where name='Tom'), 'Timmerwerk'),
('Asbestcheck vóór je er iets gaat slopen of isoleren', (select id from rooms where slug='bergvliering'), (select id from workdays where number=1), (select id from people where name='Gecertificeerd bureau'), 'Controle'),
('Vloer beoordelen op draagkracht (bergvliering)', (select id from rooms where slug='bergvliering'), (select id from workdays where number=1), (select id from people where name='Tom'), 'Controle'),
('Verlichting en één stopcontact aanbrengen (bergvliering)', (select id from rooms where slug='bergvliering'), (select id from workdays where number=16), (select id from people where name='Tom'), 'Installatie'),
('Dakbeschot en pannen van binnenuit bekijken op vocht en lichtinval', (select id from rooms where slug='bergvliering'), (select id from workdays where number=1), (select id from people where name='Tom'), 'Controle'),

('Dakbedekking controleren op leeftijd, naden en afschot', (select id from rooms where slug='dakterras'), null, (select id from people where name='Tom'), 'Buiten'),
('Afvoer en noodoverloop controleren (dakterras)', (select id from rooms where slug='dakterras'), null, (select id from people where name='Tom'), 'Buiten'),
('Hekwerk of balustrade op veiligheid en hoogte beoordelen', (select id from rooms where slug='dakterras'), null, (select id from people where name='Tom'), 'Buiten'),
('Vlonder of tegels: staat en of hij eraf moet voor inspectie van de dakbedekking', (select id from rooms where slug='dakterras'), null, (select id from people where name='Tom'), 'Buiten'),
('Buitenstopcontact en verlichting aanleggen (dakterras)', (select id from rooms where slug='dakterras'), null, (select id from people where name='Elektricien'), 'Elektra'),
('Windbeschutting en privacy richting buren bekijken', (select id from rooms where slug='dakterras'), null, (select id from people where name='Tom'), 'Buiten'),
('Draagkracht checken voordat je zware plantenbakken plaatst', (select id from rooms where slug='dakterras'), null, (select id from people where name='Tom'), 'Buiten'),

('Bestrating beoordelen en besluiten over vervangen', (select id from rooms where slug='achtertuin'), null, (select id from people where name='Tom'), 'Tuin'),
('Beplanting kiezen die schaduw verdraagt: varens, hosta, hortensia, klimop langs de schutting', (select id from rooms where slug='achtertuin'), null, (select id from people where name='Tom'), 'Tuin'),
('Schutting en achterompoort nalopen op staat en sluitwerk', (select id from rooms where slug='achtertuin'), null, (select id from people where name='Tom'), 'Tuin'),
('Buitenkraan en buitenverlichting (achtertuin)', (select id from rooms where slug='achtertuin'), null, (select id from people where name='Tom'), 'Tuin'),
('Route naar de bergingen vrijhouden, fietsen kunnen erdoor', (select id from rooms where slug='achtertuin'), null, (select id from people where name='Tom'), 'Tuin'),
('Regenwaterafvoer en bestrating op afschot controleren', (select id from rooms where slug='achtertuin'), null, (select id from people where name='Tom'), 'Tuin'),

('Onderhoudsarm inrichten (voortuin)', (select id from rooms where slug='voortuin'), null, (select id from people where name='Tom'), 'Tuin'),
('Fietsenplek bepalen, gezien betaald parkeren in de straat', (select id from rooms where slug='voortuin'), null, (select id from people where name='Tom'), 'Tuin'),
('Erfafscheiding en beplanting (voortuin)', (select id from rooms where slug='voortuin'), null, (select id from people where name='Tom'), 'Tuin'),

('Staat beoordelen: dak, deur, vocht (bergingen)', (select id from rooms where slug='bergingen'), null, (select id from people where name='Tom'), 'Controle'),
('Elektra nalopen, er ligt al stroom (bergingen)', (select id from rooms where slug='bergingen'), null, (select id from people where name='Tom'), 'Controle'),
('Indeling bepalen: één voor fietsen, één voor gereedschap en opslag', (select id from rooms where slug='bergingen'), null, (select id from people where name='Tom'), 'Controle'),
('Verlichting toevoegen (bergingen)', (select id from rooms where slug='bergingen'), null, (select id from people where name='Tom'), 'Installatie'),

('Voegwerk voor- en achtergevel beoordelen en lokaal herstellen', (select id from rooms where slug='gevel-en-dak'), null, (select id from people where name='Schilder/gevelpartij'), 'Buiten'),
('Scheuren en aansluitingen bij kozijnen nalopen (gevel)', (select id from rooms where slug='gevel-en-dak'), null, (select id from people where name='Schilder/gevelpartij'), 'Buiten'),
('Buitenschilderwerk kozijnen, deuren, boeidelen', (select id from rooms where slug='gevel-en-dak'), (select id from workdays where number=10), (select id from people where name='Tom'), 'Schilderwerk'),
('Dakpannen, dakbeschot en nokvorsten controleren', (select id from rooms where slug='gevel-en-dak'), null, (select id from people where name='Dakdekker'), 'Buiten'),
('Goten en hemelwaterafvoer schoonmaken en controleren', (select id from rooms where slug='gevel-en-dak'), null, (select id from people where name='Tom'), 'Buiten'),
('Loodwerk bij schoorsteen en dakterrasaansluiting', (select id from rooms where slug='gevel-en-dak'), null, (select id from people where name='Dakdekker'), 'Buiten'),
('Schoorsteen beoordelen: gebruik, voegwerk, kap', (select id from rooms where slug='gevel-en-dak'), null, (select id from people where name='Dakdekker'), 'Buiten'),
('Huisnummer, bel, brievenbus en buitenlamp vervangen — klein, zichtbaar effect', (select id from rooms where slug='gevel-en-dak'), (select id from workdays where number=18), (select id from people where name='Tom'), 'Afwerking');

-- ============================================================================
-- SEED: werkzaamheden zonder specifieke kamer (hele huis / logistiek, per klusdag)
-- ============================================================================

insert into tasks (title, room_id, workday_id, person_id, category, is_external) values
('Woning leegmaken', null, (select id from workdays where number=1), (select id from people where name='Tom'), 'Sloop', false),
('Vloeren en onderdelen die blijven beschermen', null, (select id from workdays where number=1), (select id from people where name='Tom'), 'Sloop', false),
('Afvalplek/container voorbereiden', null, (select id from workdays where number=1), (select id from people where name='Tom'), 'Sloop', false),
('Schuifdeur keuken verwijderen indien besloten', null, (select id from workdays where number=1), (select id from people where name='Tom'), 'Sloop', false),
('Losse onderdelen/verouderd schakelmateriaal verwijderen waar nodig', null, (select id from workdays where number=1), (select id from people where name='Tom'), 'Sloop', false),
('Werkzaamheden voor elektricien markeren', null, (select id from workdays where number=1), (select id from people where name='Tom'), 'Sloop', false),
('Foto''s maken vóór start werkzaamheden', null, (select id from workdays where number=1), (select id from people where name='Tom'), 'Administratie', false),

('Locaties stopcontacten en schakelaars bepalen', null, (select id from workdays where number=2), (select id from people where name='Tom'), 'Elektra', false),
('Smart-home wensen meenemen', null, (select id from workdays where number=2), (select id from people where name='Tom'), 'Elektra', false),
('Netwerk/UTP waar nodig voorbereiden', null, (select id from workdays where number=2), (select id from people where name='Tom'), 'Elektra', false),
('Sleuven en gaten maken', null, (select id from workdays where number=2), (select id from people where name='Tom'), 'Elektra', false),

('Groepenkast beoordelen en zo nodig uitbreiden of vervangen', null, (select id from workdays where number=3), (select id from people where name='Elektricien'), 'Elektra', true),
('Bedrading vervangen waar verouderd', null, (select id from workdays where number=3), (select id from people where name='Elektricien'), 'Elektra', true),
('Stopcontacten en schakelaars aansluiten', null, (select id from workdays where number=3), (select id from people where name='Elektricien'), 'Elektra', true),
('Bekabeling airco en wijnkoelkast aansluiten', null, (select id from workdays where number=3), (select id from people where name='Elektricien'), 'Elektra', true),
('Netwerk/UTP aansluiten', null, (select id from workdays where number=3), (select id from people where name='Elektricien'), 'Elektra', true),

('Deurkozijnen rechtzetten waar nodig', null, (select id from workdays where number=4), (select id from people where name='Tom'), 'Timmerwerk', false),

('Bodem- of vloerisolatie kruipruimte aanbrengen', null, (select id from workdays where number=6), (select id from people where name='Isolatiebedrijf'), 'Isolatie', true),
('Vliering- of dakisolatie aanbrengen', null, (select id from workdays where number=6), (select id from people where name='Isolatiebedrijf'), 'Isolatie', true),
('Ventilatie op orde brengen', null, (select id from workdays where number=6), (select id from people where name='Isolatiebedrijf'), 'Isolatie', true),
('Kierdichting uitvoeren', null, (select id from workdays where number=6), (select id from people where name='Isolatiebedrijf'), 'Isolatie', true),
('Foto''s maken tijdens uitvoering voor het ISDE-dossier', null, (select id from workdays where number=6), (select id from people where name='Tom'), 'Administratie', false),

('Gaten en sleuven dichtzetten', null, (select id from workdays where number=7), (select id from people where name='Tom'), 'Herstel', false),

('Wanden en plafonds schuren', null, (select id from workdays where number=8), (select id from people where name='Tom'), 'Herstel', false),
('Naden en gaatjes vullen', null, (select id from workdays where number=8), (select id from people where name='Tom'), 'Herstel', false),
('Kitnaden aanbrengen waar nodig', null, (select id from workdays where number=8), (select id from people where name='Tom'), 'Herstel', false),
('Stofvrij maken vóór schilderwerk', null, (select id from workdays where number=8), (select id from people where name='Tom'), 'Herstel', false),

('Afplakken en afschermen', null, (select id from workdays where number=9), (select id from people where name='Tom'), 'Schilderwerk', false),
('Eerste laag plafonds schilderen', null, (select id from workdays where number=9), (select id from people where name='Tom'), 'Schilderwerk', false),
('Tweede laag plafonds schilderen', null, (select id from workdays where number=9), (select id from people where name='Tom'), 'Schilderwerk', false),

('Warme basistint laatste ronde aanbrengen in alle ruimtes', null, (select id from workdays where number=10), (select id from people where name='Tom'), 'Schilderwerk', false),

('Aansluiting nieuwe vloer op keukenvloer en hal controleren', null, (select id from workdays where number=12), (select id from people where name='Barry'), 'Vloer', true),
('Drempels en overgangen afwerken', null, (select id from workdays where number=12), (select id from people where name='Barry'), 'Vloer', true),

('Plinten op maat zagen', null, (select id from workdays where number=13), (select id from people where name='Tom'), 'Afwerking', false),
('Hoeken en overgangen plinten afwerken', null, (select id from workdays where number=13), (select id from people where name='Tom'), 'Afwerking', false),

('Armaturen ophangen per ruimte', null, (select id from workdays where number=16), (select id from people where name='Tom'), 'Installatie', false),
('Schakelmateriaal testen', null, (select id from workdays where number=16), (select id from people where name='Tom'), 'Installatie', false),
('Smart-home instellingen configureren (indien van toepassing)', null, (select id from workdays where number=16), (select id from people where name='Tom'), 'Installatie', false),

('Hoekbank positioneren', null, (select id from workdays where number=18), (select id from people where name='Tom'), 'Interieur', false),
('Laatste losse items uitpakken en plaatsen', null, (select id from workdays where number=18), (select id from people where name='Tom'), 'Interieur', false),

('Restpuntenlijst doorlopen', null, (select id from workdays where number=19), (select id from people where name='Tom'), 'Controle', false),
('Kitnaden en detailafwerking controleren', null, (select id from workdays where number=19), (select id from people where name='Tom'), 'Controle', false),
('Ventilatie testen na kierdichting en isolatie', null, (select id from workdays where number=19), (select id from people where name='Tom'), 'Controle', false),
('Dossier compleet maken: facturen, foto''s, garanties', null, (select id from workdays where number=19), (select id from people where name='Tom'), 'Administratie', false);

-- ============================================================================
-- SEED: acties (samenvoeging van besluiten, uit te zoeken en acties)
-- ============================================================================

insert into actions (title, category, deadline, person_id, status, notes, blocks_workday_id) values
('Heeft de woning een spouw? Endoscopisch laten vaststellen', 'Uitzoeken', 'Vóór alle andere offertes', (select id from people where name='Isolatiebedrijf'), 'Open', null, (select id from workdays where number=6)),
('Staat en toegankelijkheid van de kruipruimte, en of er water staat', 'Uitzoeken', 'Vóór alle andere offertes', (select id from people where name='Isolatiebedrijf'), 'Open', null, (select id from workdays where number=6)),
('Funderingstype en of er een funderingsonderzoek of gemeentedossier is', 'Uitzoeken', 'Zo snel mogelijk', (select id from people where name='Gemeente'), 'Open', null, null),
('Is er asbest aanwezig, en waar', 'Uitzoeken', 'Vóór klusdag 1', (select id from people where name='Gecertificeerd bureau'), 'Open', null, (select id from workdays where number=1)),
('Staat van de groepenkast: aantal groepen en aardlekschakelaars', 'Uitzoeken', 'Vóór elektra-offerte', (select id from people where name='Elektricien'), 'Open', null, null),
('Materiaal van riolering en waterleiding', 'Uitzoeken', 'Zo snel mogelijk', (select id from people where name='Loodgieter'), 'Open', null, null),
('Welke ventilatie er nu is per ruimte', 'Uitzoeken', 'Vóór isolatiewerk', (select id from people where name='Tom'), 'Open', null, null),
('Is er een bouwkundig rapport van de aankoop, en wat staat erin', 'Uitzoeken', 'Zo snel mogelijk', (select id from people where name='Tom'), 'Open', null, null),
('Exacte m² per ruimte opmeten en definitief vaststellen', 'Uitzoeken', 'Vóór vloer bestellen', (select id from people where name='Barry'), 'Open', null, (select id from workdays where number=12)),
('Is het toilet beneden ook in 2023 vernieuwd of nog het oude', 'Uitzoeken', 'Zo snel mogelijk', (select id from people where name='Tom'), 'Open', null, null),
('Parkeervergunning aanvragen: voorwaarden en wachttijd', 'Uitzoeken', 'Zo snel mogelijk', (select id from people where name='Tom'), 'Open', null, null),

('Vliering: alleen opslag of ooit bewoonbaar', 'Beslissen', 'Vóór isolatie-offerte', (select id from people where name='Tom'), 'Open', 'Bepaalt of het vliering- of dakisolatie wordt.', (select id from workdays where number=6)),
('Gevelisolatie doen of niet, na het spouwonderzoek', 'Beslissen', 'Vóór schilderwerk', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=10)),
('Schilderwerk zelf doen of uitbesteden', 'Beslissen', '—', (select id from people where name='Tom'), 'Gedaan', 'Besloten: zelf doen, binnen en buiten.', null),
('Airco nu voorbereiden of niet', 'Beslissen', 'Vóór elektricien', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=3)),
('Keukenvloer: behouden, vervangen of laten aansluiten', 'Beslissen', 'Vóór vloerbestelling', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=12)),
('Vloer: materiaal, kleur, legpatroon', 'Beslissen', 'Vóór bestelling', (select id from people where name='Tom'), 'Open', 'Visgraat vraagt 15 tot 20 procent meer materiaal en meer legkosten.', (select id from workdays where number=12)),
('Functie tweede slaapkamer', 'Beslissen', 'Vóór elektricien', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=3)),
('Wijnkoelkast: wel of niet, en waar', 'Beslissen', 'Vóór elektricien', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=3)),
('Schuifdeur keuken verwijderen: ja of nee', 'Beslissen', 'Vóór klusdag 1', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=1)),
('Deur naar de gang: houden, vervangen, met glas', 'Beslissen', 'Vóór schilderwerk', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=11)),
('Trapafwerking: schilderen, bekleden of beide', 'Beslissen', 'Vóór klusdag 14', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=14)),
('Definitieve verfkleuren per ruimte', 'Beslissen', 'Vóór inkoop verf', (select id from people where name='Tom'), 'Open', 'Kandidaten: Dune, Night, Umber.', (select id from workdays where number=9)),
('Smart home: alleen verlichting of breder', 'Beslissen', 'Vóór elektricien', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=3)),
('Elektraplan definitief maken', 'Beslissen', 'Vóór elektricien', (select id from people where name='Tom'), 'Open', 'Afhankelijk van bovenstaande elektra-beslissingen.', (select id from workdays where number=3)),
('Positie TV, stopcontacten en kabeldoorvoer bepalen', 'Beslissen', 'Vóór elektra voorbereiden', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=2)),
('BESTÅ/tv-meubel: maatvoering, indeling, fronten en bovenblad bepalen', 'Beslissen', 'Zo vroeg mogelijk', (select id from people where name='Tom'), 'Open', 'Levertijd 6–10 weken bij maatwerk.', null),
('Beslissen of BESTÅ wordt meegeschilderd', 'Beslissen', 'Vóór bestellen BESTÅ', (select id from people where name='Tom'), 'Open', null, null),
('Vloerplinten kiezen', 'Beslissen', 'Vóór bestelling', (select id from people where name='Tom'), 'Open', null, null),
('Deur- en kozijnlijsten bepalen', 'Beslissen', 'Vóór bestelling', (select id from people where name='Tom'), 'Open', null, null),
('Gordijnen en raamdecoratie kiezen', 'Beslissen', 'Vóór klusdag 17', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=17)),
('Meubels inventariseren: houden, verkopen, weg', 'Beslissen', 'Vóór verhuizing', (select id from people where name='Tom'), 'Open', null, null),
('Dakterras en tuin: nu of volgend seizoen', 'Beslissen', 'Kan later', (select id from people where name='Tom'), 'Open', 'Budget en planning.', null),

('Kruipruimte- en spouwonderzoek inplannen', 'Offerte aanvragen', 'Vóór alle andere offertes', (select id from people where name='Isolatiebedrijf'), 'Open', null, (select id from workdays where number=6)),
('Isolatie-offertes vloer en dak aanvragen en werkzaamheden inplannen', 'Offerte aanvragen', 'Vóór vloerplanning', (select id from people where name='Isolatiebedrijf'), 'Open', 'Afhankelijk van spouw- en kruipruimteonderzoek.', (select id from workdays where number=6)),
('Offerte vloer definitief maken', 'Offerte aanvragen', 'Na opmeten', (select id from people where name='Barry'), 'Open', null, (select id from workdays where number=12)),
('Elektra inventarisatie en offerte', 'Offerte aanvragen', 'Vóór schilderwerk', (select id from people where name='Thomas van Ooijen'), 'Open', 'Alternatief: Ben Nikkels.', (select id from workdays where number=3)),
('Offerte gevelherstel en buitenschilderwerk', 'Offerte aanvragen', 'Vóór buitenwerk', (select id from people where name='Schilder/gevelpartij'), 'Open', null, null),
('Dakinspectie inplannen', 'Offerte aanvragen', 'Vóór dakisolatie', (select id from people where name='Dakdekker'), 'Open', null, (select id from workdays where number=6)),

('Bouwkundige keuring plannen als die er niet is', 'Vakman inplannen', 'Direct', (select id from people where name='Keuringsbedrijf'), 'Open', null, null),
('Algemeen klus- en timmerwerk bespreken', 'Vakman inplannen', 'Vóór klusdag 1', (select id from people where name='Marcel Haagsman'), 'Open', 'Alternatief: John.', (select id from workdays where number=4)),
('Vlieringtrap: zelf maken of timmerman inplannen', 'Vakman inplannen', 'Vóór klusdag 5', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=5)),
('Trap-uitvoerder inplannen indien uitbesteed', 'Vakman inplannen', 'Vóór klusdag 14', (select id from people where name='Tom'), 'Open', 'Afhankelijk van gekozen trapafwerking.', (select id from workdays where number=14)),
('Isolatiebedrijf definitief inplannen voor uitvoering', 'Vakman inplannen', 'Vóór klusdag 6', (select id from people where name='Isolatiebedrijf'), 'Open', null, (select id from workdays where number=6)),

('Verf en schildermaterialen bestellen', 'Bestellen / inkopen', 'Vóór klusdag 9', (select id from people where name='Tom'), 'Open', 'Afhankelijk van definitieve verfkleuren.', (select id from workdays where number=9)),
('BESTÅ/tv-meubel bestellen', 'Bestellen / inkopen', 'Na definitief ontwerp', (select id from people where name='Tom'), 'Open', 'Levertijd 6–10 weken.', (select id from workdays where number=15)),
('Deurklink slaapkamer bestellen/vervangen', 'Bestellen / inkopen', 'Vóór klusdag 11', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=11)),
('Deur- en kozijnlijsten bestellen', 'Bestellen / inkopen', 'Vóór klusdag 11', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=11)),
('Trapmateriaal bestellen (overzettreden/bekleding/traploper)', 'Bestellen / inkopen', 'Vóór klusdag 14', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=14)),
('Gordijnen/raamdecoratie bestellen', 'Bestellen / inkopen', 'Vóór klusdag 17', (select id from people where name='Tom'), 'Open', 'Let op levertijd.', (select id from workdays where number=17)),
('Definitieve lampenlijst maken en armaturen bestellen', 'Bestellen / inkopen', 'Vóór klusdag 16', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=16)),
('Container regelen', 'Bestellen / inkopen', '1–2 weken vóór klusdag 1', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=1)),
('Beschermmateriaal kopen (folie, karton, stofzeilen)', 'Bestellen / inkopen', 'Vóór klusdag 1', (select id from people where name='Tom'), 'Open', null, (select id from workdays where number=1)),
('Benodigde gereedschappen controleren en aanvullen', 'Bestellen / inkopen', 'Vóór klusdag 1', (select id from people where name='Tom'), 'Open', 'Zie de sectie Gereedschap.', (select id from workdays where number=1)),

('Subsidiehistorie adres controleren', 'Administratie / subsidie', 'Vóór eigen aanvraag', (select id from people where name='Gemeente'), 'Open', null, null),
('Gemeentelijke verduurzamingssubsidies controleren (Alphen aan den Rijn)', 'Administratie / subsidie', 'Vóór ISDE-aanvraag', (select id from people where name='Tom'), 'Open', 'Mag gecombineerd worden met de landelijke ISDE.', null),
('ISDE-subsidievoorwaarden checken vóór aanvraag', 'Administratie / subsidie', 'Vóór aanvraag', (select id from people where name='Tom'), 'Open', 'Twee maatregelen (vloer + dak) binnen 24 maanden verdubbelt het bedrag per m². Dakisolatie 2026: € 16,25/m², min. 20 m², Rd ≥ 3,5. Ventilatie: € 400, alleen gekoppeld aan een isolatiemaatregel. Isolatie mag niet zelf uitgevoerd worden. Aanvraag pas achteraf, binnen 24 maanden, na inschrijving op het adres. 9% btw op arbeid bij isolatiewerk. Biobased materiaal geeft een bonus die niet wordt verdubbeld.', null),
('Opstalverzekering, nutsbedrijven en inschrijving regelen', 'Administratie / subsidie', '1–2 weken vóór sleuteloverdracht', (select id from people where name='Tom'), 'Open', null, null),
('ISDE-aanvraag indienen', 'Administratie / subsidie', 'Binnen 24 maanden na uitvoering, na inschrijving op adres', (select id from people where name='Tom'), 'Open', 'Afhankelijk van: isolatiewerk afgerond, facturen compleet.', null);

-- ============================================================================
-- SEED: materialen
-- ============================================================================

insert into materials (name, category, status, notes) values
('Afvalzakken en vuilniszakken', 'Sloop', 'Nog bepalen', null),
('Beschermfolie of karton voor vloeren die blijven', 'Sloop', 'Nog bepalen', null),
('Stofzeilen voor deuropeningen', 'Sloop', 'Nog bepalen', null),
('Multiplex/reparatiehout', 'Timmerwerk', 'Nog bepalen', null),
('Houtlijm en schroeven', 'Timmerwerk', 'Nog bepalen', null),
('Vlieringtrap (kant-en-klaar of materiaal)', 'Timmerwerk', 'Nog bepalen', null),
('Stucwerk/reparatiemortel', 'Herstel', 'Nog bepalen', null),
('Wapeningstape voor naden', 'Herstel', 'Nog bepalen', null),
('Schuurpapier (diverse korrels)', 'Herstel', 'Nog bepalen', null),
('Vulmiddel/plamuur', 'Herstel', 'Nog bepalen', null),
('Kit (acryl, overschilderbaar)', 'Herstel', 'Nog bepalen', null),
('Plafondverf (mat wit)', 'Verf', 'Nog bepalen', null),
('Rollers en verlengstok', 'Verf', 'Nog bepalen', null),
('Muurverf Dune', 'Verf', 'Uitzoeken', 'Kandidaat-kleur, nog niet definitief gekozen.'),
('Muurverf Night', 'Verf', 'Uitzoeken', 'Kandidaat-kleur (groen accent woonkamer), nog niet definitief gekozen.'),
('Muurverf Umber', 'Verf', 'Uitzoeken', 'Kandidaat-kleur, nog niet definitief gekozen.'),
('Primer', 'Verf', 'Nog bepalen', null),
('Lak voor houtwerk', 'Verf', 'Nog bepalen', null),
('Nieuwe deurklinken', 'Afwerking', 'Nog bepalen', null),
('Deurlijsten/omlijsting', 'Afwerking', 'Nog bepalen', null),
('PVC vloer (definitieve keuze)', 'Vloer', 'Uitzoeken', 'Materiaal, kleur en legpatroon nog niet definitief.'),
('Ondervloer', 'Vloer', 'Nog bepalen', null),
('Vloerplinten (ca. 60 m¹)', 'Vloer', 'Uitzoeken', null),
('Plintlijm of -clips', 'Vloer', 'Nog bepalen', null),
('Overzettreden of trapbekleding', 'Trap', 'Uitzoeken', 'Afhankelijk van gekozen trapafwerking.'),
('Traploper', 'Trap', 'Uitzoeken', null),
('IKEA BESTÅ frame', 'Meubels', 'Uitzoeken', 'Maatvoering en indeling nog niet definitief.'),
('BESTÅ-fronten', 'Meubels', 'Uitzoeken', null),
('Bovenblad TV-meubel', 'Meubels', 'Uitzoeken', null),
('Hout voor TV-wand (walnoot of gerookt eiken)', 'Meubels', 'Uitzoeken', null),
('Bevestigingsmateriaal (zwevend ophangsysteem)', 'Meubels', 'Nog bepalen', null),
('Armaturen per ruimte', 'Verlichting', 'Uitzoeken', 'Volgens definitieve lampenlijst.'),
('Lichtbronnen (warm wit, dimbaar)', 'Verlichting', 'Nog bepalen', null),
('Gordijnrails', 'Raamdecoratie', 'Uitzoeken', null),
('Gordijnen/raamdecoratie', 'Raamdecoratie', 'Uitzoeken', null),
('Stopcontacten', 'Elektra', 'Nog bepalen', null),
('Schakelaars', 'Elektra', 'Nog bepalen', 'Eén serie door het hele huis.'),
('UTP-kabel', 'Elektra', 'Nog bepalen', null);

-- ============================================================================
-- SEED: gereedschap
-- ============================================================================

insert into tools (name, category, have_it, status) values
('Kwasten en rollers (diverse maten)', 'Schilderwerk', false, 'Nodig'),
('Verfbakken en afplaktape', 'Schilderwerk', false, 'Nodig'),
('Schuurmachine (excenter)', 'Afwerking', false, 'Nodig'),
('Verfkrabber en plamuurmes', 'Afwerking', false, 'Nodig'),
('Accuboormachine', 'Algemeen', false, 'Nodig'),
('Slagboormachine (voor steen/beton)', 'Algemeen', false, 'Nodig'),
('Schroevendraaierset', 'Algemeen', false, 'Nodig'),
('Waterpas', 'Algemeen', false, 'Nodig'),
('Rolmaat', 'Algemeen', false, 'Nodig'),
('Hamer', 'Algemeen', false, 'Nodig'),
('Figuurzaag of handzaag', 'Timmerwerk', false, 'Nodig'),
('Ladder (trap- en rechte ladder)', 'Algemeen', false, 'Nodig'),
('Bouwstofzuiger', 'Sloop', false, 'Nodig'),
('Kruiwagen of bouwemmers', 'Sloop', false, 'Nodig'),
('Afvalzakken en stofzeilen', 'Sloop', false, 'Nodig'),
('Werkhandschoenen en veiligheidsbril', 'Veiligheid', false, 'Nodig'),
('Stofmaskers (FFP2)', 'Veiligheid', false, 'Nodig'),
('Kitpistool', 'Afwerking', false, 'Nodig'),
('Nietpistool (tacker)', 'Afwerking', false, 'Nodig'),
('Verlengsnoer en bouwlamp', 'Algemeen', false, 'Nodig');

insert into task_tools (task_id, tool_id)
select t.id, (select id from tools where name='Schuurmachine (excenter)')
from tasks t
where t.title in (
  'Wanden en plafonds schuren',
  'Staat beoordelen: treden, stootborden, leuning, kraken',
  'Leuning: behouden en schilderen, of vervangen',
  'Deurkozijnen rechtzetten waar nodig'
);

insert into task_tools (task_id, tool_id)
select t.id, (select id from tools where name='Kwasten en rollers (diverse maten)')
from tasks t
where t.category = 'Schilderwerk';

insert into task_tools (task_id, tool_id)
select t.id, (select id from tools where name='Kitpistool')
from tasks t
where t.title in ('Kitnaden aanbrengen waar nodig', 'Kitnaden en voegen nalopen', 'Kitnaden en detailafwerking controleren');

-- ============================================================================
-- SEED: risico's
-- ============================================================================

insert into risks (title, why, impact, check_text, sort_order) values
('Geen spouw', 'Bouwjaar 1929', 'Gevelisolatiebudget klopt niet, plan moet om', 'Endoscopisch onderzoek', 1),
('Natte of lage kruipruimte', 'Hoge grondwaterstand in de regio', 'Vloerisolatie kan niet, of alleen met bodemfolie erbij', 'Inspectie met foto''s', 2);

-- ============================================================================
-- SEED: opleverchecklist
-- ============================================================================

insert into handover_checklist (section, item, sort_order) values
('technisch', 'Alle stopcontacten en schakelaars recht, stevig en werkend; groepenkast gelabeld', 1),
('technisch', 'TV-kabels en voedingen volledig uit zicht, geen losse verlengsnoeren', 2),
('technisch', 'Wanden en plafonds egaal; lokale reparaties niet zichtbaar bij daglicht', 3),
('technisch', 'Vloer vlak, naden en overgangen netjes, dilatatie waar vereist, plinten strak', 4),
('technisch', 'Deuren sluiten vrij; klinken, lijsten en kitnaden netjes', 5),
('technisch', 'Trap en vlieringtrap veilig en afgewerkt', 6),
('technisch', 'Ventilatie getest na kierdichting en isolatie', 7),
('technisch', 'Gevel- en buitenschilderwerk dicht; geen onbehandeld hout of open scheuren', 8),
('technisch', 'Goten en hemelwaterafvoer doorgespoten en werkend', 9),
('technisch', 'Dakterras waterdicht, afvoer vrij', 10),
('technisch', 'Restpuntenlijst gemaakt vóór de laatste betaling', 11),
('dossier', 'Facturen met m², Rd- of U-waarde en de exacte maatregelnaam per isolatiemaatregel', 1),
('dossier', 'Foto''s vóór, tijdens en na het dichtzetten', 2),
('dossier', 'Betaalbewijzen', 3),
('dossier', 'ISDE-aanvraag ingediend na inschrijving op het adres en binnen 24 maanden', 4),
('dossier', 'Gemeentelijke regeling aangevraagd waar van toepassing', 5),
('dossier', 'Nieuw energielabel laten opnemen en vastleggen', 6),
('dossier', 'Garantiebewijzen en onderhoudsvoorschriften verzameld', 7),
('dossier', 'Alles digitaal in één map, ook voor een latere verkoop', 8);

-- ============================================================================
-- SEED: budget
-- ============================================================================

insert into budget_items (category, post, budgeted, execution_note, sort_order) values
('Verduurzaming', 'Bodem- of vloerisolatie kruipruimte (ca. 37 m²)', 2200, 'Uitbesteed, verplicht voor ISDE', 1),
('Verduurzaming', 'Vliering- of dakisolatie (ca. 30 m²)', 1200, 'Uitbesteed — pas definitief na keuze opslag/bewoonbaar', 2),
('Verduurzaming', 'Ventilatie op orde brengen', 1500, 'Uitbesteed', 3),
('Verduurzaming', 'Kierdichting', 600, 'Uitbesteed', 4),
('Verduurzaming', 'Restant enkel glas vervangen', 700, 'Uitbesteed', 5),
('Verduurzaming', 'Nieuw energielabel laten opnemen', 350, 'Adviseur', 6),
('Verduurzaming', 'Gevelisolatie: reservering tot na het onderzoek', 3500, 'Pas besluiten na spouwcheck', 7),
('Regulier', 'Vloer ca. 55 m² incl. egaliseren, ondervloer en leggen', 4000, 'Uitbesteed', 1),
('Regulier', 'Plinten ca. 60 m¹, materiaal', 500, 'Zelf', 2),
('Regulier', 'Elektra aanpassen en uitbreiden', 3200, 'Uitbesteed', 3),
('Regulier', 'Groepenkast, reservering', 1200, 'Uitbesteed', 4),
('Regulier', 'Gevelherstel en voegwerk voor- en achtergevel', 2500, 'Uitbesteed', 5),
('Regulier', 'Dakherstel, goten en loodwerk, reservering', 1500, 'Uitbesteed', 6),
('Regulier', 'Verf en schildermateriaal binnen', 1000, 'Zelf', 7),
('Regulier', 'Verf en schildermateriaal buiten', 500, 'Zelf', 8),
('Regulier', 'Trapafwerking, materiaal', 700, 'Zelf', 9),
('Regulier', 'Vlieringtrap', 600, 'Zelf of timmerman', 10),
('Regulier', 'Deuren, lijsten, klinken, klein timmerwerk', 700, 'Zelf', 11),
('Regulier', 'Container, beschermmateriaal, gereedschap', 600, 'Zelf', 12),
('Onvoorzien', 'Onvoorzien (ca. 10 procent)', 2950, null, 1);
