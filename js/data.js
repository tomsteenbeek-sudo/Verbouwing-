/* Verbouwplan Leliestraat 27 — brondata
   Overgenomen uit het verbouwplan-document. Voeg per kamer een ontwerpafbeelding toe
   door een bestand te plaatsen op images/rooms/<slug>.jpg (zie ROOMS[].slug hieronder). */

const PROPERTY = {
  naam: "Leliestraat 27",
  plaats: "Alphen aan den Rijn",
  subtitel: "Eengezinswoning uit 1929 · werkdocument",
  kenmerken: [
    { label: "Type", waarde: "Eengezinswoning, tussenwoning, 2 woonlagen" },
    { label: "Bouwjaar", waarde: "1929" },
    { label: "Wonen", waarde: "75 m²" },
    { label: "Overige inpandige ruimte", waarde: "7 m²" },
    { label: "Gebouwgebonden buitenruimte", waarde: "19 m² (dakterras ca. 18 m²)" },
    { label: "Perceel", waarde: "85 m²" },
    { label: "Inhoud", waarde: "290 m³" },
    { label: "Energielabel", waarde: "E" },
    { label: "Dak", waarde: "Zadeldak met pannen" },
    { label: "Verwarming", waarde: "Intergas HR combiketel, 2020, eigendom" },
    { label: "Glas", waarde: "Grotendeels HR++" },
    { label: "Kamers", waarde: "4 kamers, 2 slaapkamers, 1 badkamer, 2 aparte toiletten" },
    { label: "Tuin", waarde: "Voortuin + achtertuin 18 m² (8,40 × 2,10 m), noorden, achterom" },
    { label: "Berging", waarde: "Aangebouwde stenen berging(en) met elektra" },
    { label: "Parkeren", waarde: "Betaald parkeren / vergunning" },
    { label: "Data", waarde: "Glasvezel en TV-kabel aanwezig" }
  ],
  bron: { tekst: "Funda-advertentie Leliestraat 27", url: "https://www.funda.nl/detail/koop/alphen-aan-den-rijn/huis-leliestraat-27/44443712/" }
};

const AL_GEDAAN = [
  { naam: "Badkamer (2023)", omschrijving: "Inloopdouche, wastafelmeubel, vloerverwarming. Niet aanraken." },
  { naam: "Toilet boven", omschrijving: "Luxe afgewerkt, vloerverwarming. Niet aanraken." },
  { naam: "Keuken", omschrijving: "Vernieuwd, wit blad, houtlook fronten, inductie, afzuigkap, oven, vaatwasser. Blijft staan." },
  { naam: "CV-ketel (2020)", omschrijving: "Nog ruim 10 jaar te gaan, eigendom." },
  { naam: "HR++ glas", omschrijving: "Grotendeels aanwezig. Alleen restposten inventariseren, geen budgetpost van betekenis." }
];

