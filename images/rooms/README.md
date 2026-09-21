# Kamerafbeeldingen

Sinds de migratie `supabase/migration_002_people_media_sortorder.sql` staan
kamerafbeeldingen niet meer als bestandsnaam-conventie, maar als rijen in de
databasetabel `room_images` (`room_id`, `image_url`, `type`, `caption`,
`is_cover`, `sort_order`). De bestanden in deze map blijven gewoon bestaan —
`image_url` wijst er gewoon naartoe (bv. `images/rooms/woonkamer.jpg`) — maar
welke foto bij welke kamer hoort, en of het een "gewenste" of "huidige" foto
is, staat nu in de database.

## Een foto toevoegen

1. Zet het bestand in deze map.
2. Voeg 'm toe via de site zelf: open de kamer op de Kamers-pagina en klik
   op **+ Afbeelding** (kies Gewenste of Huidige situatie, vul het pad in,
   bv. `images/rooms/woonkamer-2.jpg`).

Dat is alles — geen bestandsnaam-conventie meer nodig, en je kunt meteen ook
een bijschrift meegeven en de foto als hoofdfoto (★) instellen.

## Gewenste vs. huidige situatie

- **Gewenste situatie** (`type = desired`): ontwerp/render/inspiratie voor hoe
  de kamer moet worden. Staat bovenaan de kamerdetailpagina.
- **Huidige situatie** (`type = current`): foto van de kamer zoals die nu is.

Standaard is de hoofdfoto (cover, op de kamerkaart in het overzicht) de eerste
`desired`-foto als die er is, anders de eerste `current`-foto. Je kunt dit
altijd overschrijven door een andere foto als hoofdfoto (★) aan te wijzen.

Alle foto's zijn klikbaar en openen groot in een lightbox met vorige/volgende,
swipe op mobiel en in-/uitzoomen.
