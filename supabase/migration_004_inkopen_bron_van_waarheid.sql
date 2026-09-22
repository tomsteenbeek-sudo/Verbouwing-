-- ============================================================================
-- Verbouwplan Leliestraat 27 — migratie 004: budget loskoppelen van
-- werkzaamheden/personen, Inkopen als enige financiële bron, materiaal/arbeid-
-- splitsing, en een "Buiten scope / later"-fase.
--
-- HOE TE GEBRUIKEN:
-- Supabase dashboard -> SQL Editor -> New query -> plak dit hele bestand -> Run.
-- Eenmalig uitvoeren, ná migratie_003. Er ging geen geld verloren: de
-- financiële velden die hier verdwijnen (tasks.estimated_*, purchases.
-- estimated_cost/committed_cost/actual_cost, payments) hadden nog geen
-- ingevulde waarden sinds migratie_003 net was gedraaid — dit is puur een
-- modelvereenvoudiging, geen datamigratie met bedragen.
-- ============================================================================

-- ============================================================================
-- Budget loskoppelen van werkzaamheden en personen
-- ============================================================================

drop table task_budget_responsibles;
drop table payments;

alter table tasks drop column estimated_labor_cost;
alter table tasks drop column estimated_material_cost;
alter table tasks drop column budget_category_id;

-- ============================================================================
-- Inkopen: materiaal/arbeid-splitsing i.p.v. begroot/verplicht/werkelijk,
-- en een "meetellen in budget"-vlag voor Buiten-scope-posten.
-- ============================================================================

alter table purchases add column estimated_material_cost numeric;
alter table purchases add column estimated_labor_cost numeric;
alter table purchases add column actual_material_cost numeric;
alter table purchases add column actual_labor_cost numeric;
alter table purchases add column count_in_budget boolean not null default true;

update purchases set estimated_material_cost = estimated_cost where estimated_cost is not null;
update purchases set actual_material_cost = actual_cost where actual_cost is not null;

alter table purchases drop column estimated_cost;
alter table purchases drop column committed_cost;
alter table purchases drop column actual_cost;

-- ============================================================================
-- Offertes: dezelfde materiaal/arbeid-splitsing (i.p.v. één bedrag)
-- ============================================================================

alter table quotes add column material_amount numeric;
alter table quotes add column labor_amount numeric;
alter table quotes drop column amount;

-- ============================================================================
-- Fase 8 — Buiten scope / later
-- ============================================================================

insert into phases (name, description, color, sort_order) values
('Buiten scope / later', 'Bewust nu niet uitgevoerd — blijft bewaard, telt niet mee in de actieve planning of voortgang.', '#8a8375', 8);

alter table tasks add column reason text check (reason in ('Budget','Later uitvoeren','Niet noodzakelijk','Eerst ervaring opdoen','Afhankelijk van andere verbouwing','Vervallen'));
alter table tasks add column desired_date text;

-- Puur informatieve kosteninschatting voor Buiten-scope-items — telt nooit mee
-- in Budget/Inkopen; dat blijft uitsluitend via de purchases-tabel lopen.
alter table tasks add column scope_estimated_cost numeric;