/* verdieping: "begane-grond" | "verdieping" | "buiten" */
const ROOMS = [
  {
    slug: "entree-en-gang",
    naam: "Entree en gang",
    verdieping: "begane-grond",
    nu: "Klein, donker en het eerste wat je ziet. Hier win je met licht en met een nette meterkast, niet met kleur.",
    wordt: "Lichte, opgeruimde entree met warme basiskleur, nette meterkast en een duidelijke plek voor jassen en schoenen.",
    acties: [
      "Meterkast beoordelen: groepen, aardlek, eventuele oude bedrading",
      "Meterkastdeur strak in wandkleur schilderen zodat hij wegvalt",
      "Wand- en plafondherstel, daarna schilderen in de warme basiskleur",
      "Verlichting vervangen: plafondpunt plus eventueel een wandpunt bij de trap",
      "Schakelmateriaal vervangen, één serie door het hele huis",
      "Vloer laten doorlopen of bewust een afwijkende, robuuste entreeoplossing",
      "Plek voor jassen en schoenen bepalen: kapstok of smalle kast"
    ]
  },
  {
    slug: "woonkamer",
    naam: "Woonkamer",
    verdieping: "begane-grond",
    nu: "De hoofdruimte van het huis, nog in originele staat.",
    wordt: "Eén groene wand als accent, de rest warm neutraal. Geen hoge kasten, alles laag en horizontaal zodat het plafond hoger lijkt.",
    acties: [
      "Groene accentwand definitief kiezen: alleen de TV-wand, niet meer",
      "Overige wanden en plafond in de warme basistint",
      "Trapkast onder de trap: behouden, opnieuw indelen of dichtzetten",
      "Bekabeling TV-wand wegwerken: stroom, data, HDMI-loze leiding",
      "Zwevend TV-meubel over vrijwel de volle breedte, op maat laten maken of kopen",
      "Houtaccent of lattenwand in walnoot of gerookt eiken, hoogte en breedte vastleggen",
      "Lichtplan: spots plus minimaal twee sfeerpunten, alles dimbaar en warm wit",
      "Bestaande koof of inbouwspots controleren en meenemen in het plan",
      "Gordijnrail zo hoog mogelijk, liefst tegen het plafond",
      "Positie van de hoekbank vastleggen vóór de stopcontacten definitief zijn",
      "Eventuele airco-binnenunit positie bepalen",
      "Deur naar de gang: houden, vervangen of vervangen door een variant met glas"
    ]
  },
  {
    slug: "keuken",
    naam: "Keuken",
    verdieping: "begane-grond",
    nu: "Vernieuwde keuken met wit blad, houtlook fronten, inductie, afzuigkap, oven en vaatwasser. Blijft staan.",
    wordt: "Zelfde keuken, met een opgeloste vloeraansluiting en een nette doorgang naar de woonkamer.",
    klaar: true,
    acties: [
      "Besluiten: keukenvloer behouden, vervangen of laten aansluiten op de nieuwe vloer",
      "Als de schuifdeur eruit gaat: opening herstellen en omlijsting strak afwerken",
      "Plinten en omlijsting rond de doorgang nalopen",
      "Afzuigkap controleren: naar buiten afvoerend of recirculatie",
      "Stopcontacten op het werkblad tellen en waar nodig uitbreiden",
      "Positie wijnkoelkast bepalen: stroom en voldoende ventilatieruimte"
    ]
  },
  {
    slug: "tweede-hal-en-bijkeuken",
    naam: "Tweede hal en bijkeuken",
    verdieping: "begane-grond",
    nu: "Stond niet in het oude plan, maar hier komt alles samen: was, afvoer naar de tuin, toilet.",
    wordt: "Praktische, lichte werkruimte met een goede was- en drogeropstelling en waterbestendige vloer.",
    acties: [
      "Wasmachine- en drogeropstelling beoordelen: aansluiting, afvoer, vloerput",
      "Als de droger een condensdroger is: afvoer of opvang controleren",
      "Ventilatie bijkeuken: mechanisch of rooster",
      "Wanden en plafond herstellen en schilderen in een praktische, lichte tint",
      "Verlichting en schakelmateriaal vervangen",
      "Vloer: praktisch en waterbestendig, hoeft niet dezelfde als de woonkamer",
      "Achterdeur controleren op tocht, sluitwerk en hang- en sluitwerk"
    ]
  },
  {
    slug: "toilet-beneden",
    naam: "Toilet beneden",
    verdieping: "begane-grond",
    nu: "Staat onbekend — nog te beoordelen of dit ook in 2023 is meegenomen.",
    wordt: "Functioneel en met goede ventilatie; alleen apart budget als het echt gedateerd blijkt.",
    acties: [
      "Staat beoordelen: is dit ook in 2023 meegenomen of nog het oude?",
      "Ventilatie controleren",
      "Als het gedateerd is: apart besluit en apart budget, valt buiten de huidige scope"
    ]
  },
  {
    slug: "trap",
    naam: "Trap",
    verdieping: "begane-grond",
    nu: "Originele trap, staat en afwerking nog te beoordelen.",
    wordt: "Veilige, nette trap: geschilderd en/of bekleed, met verlichting die in het lichtplan is meegenomen.",
    acties: [
      "Staat beoordelen: treden, stootborden, leuning, kraken",
      "Besluiten: schilderen, bekleden met overzettreden, of combinatie",
      "Beschadigingen en naden herstellen vóór afwerking",
      "Leuning: behouden en schilderen, of vervangen",
      "Traploper wel of niet",
      "Verlichting op de trap meenemen in het lichtplan"
    ]
  },
  {
    slug: "overloop",
    naam: "Overloop",
    verdieping: "verdieping",
    nu: "Doorgangsruimte boven, originele staat.",
    wordt: "Doorlopende nieuwe vloer vanaf de trap, herstelde wanden en plafond en een nette vlieringtoegang.",
    acties: [
      "Nieuwe vloer doorzetten vanaf de trap",
      "Wanden en plafond herstellen en schilderen",
      "Verlichting en schakelmateriaal vervangen",
      "Toegang tot de vliering netjes afwerken",
      "Overgang trap naar overloopvloer detailleren"
    ]
  },
  {
    slug: "ouderslaapkamer",
    naam: "Ouderslaapkamer",
    verdieping: "verdieping",
    nu: "Voorzijde, volle breedte. Wanden zijn al gestuukt en er staat een grote kledingkast — dat scheelt werk.",
    wordt: "Warm accent (niet het groen van beneden), nieuwe vloer uit dezelfde familie en een doordacht stopcontactplan rond het bed.",
    acties: [
      "Bestaande kledingkast beoordelen: behouden, aanpassen of vervangen",
      "Stucwerk nalopen op scheuren, daarna schilderen",
      "Accentkleur bepalen en de positie ervan: achter het bed of één hele wand",
      "Nieuwe vloer, zelfde familie als beneden",
      "Bedpositie vastleggen vóór de stopcontacten: twee kanten stroom en USB",
      "Verlichting: plafondpunt plus twee bedpunten, apart schakelbaar",
      "Raamdecoratie straatzijde: verduisterend, privacy overdag",
      "Deurklink binnendeur vervangen",
      "Deurlijst of omlijsting plaatsen of vervangen",
      "Radiator beoordelen: positie, capaciteit, uiterlijk"
    ]
  },
  {
    slug: "tweede-slaapkamer",
    naam: "Tweede slaapkamer",
    verdieping: "verdieping",
    nu: "Achterzijde. Functie nog niet vastgesteld: werkkamer, logeerkamer of kinderkamer.",
    wordt: "Ingericht op de gekozen functie, met het stopcontactplan daarop afgestemd.",
    acties: [
      "Functie definitief kiezen",
      "Bij werkkamer: bureaupositie, extra stroom en netwerk",
      "Nieuwe vloer, zelfde familie",
      "Wanden en plafond herstellen en schilderen",
      "Verlichting en schakelmateriaal",
      "Raamdecoratie",
      "Deurklink en deurlijst gelijktrekken met de andere slaapkamer"
    ]
  },
  {
    slug: "badkamer-en-toilet-boven",
    naam: "Badkamer en toilet boven",
    verdieping: "verdieping",
    nu: "Beide in 2023 vernieuwd, met vloerverwarming.",
    wordt: "Zelfde staat — alleen controleren, niet aanpakken.",
    klaar: true,
    acties: [
      "Kitnaden en voegen nalopen",
      "Ventilatie testen, zeker voordat je gaat kierdichten",
      "Doorgang naar het dakterras controleren op waterdichtheid en drempel"
    ]
  },
  {
    slug: "bergvliering",
    naam: "Bergvliering",
    verdieping: "verdieping",
    nu: "Onbenutte vliering, toegankelijkheid en vloer nog te beoordelen.",
    wordt: "Besloten: blijft opslag. Veilige vlieringtrap, verlichting en een stopcontact.",
    acties: [
      "Vlieringtrap maken of vervangen, veilig en stevig",
      "Asbestcheck vóór je er iets gaat slopen of isoleren",
      "Besluiten: alleen opslag of ooit meer — dat bepaalt vliering- of dakisolatie",
      "Vloer beoordelen op draagkracht",
      "Verlichting en één stopcontact aanbrengen",
      "Dakbeschot en pannen van binnenuit bekijken op vocht en lichtinval"
    ]
  },
  {
    slug: "dakterras",
    naam: "Dakterras",
    verdieping: "buiten",
    nu: "Ca. 18 m², stond niet in het oude plan. Het enige buitenverblijf dat zon krijgt — de achtertuin ligt op het noorden.",
    wordt: "Fors terras met groen uitzicht: waterdicht, met vlonder, hekwerk, buitenverlichting en stopcontact.",
    acties: [
      "Dakbedekking controleren op leeftijd, naden en afschot",
      "Afvoer en noodoverloop controleren",
      "Hekwerk of balustrade op veiligheid en hoogte beoordelen",
      "Vlonder of tegels: staat en of hij eraf moet voor inspectie van de dakbedekking",
      "Buitenstopcontact en verlichting aanleggen",
      "Windbeschutting en privacy richting buren bekijken",
      "Draagkracht checken voordat je zware plantenbakken plaatst"
    ]
  },
  {
    slug: "achtertuin",
    naam: "Achtertuin",
    verdieping: "buiten",
    nu: "18 m², smal en diep (8,40 × 2,10 m), op het noorden.",
    wordt: "Geen zonneterras, maar een groene doorgang en bergingszone met schaduwminnende beplanting.",
    acties: [
      "Bestrating beoordelen en besluiten over vervangen",
      "Beplanting kiezen die schaduw verdraagt: varens, hosta, hortensia, klimop langs de schutting",
      "Schutting en achterompoort nalopen op staat en sluitwerk",
      "Buitenkraan en buitenverlichting",
      "Route naar de bergingen vrijhouden, fietsen kunnen erdoor",
      "Regenwaterafvoer en bestrating op afschot controleren"
    ]
  },
  {
    slug: "voortuin",
    naam: "Voortuin",
    verdieping: "buiten",
    nu: "Onbekende staat, betaald parkeren in de straat.",
    wordt: "Onderhoudsarm ingericht, met een duidelijke fietsenplek.",
    acties: [
      "Onderhoudsarm inrichten",
      "Fietsenplek bepalen, gezien betaald parkeren in de straat",
      "Erfafscheiding en beplanting"
    ]
  },
  {
    slug: "bergingen",
    naam: "Twee bergingen",
    verdieping: "buiten",
    nu: "Aangebouwde stenen bergingen met elektra, staat nog te beoordelen.",
    wordt: "Eén berging voor fietsen, één voor gereedschap en opslag, met werkende verlichting.",
    acties: [
      "Staat beoordelen: dak, deur, vocht",
      "Elektra nalopen, er ligt al stroom",
      "Indeling bepalen: één voor fietsen, één voor gereedschap en opslag",
      "Verlichting toevoegen"
    ]
  },
  {
    slug: "gevel-en-dak",
    naam: "Gevel en dak",
    verdieping: "buiten",
    nu: "Zadeldak met pannen, gevel van bijna honderd jaar oud — voegwerk en loodwerk nog te beoordelen.",
    wordt: "Hersteld voegwerk, dicht dakwerk en fris buitenschilderwerk; kleine details zoals huisnummer en buitenlamp vervangen.",
    acties: [
      "Voegwerk voor- en achtergevel beoordelen en lokaal herstellen",
      "Scheuren en aansluitingen bij kozijnen nalopen",
      "Buitenschilderwerk kozijnen, deuren, boeidelen",
      "Dakpannen, dakbeschot en nokvorsten controleren",
      "Goten en hemelwaterafvoer schoonmaken en controleren",
      "Loodwerk bij schoorsteen en dakterrasaansluiting",
      "Schoorsteen beoordelen: gebruik, voegwerk, kap",
      "Huisnummer, bel, brievenbus en buitenlamp vervangen — klein, zichtbaar effect"
    ]
  }
];

const FLOOR_LABELS = {
  "begane-grond": "Begane grond",
  "verdieping": "Verdieping",
  "buiten": "Buiten"
};

const CORRECTIES = [
  {
    titel: "1. Spouwisolatie voor € 4.000 kan waarschijnlijk niet.",
    tekst: "Bij een woning uit 1929 is de kans groot dat er geen spouw is. Zonder spouw zijn de alternatieven voorzetwanden aan de binnenkant (je levert vloeroppervlak in, alle elektra en kozijnaansluitingen moeten mee) of buitengevelisolatie (raakt het aanzicht en kan bij een tussenwoning in een straatbeeld lastig liggen). Beide kosten een veelvoud van € 4.000. Dit is de grootste post die anders moet."
  },
  {
    titel: "2. HR++ glas staat dubbel in de begroting.",
    tekst: "Het huis heeft het grotendeels al. De post van € 4.000 voor glas, kierdichting en ventilatie moet bijna volledig naar ventilatie en kierdichting verschuiven."
  },
  {
    titel: "3. De verdeling tussen regulier en verduurzaming klopt niet.",
    tekst: "Het totaal van € 30.000 is haalbaar, maar de tweedeling € 14.000 en € 16.000 niet. Verduurzaming heeft hier minder nodig dan gedacht, omdat het HR++ glas er al ligt en de vliering alleen opslag wordt. Het reguliere deel heeft juist méér nodig, voor elektra, gevelherstel en dak."
  },
  {
    titel: "4. Er ontbreken onderdelen.",
    tekst: "Het dak (pannen, dakbeschot, goten, loodwerk, schoorsteen), het dakterras van 18 m², de voor- en achtertuin, de bijkeuken, de twee bergingen, de riolering en de groepenkast staan nergens. Bij een huis van bijna honderd jaar oud zijn dat geen details."
  }
];

const ONDERZOEK = [
  { werk: "Bouwkundige keuring als die er nog niet is", waarom: "1929, geeft de restlijst voor dak, gevel, hout, vocht", wie: "Keuringsbedrijf" },
  { werk: "Funderingsonderzoek of dossiercheck gemeente", waarom: "Alphen ligt op slappe bodem; paalrot bij vooroorlogse bouw is een reëel risico", wie: "Gemeente / funderingsloket" },
  { werk: "Kruipruimte inspecteren: hoogte, water, bodem, leidingen", waarom: "Bepaalt of en hoe vloerisolatie kan", wie: "Isolatiepartij" },
  { werk: "Spouw of massief? Endoscopisch laten vaststellen", waarom: "Bepaalt de hele gevelisolatiekeuze", wie: "Isolatiepartij" },
  { werk: "Asbestinventarisatie", waarom: "1929 + latere verbouwingen; verplicht vóór sloop van verdachte delen", wie: "Gecertificeerd bureau" },
  { werk: "Groepenkast en bedrading beoordelen", waarom: "Aantal groepen, aardlekschakelaars, eventueel nog oude bedrading", wie: "Elektricien" },
  { werk: "Riolering en waterleiding beoordelen", waarom: "Gietijzer/lood komt bij dit bouwjaar voor", wie: "Loodgieter" },
  { werk: "Dak inspecteren: pannen, beschot, goten, loodwerk, schoorsteen", waarom: "Bepaalt of dakisolatie binnendoor kan of het dak eerst moet", wie: "Dakdekker" }
];

const ISDE = {
  punten: [
    { punt: "Twee maatregelen binnen 24 maanden", betekenis: "Verdubbelt het bedrag per m². Vloer plus dak is de logische combinatie" },
    { punt: "Vloer- en bodemisolatie in dezelfde kruipruimte", betekenis: "Tellen samen als één maatregel, niet als twee" },
    { punt: "Dakisolatie 2026", betekenis: "€ 16,25 per m², minimaal 20 m², Rd minimaal 3,5" },
    { punt: "Ventilatie", betekenis: "Sinds 2026 subsidiabel met € 400, maar alleen gekoppeld aan een isolatiemaatregel" },
    { punt: "Zelf doen", betekenis: "Mag niet. Isolatie moet door een professioneel bedrijf worden uitgevoerd" },
    { punt: "Aanvraagmoment", betekenis: "Achteraf, binnen 24 maanden na uitvoering, en pas nadat je op het adres staat ingeschreven" },
    { punt: "Btw", betekenis: "9 procent op de arbeid bij isolatiewerk, niet op het materiaal" },
    { punt: "Biobased materiaal", betekenis: "Bonusbedrag bovenop, maar die bonus wordt niet verdubbeld" }
  ],
  letOp: [
    "Volgorde van aanvragen. Vraag pas aan nadat je op Leliestraat 27 staat ingeschreven.",
    "Wat de vorige bewoner al heeft aangevraagd. Uitzoeken vóór je zelf indient.",
    "Gemeente Alphen aan den Rijn. Aparte regeling of duurzaamheidslening uitzoeken; die mag je met de ISDE combineren.",
    "Facturen. Laat m², Rd-waarde en de exacte maatregelnaam op de factuur zetten en maak foto's tijdens de uitvoering. Zonder dat loopt de aanvraag vast.",
    "Ventilatie is geen optie maar een voorwaarde. Isoleren en kierdichten zonder de ventilatie op orde te brengen geeft vocht en schimmel."
  ]
};

const BUDGET = {
  verduurzaming: {
    rows: [
      { post: "Bodem- of vloerisolatie kruipruimte (ca. 37 m²)", bedrag: 2200, uitvoering: "Uitbesteed, verplicht voor ISDE" },
      { post: "Vlieringvloerisolatie (ca. 30 m²)", bedrag: 1200, uitvoering: "Uitbesteed" },
      { post: "Ventilatie op orde brengen", bedrag: 1500, uitvoering: "Uitbesteed" },
      { post: "Kierdichting", bedrag: 600, uitvoering: "Uitbesteed" },
      { post: "Restant enkel glas vervangen", bedrag: 700, uitvoering: "Uitbesteed" },
      { post: "Nieuw energielabel laten opnemen", bedrag: 350, uitvoering: "Adviseur" },
      { post: "Gevelisolatie: reservering tot na het onderzoek", bedrag: 3500, uitvoering: "Pas besluiten na spouwcheck" }
    ],
    subtotaal: 10050
  },
  regulier: {
    rows: [
      { post: "Vloer ca. 55 m² incl. egaliseren, ondervloer en leggen", bedrag: 4000, uitvoering: "Uitbesteed" },
      { post: "Plinten ca. 60 m¹, materiaal", bedrag: 500, uitvoering: "Zelf" },
      { post: "Elektra aanpassen en uitbreiden", bedrag: 3200, uitvoering: "Uitbesteed" },
      { post: "Groepenkast, reservering", bedrag: 1200, uitvoering: "Uitbesteed" },
      { post: "Gevelherstel en voegwerk voor- en achtergevel", bedrag: 2500, uitvoering: "Uitbesteed" },
      { post: "Dakherstel, goten en loodwerk, reservering", bedrag: 1500, uitvoering: "Uitbesteed" },
      { post: "Verf en schildermateriaal binnen", bedrag: 1000, uitvoering: "Zelf" },
      { post: "Verf en schildermateriaal buiten", bedrag: 500, uitvoering: "Zelf" },
      { post: "Trapafwerking, materiaal", bedrag: 700, uitvoering: "Zelf" },
      { post: "Vlieringtrap", bedrag: 600, uitvoering: "Zelf of timmerman" },
      { post: "Deuren, lijsten, klinken, klein timmerwerk", bedrag: 700, uitvoering: "Zelf" },
      { post: "Container, beschermmateriaal, gereedschap", bedrag: 600, uitvoering: "Zelf" }
    ],
    subtotaal: 17000
  },
  onvoorzien: 2950,
  totaal: 30000,
  nietInBegroting: "Dakterras en tuin zitten er bewust niet in. Samen is dat al snel € 3.000 tot 6.000. Twee opties: uitstellen naar een tweede fase in het voorjaar, of financieren uit de ISDE-subsidie die je achteraf terugkrijgt. Die subsidie ontvang je maanden na de uitvoering, dus reken er niet mee tijdens de verbouwing zelf.",
  onzekerheden: [
    { titel: "De € 3.500 voor gevelisolatie.", tekst: "Is er een spouw, dan is dit ruim voldoende en houd je geld over. Is de gevel massief, dan is het veel te weinig voor voorzetwanden en kun je het beter schrappen en naar het dak of de buffer verschuiven. Besluit dit pas na het onderzoek." },
    { titel: "De € 1.200 voor de groepenkast plus € 1.500 voor het dak.", tekst: "Allebei reserveringen. Valt de inspectie mee, dan komt hier € 2.000 tot 2.500 vrij — precies genoeg voor het dakterras." }
  ]
};

const UITVOERING = {
  hardeVolgorde: [
    "Vloerisolatie vóór de nieuwe vloer. Anders moet de vloer er weer uit.",
    "Elektra vóór schilderwerk. Elke sleuf en doos moet dicht en geschilderd kunnen worden.",
    "Schilderwerk vóór de vloer. Verf op een nieuwe vloer is duurder dan verf op een oude.",
    "Dakinspectie vóór dakisolatie. Isoleren onder een lekkend dak is weggegooid geld."
  ],
  fases: [
    "Onderzoek en inspectie",
    "Sloop en casco-herstel",
    "Elektra en leidingwerk",
    "Isolatie vloer en dak",
    "Herstel en schilderwerk",
    "Vloer, plinten en trap",
    "Interieur en oplevering"
  ],
  planning: [
    { periode: "Vóór sleutel", werk: "Offertes, inspecties inplannen, kleuren en vloer kiezen, container regelen", afhankelijk: "Toegang tot de woning" },
    { periode: "Week 1", werk: "Leegmaken, inspecties uitvoeren, asbestcheck, kleine sloop", afhankelijk: "—" },
    { periode: "Week 1–2", werk: "Casco-herstel, vlieringtrap, dakherstel, gevelherstel", afhankelijk: "Uitkomst inspectie" },
    { periode: "Week 2", werk: "Elektra, groepenkast, leidingwerk, voorbereiding airco", afhankelijk: "Casco open" },
    { periode: "Week 2–3", werk: "Isolatie vloer en dak", afhankelijk: "Kruipruimte droog, dak dicht" },
    { periode: "Week 3–4", werk: "Wand- en plafondherstel, schilderwerk binnen", afhankelijk: "Elektra dicht" },
    { periode: "Week 4", werk: "Schilderwerk buiten, mits droog weer", afhankelijk: "Weer" },
    { periode: "Week 4–5", werk: "Vloer leggen, plinten, trap", afhankelijk: "Schilderwerk droog" },
    { periode: "Week 5–6", werk: "TV-wand, verlichting, gordijnen, meubels, restpunten", afhankelijk: "Vloer beschermd" },
    { periode: "Later", werk: "Dakterras en tuin", afhankelijk: "Rest van de bouwrommel weg" }
  ],
  toelichting: "Vijf tot zes weken is realistischer dan de vier uit het oude plan, en dan nog alleen als de inspecties niets groots opleveren. Tuin en dakterras schuiven bewust naar achteren: daar loopt al het bouwverkeer overheen."
};

const BESLUITEN = [
  { besluit: "Vliering: alleen opslag of ooit bewoonbaar", toelichting: "Besloten: alleen opslag, dus vlieringvloerisolatie", status: "Gedaan" },
  { besluit: "Gevelisolatie doen of niet, na het spouwonderzoek", toelichting: "Bepaalt of binnenwerk opnieuw op de schop moet", status: "Vóór schilderwerk" },
  { besluit: "Schilderwerk zelf doen of uitbesteden", toelichting: "Besloten: zelf doen, binnen en buiten", status: "Gedaan" },
  { besluit: "Airco nu voorbereiden of niet", toelichting: "Leidingen en doorvoeren moeten vóór de afwerking", status: "Vóór elektra" },
  { besluit: "Keukenvloer: behouden, vervangen of laten aansluiten", toelichting: "Bepaalt de vloerbestelling", status: "Vóór vloerbestelling" },
  { besluit: "Vloer: materiaal, kleur, legpatroon", toelichting: "Visgraat vraagt 15 tot 20 procent meer materiaal en meer legkosten", status: "Vóór bestelling" },
  { besluit: "Functie tweede slaapkamer", toelichting: "Bepaalt stopcontacten en netwerk", status: "Vóór elektra" },
  { besluit: "Wijnkoelkast: wel of niet, en waar", toelichting: "Groep en ventilatieruimte", status: "Vóór elektra" },
  { besluit: "Schuifdeur keuken verwijderen", toelichting: "Herstelwerk en omlijsting", status: "Vóór sloop" },
  { besluit: "Deur naar de gang: houden, vervangen, met glas", toelichting: "Bestellevertijd", status: "Vóór schilderwerk" },
  { besluit: "Trapafwerking: schilderen, bekleden of beide", toelichting: "Volgorde en budget", status: "Vóór fase 5" },
  { besluit: "Definitieve verfkleuren per ruimte", toelichting: "Inkoop", status: "Vóór fase 4" },
  { besluit: "Smart home: alleen verlichting of breder", toelichting: "Bekabeling en schakelmateriaal", status: "Vóór elektra" },
  { besluit: "Ontwerp en maatvoering zwevend TV-meubel", toelichting: "Levertijd bij maatwerk, vaak 6 tot 10 weken", status: "Zo vroeg mogelijk" },
  { besluit: "Gordijnen en raamdecoratie", toelichting: "Levertijd", status: "Fase 6" },
  { besluit: "Dakterras en tuin: nu of volgend seizoen", toelichting: "Budget en planning", status: "Kan later" }
];

const UIT_TE_ZOEKEN = [
  "Heeft de woning een spouw? Endoscopisch laten vaststellen",
  "Staat en toegankelijkheid van de kruipruimte, en of er water staat",
  "Funderingstype en of er een funderingsonderzoek of gemeentedossier is",
  "Is er asbest aanwezig, en waar",
  "Staat van de groepenkast: aantal groepen en aardlekschakelaars",
  "Materiaal van riolering en waterleiding",
  "Welke ventilatie er nu is per ruimte",
  "Heeft de vorige bewoner al ISDE of gemeentesubsidie aangevraagd",
  "Welke aanvullende regeling gemeente Alphen aan den Rijn heeft",
  "Leeftijd en staat van de dakbedekking van het dakterras",
  "Exacte m² per ruimte opmeten voor de vloerbestelling",
  "Is er een bouwkundig rapport van de aankoop, en wat staat erin",
  "Parkeervergunning aanvragen: voorwaarden en wachttijd",
  "Is het toilet beneden ook in 2023 vernieuwd of nog het oude"
];

const ACTIES = [
  { actie: "Bouwkundige keuring plannen als die er niet is", wie: "Keuringsbedrijf", wanneer: "Direct", status: "Open" },
  { actie: "Kruipruimte- en spouwonderzoek", wie: "Isolatiepartij", wanneer: "Vóór alle andere offertes", status: "Open" },
  { actie: "Offerte vloer definitief maken", wie: "Barry", wanneer: "Na opmeten", status: "Open" },
  { actie: "Elektra inventarisatie en offerte", wie: "Thomas van Ooijen of Ben Nikkels", wanneer: "Vóór schilderwerk", status: "Open" },
  { actie: "Algemeen klus- en timmerwerk bespreken", wie: "Marcel Haagsman of John", wanneer: "Vóór start", status: "Open" },
  { actie: "Isolatie-offertes vloer en dak", wie: "Isolatiepartij", wanneer: "Vóór vloerplanning", status: "Open" },
  { actie: "Dakinspectie", wie: "Dakdekker", wanneer: "Vóór dakisolatie", status: "Open" },
  { actie: "Offerte gevelherstel en buitenschilderwerk", wie: "Schilder of gevelpartij", wanneer: "Vóór buitenwerk", status: "Open" },
  { actie: "Subsidiehistorie adres controleren", wie: "Zelf, via gemeente of RVO", wanneer: "Vóór eigen aanvraag", status: "Open" },
  { actie: "Verfkleuren definitief kiezen", wie: "Zelf", wanneer: "Vóór inkoop", status: "Open" },
  { actie: "Lampenlijst per ruimte maken", wie: "Zelf", wanneer: "Vóór elektricien", status: "Open" },
  { actie: "Meubels inventariseren: houden, verkopen, weg", wie: "Zelf", wanneer: "Vóór verhuizing", status: "Open" },
  { actie: "Container, beschermmateriaal en gereedschap plannen", wie: "Zelf", wanneer: "1–2 weken vóór start", status: "Open" },
  { actie: "Opstalverzekering, nutsbedrijven en inschrijving regelen", wie: "Zelf", wanneer: "Rond sleuteloverdracht", status: "Open" }
];

const RISICOS = [
  { risico: "Fundering", waarom: "Alphen ligt op slappe bodem; vooroorlogse woningen staan vaak op houten palen", impact: "Tienduizenden euro's, en al het afwerkwerk is weggegooid", check: "Gemeentedossier, scheurbeeld, eventueel funderingsonderzoek" },
  { risico: "Geen spouw", waarom: "Bouwjaar 1929", impact: "Gevelisolatiebudget klopt niet, plan moet om", check: "Endoscopisch onderzoek" },
  { risico: "Natte of lage kruipruimte", waarom: "Hoge grondwaterstand in de regio", impact: "Vloerisolatie kan niet, of alleen met bodemfolie erbij", check: "Inspectie met foto's" },
  { risico: "Asbest", waarom: "1929 plus latere verbouwingen; vaak in vlieringvloer, rookkanaal of achterbouw", impact: "Werk stilgelegd, gecertificeerde sanering nodig", check: "Inventarisatie vóór sloop" },
  { risico: "Verouderde groepenkast of bedrading", waarom: "Bouwjaar en het aantal apparaten dat je erop wilt zetten", impact: "Elektra-budget verdubbelt", check: "Beoordeling door elektricien" },
  { risico: "Dak en loodwerk", waarom: "Pannendak van bijna honderd jaar, plus de aansluiting op het dakterras", impact: "Isoleren onder een lekkend dak is weggegooid geld", check: "Dakinspectie" }
];

const OPLEVERING = {
  technisch: [
    "Alle stopcontacten en schakelaars recht, stevig en werkend; groepenkast gelabeld",
    "TV-kabels en voedingen volledig uit zicht, geen losse verlengsnoeren",
    "Wanden en plafonds egaal; lokale reparaties niet zichtbaar bij daglicht",
    "Vloer vlak, naden en overgangen netjes, dilatatie waar vereist, plinten strak",
    "Deuren sluiten vrij; klinken, lijsten en kitnaden netjes",
    "Trap en vlieringtrap veilig en afgewerkt",
    "Ventilatie getest na kierdichting en isolatie",
    "Gevel- en buitenschilderwerk dicht; geen onbehandeld hout of open scheuren",
    "Goten en hemelwaterafvoer doorgespoten en werkend",
    "Dakterras waterdicht, afvoer vrij",
    "Restpuntenlijst gemaakt vóór de laatste betaling"
  ],
  dossier: [
    "Facturen met m², Rd- of U-waarde en de exacte maatregelnaam per isolatiemaatregel",
    "Foto's vóór, tijdens en na het dichtzetten",
    "Betaalbewijzen",
    "ISDE-aanvraag ingediend na inschrijving op het adres en binnen 24 maanden",
    "Gemeentelijke regeling aangevraagd waar van toepassing",
    "Nieuw energielabel laten opnemen en vastleggen",
    "Garantiebewijzen en onderhoudsvoorschriften verzameld",
    "Alles digitaal in één map, ook voor een latere verkoop"
  ]
};

const RISICO_VUISTREGEL = "De vuistregel: niets afwerken voordat deze zes zijn afgevinkt. Verf en vloer zijn het goedkoopst om nu uit te stellen en het duurst om later opnieuw te doen.";
