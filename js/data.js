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

const BUITEN_SCOPE = [
  { naam: "Badkamer (2023)", omschrijving: "Inloopdouche, wastafelmeubel, vloerverwarming. Niet aanraken." },
  { naam: "Toilet boven", omschrijving: "Luxe afgewerkt, vloerverwarming. Niet aanraken." },
  { naam: "Keuken", omschrijving: "Vernieuwd, wit blad, houtlook fronten, inductie, afzuigkap, oven, vaatwasser. Blijft staan." },
  { naam: "CV-ketel (2020)", omschrijving: "Nog ruim 10 jaar te gaan, eigendom." },
  { naam: "HR++ glas", omschrijving: "Grotendeels aanwezig. Alleen restposten inventariseren, geen budgetpost van betekenis." },
  { naam: "WC beneden", omschrijving: "Blijft zoals het is. Valt buiten de scope van deze verbouwing." },
  { naam: "Bergingen", omschrijving: "Blijven zoals ze zijn. Vallen buiten de scope van deze verbouwing." }
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
    nu: "Functioneel, staat verder niet beoordeeld.",
    wordt: "Blijft zoals het is — buiten scope van deze verbouwing.",
    klaar: true,
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
    wordt: "Nog te bepalen: alleen opslag of ooit meer — dat bepaalt vliering- of dakisolatie. Veilige vlieringtrap, verlichting en een stopcontact.",
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
    nu: "Aangebouwde stenen bergingen met elektra.",
    wordt: "Blijven zoals ze zijn — buiten scope van deze verbouwing.",
    klaar: true,
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
      { post: "Vliering- of dakisolatie (ca. 30 m²)", bedrag: 1200, uitvoering: "Uitbesteed — pas definitief na keuze opslag/bewoonbaar" },
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
  toelichting: "Reken op vijf tot zes weken klusdagen, en dan nog alleen als de inspecties niets groots opleveren. Tuin en dakterras schuiven bewust naar achteren: daar loopt al het bouwverkeer overheen."
};

/* Klusdagen: de praktische dagplanning. "vereist" is een vrije tekst, "vereistDagen"
   verwijst naar id's van klusdagen die eerst afgerond moeten zijn. Datum per klusdag
   wordt zelf ingevuld en lokaal onthouden (zie app.js). Status wordt automatisch
   afgeleid uit de aangevinkte taken: 0% = Gepland, gedeeltelijk/datum bereikt = Bezig,
   100% = Gereed. */
const KLUSDAGEN = [
  {
    id: 1, naam: "Woning voorbereiden / sloop", fase: "Sloop en casco-herstel",
    uitvoerder: "Zelf", extern: false, ruimtes: ["Hele woning"],
    vereist: "Sleutel/toegang tot de woning", vereistDagen: [],
    materiaal: [
      { naam: "Afvalzakken en vuilniszakken", aantal: "" },
      { naam: "Beschermfolie of karton voor vloeren die blijven", aantal: "" },
      { naam: "Stofzeilen voor deuropeningen", aantal: "" }
    ],
    droogtijd: null,
    taken: [
      "Woning leegmaken",
      "Vloeren en onderdelen die blijven beschermen",
      "Afvalplek/container voorbereiden",
      "Schuifdeur keuken verwijderen indien besloten",
      "Losse onderdelen/verouderd schakelmateriaal verwijderen waar nodig",
      "Exacte situatie wanden, plafonds, plinten en deuren beoordelen",
      "Werkzaamheden voor elektricien markeren",
      "Foto's maken vóór start werkzaamheden"
    ],
    opmerkingen: "Maak overal foto's vóór je begint — handig bij discussies met vakmensen en voor het subsidiedossier."
  },
  {
    id: 2, naam: "Elektra voorbereiden", fase: "Elektra en leidingwerk",
    uitvoerder: "Zelf", extern: false, ruimtes: ["Hele woning"],
    vereist: "Klusdag 1 afgerond", vereistDagen: [1],
    materiaal: [{ naam: "Potloden/markeertape voor posities", aantal: "" }],
    droogtijd: null,
    taken: [
      "Locaties stopcontacten en schakelaars bepalen",
      "TV-wand elektra en kabeldoorvoer voorbereiden",
      "Verlichting en eventuele extra plafondpunten voorbereiden",
      "Smart-home wensen meenemen",
      "Eventuele voorbereiding wijnkoelkast",
      "Eventuele voorbereiding airco",
      "Netwerk/UTP waar nodig",
      "Sleuven en gaten maken"
    ],
    opmerkingen: "Leg posities eerst met tape vast en loop er met de elektricien doorheen vóór er iets definitief is."
  },
  {
    id: 3, naam: "Elektricien", fase: "Elektra en leidingwerk",
    uitvoerder: "Elektricien", extern: true, ruimtes: ["Hele woning"],
    vereist: "Klusdag 2 afgerond, elektra-inventarisatie en offerte rond, elektraplan definitief", vereistDagen: [2],
    materiaal: [], droogtijd: null,
    taken: [
      "Groepenkast beoordelen en zo nodig uitbreiden of vervangen",
      "Bedrading vervangen waar verouderd",
      "Stopcontacten en schakelaars aansluiten",
      "Buitenstopcontact en -verlichting dakterras aansluiten",
      "Bekabeling airco en wijnkoelkast aansluiten",
      "Netwerk/UTP aansluiten"
    ],
    opmerkingen: "Externe partij — ruim vooraf inplannen bij de elektricien."
  },
  {
    id: 4, naam: "Timmer- en herstelwerk", fase: "Sloop en casco-herstel",
    uitvoerder: "Zelf of timmerman", extern: false, ruimtes: ["Entree en gang", "Woonkamer", "Keuken", "Overloop"],
    vereist: "Klusdag 3 afgerond (elektra dicht in de wanden)", vereistDagen: [3],
    materiaal: [
      { naam: "Multiplex/reparatiehout", aantal: "" },
      { naam: "Houtlijm en schroeven", aantal: "" }
    ],
    droogtijd: null,
    taken: [
      "Lokaal herstel wanden en plafonds",
      "Schuifdeur-opening keuken herstellen en omlijsting afwerken",
      "Deurkozijnen rechtzetten waar nodig",
      "Trapkast onder de trap opnieuw indelen of dichtzetten"
    ],
    opmerkingen: ""
  },
  {
    id: 5, naam: "Vlieringtrap maken of herstellen", fase: "Sloop en casco-herstel",
    uitvoerder: "Zelf of timmerman", extern: false, ruimtes: ["Bergvliering"],
    vereist: "Besluit vliering (opslag/bewoonbaar) genomen, asbestcheck gedaan", vereistDagen: [],
    materiaal: [{ naam: "Vlieringtrap (kant-en-klaar of materiaal)", aantal: "" }],
    droogtijd: null,
    taken: [
      "Asbestcheck vóór er iets wordt gesloopt of geïsoleerd",
      "Vlieringtrap maken of vervangen, veilig en stevig",
      "Vloer beoordelen op draagkracht",
      "Dakbeschot en pannen van binnenuit bekijken op vocht en lichtinval"
    ],
    opmerkingen: ""
  },
  {
    id: 6, naam: "Isolatiewerk", fase: "Isolatie vloer en dak",
    uitvoerder: "Isolatiepartij", extern: true, ruimtes: ["Kruipruimte", "Bergvliering"],
    vereist: "Kruipruimte- en spouwonderzoek afgerond, isolatie-offertes rond, klusdag 1 afgerond", vereistDagen: [1],
    materiaal: [],
    droogtijd: "Kit/schuim bij kierdichting: laat volgens fabrieksvoorschrift uitharden vóór je verder afwerkt.",
    taken: [
      "Bodem- of vloerisolatie kruipruimte aanbrengen",
      "Vliering- of dakisolatie aanbrengen (afhankelijk van besluit opslag/bewoonbaar)",
      "Ventilatie op orde brengen",
      "Kierdichting uitvoeren",
      "Foto's maken tijdens uitvoering voor het ISDE-dossier"
    ],
    opmerkingen: "Externe partij — noteer m², Rd-waarde en maatregelnaam op de factuur voor de subsidie."
  },
  {
    id: 7, naam: "Wand- en plafondherstel", fase: "Herstel en schilderwerk",
    uitvoerder: "Zelf", extern: false, ruimtes: ["Hele woning (binnen)"],
    vereist: "Klusdag 3 en 6 afgerond (elektra en isolatie dicht)", vereistDagen: [3, 6],
    materiaal: [
      { naam: "Stucwerk/reparatiemortel", aantal: "" },
      { naam: "Wapeningstape voor naden", aantal: "" }
    ],
    droogtijd: "Stucwerk: minimaal 24 uur droogtijd voor je gaat schuren.",
    taken: [
      "Gaten en sleuven dichtzetten",
      "Stucwerk nalopen op scheuren (vooral ouderslaapkamer)",
      "Naden en aansluitingen herstellen",
      "Beschadigingen aan de trap herstellen vóór afwerking"
    ],
    opmerkingen: ""
  },
  {
    id: 8, naam: "Schuren, vullen en kitten", fase: "Herstel en schilderwerk",
    uitvoerder: "Zelf", extern: false, ruimtes: ["Hele woning (binnen)"],
    vereist: "Klusdag 7 afgerond en volledig droog", vereistDagen: [7],
    materiaal: [
      { naam: "Schuurpapier (diverse korrels)", aantal: "" },
      { naam: "Vulmiddel/plamuur", aantal: "" },
      { naam: "Kit (acryl, overschilderbaar)", aantal: "" }
    ],
    droogtijd: "Laat plamuur en kit minimaal 24 uur drogen voordat je verder schuurt of schildert.",
    taken: [
      "Wanden en plafonds schuren",
      "Naden en gaatjes vullen",
      "Kitnaden aanbrengen waar nodig",
      "Stofvrij maken vóór schilderwerk"
    ],
    opmerkingen: ""
  },
  {
    id: 9, naam: "Schilderwerk plafonds", fase: "Herstel en schilderwerk",
    uitvoerder: "Zelf", extern: false, ruimtes: ["Hele woning (binnen)"],
    vereist: "Klusdag 8 afgerond, stofvrij", vereistDagen: [8],
    materiaal: [
      { naam: "Plafondverf (mat wit)", aantal: "" },
      { naam: "Rollers en verlengstok", aantal: "" }
    ],
    droogtijd: "Minimaal 4 tot 24 uur tussen de lagen, afhankelijk van de verf — check het blik.",
    taken: [
      "Afplakken en afschermen",
      "Eerste laag plafonds schilderen",
      "Tweede laag plafonds schilderen"
    ],
    opmerkingen: ""
  },
  {
    id: 10, naam: "Schilderwerk wanden", fase: "Herstel en schilderwerk",
    uitvoerder: "Zelf", extern: false, ruimtes: ["Hele woning (binnen + buiten)"],
    vereist: "Klusdag 9 afgerond (plafonds droog)", vereistDagen: [9],
    materiaal: [
      { naam: "Warme basiskleur verf", aantal: "" },
      { naam: "Groene accentkleur (woonkamer TV-wand)", aantal: "" },
      { naam: "Kwasten voor randen en hoeken", aantal: "" }
    ],
    droogtijd: "Minimaal 4 tot 24 uur tussen de lagen, afhankelijk van de verf.",
    taken: [
      "Warme basistint aanbrengen in alle ruimtes",
      "Groene accentwand woonkamer (alleen de TV-wand)",
      "Accentwand ouderslaapkamer",
      "Meterkastdeur meeschilderen in wandkleur",
      "Buitenschilderwerk kozijnen, deuren en boeidelen (mits droog weer)"
    ],
    opmerkingen: "Buitenschilderwerk kan een aparte dag worden bij nat weer — houd rekening met een weerafhankelijke schuif."
  },
  {
    id: 11, naam: "Deuren, kozijnen en plinten afwerken", fase: "Herstel en schilderwerk",
    uitvoerder: "Zelf", extern: false, ruimtes: ["Hele woning"],
    vereist: "Klusdag 10 afgerond", vereistDagen: [10],
    materiaal: [
      { naam: "Lakverf voor houtwerk", aantal: "" },
      { naam: "Nieuwe deurklinken", aantal: "" },
      { naam: "Deurlijsten/omlijsting", aantal: "" }
    ],
    droogtijd: "Lak: 12 tot 24 uur droogtijd per laag.",
    taken: [
      "Deuren en kozijnen schilderen",
      "Nieuwe deurklinken monteren (o.a. ouderslaapkamer)",
      "Deurlijsten plaatsen of vervangen",
      "Deur naar de gang plaatsen (indien vervangen)"
    ],
    opmerkingen: ""
  },
  {
    id: 12, naam: "Vloer leggen", fase: "Vloer, plinten en trap",
    uitvoerder: "Vloerlegger (Barry)", extern: true,
    ruimtes: ["Entree en gang", "Woonkamer", "Ouderslaapkamer", "Tweede slaapkamer", "Overloop"],
    vereist: "Schilderwerk volledig droog, vloerisolatie klaar, materiaal/kleur/legpatroon definitief, exacte m² opgemeten, offerte Barry rond",
    vereistDagen: [11],
    materiaal: [
      { naam: "Vloermateriaal (definitieve keuze)", aantal: "" },
      { naam: "Ondervloer", aantal: "" }
    ],
    droogtijd: "Afhankelijk van het systeem (lijm/klik) — vraag de vloerlegger naar de exacte loop-/belastingtijd.",
    taken: [
      "Vloer leggen in alle afgesproken ruimtes",
      "Aansluiting op keukenvloer en hal controleren",
      "Drempels en overgangen afwerken"
    ],
    opmerkingen: "Externe partij — bescherm de nieuwe vloer meteen na het leggen."
  },
  {
    id: 13, naam: "Vloerplinten monteren", fase: "Vloer, plinten en trap",
    uitvoerder: "Zelf", extern: false,
    ruimtes: ["Entree en gang", "Woonkamer", "Ouderslaapkamer", "Tweede slaapkamer", "Overloop"],
    vereist: "Klusdag 12 afgerond, vloer volledig belastbaar", vereistDagen: [12],
    materiaal: [
      { naam: "Plinten (ca. 60 m¹)", aantal: "" },
      { naam: "Plintlijm of -clips", aantal: "" }
    ],
    droogtijd: null,
    taken: [
      "Plinten op maat zagen",
      "Plinten monteren in alle ruimtes met nieuwe vloer",
      "Hoeken en overgangen afwerken"
    ],
    opmerkingen: ""
  },
  {
    id: 14, naam: "Trap afwerken", fase: "Vloer, plinten en trap",
    uitvoerder: "Zelf of timmerman", extern: false, ruimtes: ["Trap"],
    vereist: "Besluit trapafwerking genomen, schilderwerk grotendeels klaar", vereistDagen: [10],
    materiaal: [
      { naam: "Overzettreden of trapbekleding", aantal: "" },
      { naam: "Traploper (indien gekozen)", aantal: "" }
    ],
    droogtijd: null,
    taken: [
      "Treden en stootborden afwerken (schilderen en/of bekleden)",
      "Leuning schilderen of vervangen",
      "Traploper leggen (indien gekozen)",
      "Verlichting op de trap aansluiten"
    ],
    opmerkingen: ""
  },
  {
    id: 15, naam: "TV-wand / BESTÅ-meubel plaatsen", fase: "Interieur en oplevering",
    uitvoerder: "Zelf", extern: false, ruimtes: ["Woonkamer"],
    vereist: "Vloer en plinten klaar, meubel besteld en geleverd", vereistDagen: [13],
    materiaal: [
      { naam: "BESTÅ/tv-meubel onderdelen", aantal: "" },
      { naam: "Bevestigingsmateriaal (zwevend ophangsysteem)", aantal: "" }
    ],
    droogtijd: null,
    taken: [
      "Zwevend TV-meubel monteren",
      "Kabels wegwerken achter het meubel",
      "Houtaccent of lattenwand plaatsen"
    ],
    opmerkingen: ""
  },
  {
    id: 16, naam: "Verlichting monteren", fase: "Interieur en oplevering",
    uitvoerder: "Zelf", extern: false, ruimtes: ["Hele woning"],
    vereist: "Elektra klaar, definitieve lampenlijst, armaturen in huis", vereistDagen: [3],
    materiaal: [
      { naam: "Armaturen per ruimte (volgens lampenlijst)", aantal: "" },
      { naam: "Lichtbronnen (warm wit, dimbaar)", aantal: "" }
    ],
    droogtijd: null,
    taken: [
      "Armaturen ophangen per ruimte",
      "Spots en sfeerpunten woonkamer monteren",
      "Schakelmateriaal testen",
      "Smart-home instellingen configureren (indien van toepassing)"
    ],
    opmerkingen: ""
  },
  {
    id: 17, naam: "Raamdecoratie", fase: "Interieur en oplevering",
    uitvoerder: "Zelf", extern: false, ruimtes: ["Woonkamer", "Ouderslaapkamer", "Tweede slaapkamer"],
    vereist: "Gordijnen/rails besteld en geleverd, schilderwerk droog", vereistDagen: [10],
    materiaal: [
      { naam: "Gordijnrails", aantal: "" },
      { naam: "Gordijnen/raamdecoratie", aantal: "" }
    ],
    droogtijd: null,
    taken: [
      "Gordijnrails ophangen, zo hoog mogelijk",
      "Gordijnen ophangen",
      "Verduisterende raamdecoratie ouderslaapkamer monteren"
    ],
    opmerkingen: ""
  },
  {
    id: 18, naam: "Meubels plaatsen", fase: "Interieur en oplevering",
    uitvoerder: "Zelf", extern: false, ruimtes: ["Hele woning"],
    vereist: "Vloer, plinten en schilderwerk klaar", vereistDagen: [13],
    materiaal: [], droogtijd: null,
    taken: [
      "Meubels per ruimte plaatsen (zie Meubels per kamer)",
      "Hoekbank positioneren",
      "Laatste losse items uitpakken en plaatsen"
    ],
    opmerkingen: ""
  },
  {
    id: 19, naam: "Restpunten en oplevering", fase: "Interieur en oplevering",
    uitvoerder: "Zelf", extern: false, ruimtes: ["Hele woning"],
    vereist: "Alle voorgaande klusdagen afgerond", vereistDagen: [15, 16, 17, 18],
    materiaal: [], droogtijd: null,
    taken: [
      "Restpuntenlijst doorlopen (zie Oplevering)",
      "Kitnaden en detailafwerking controleren",
      "Ventilatie testen na kierdichting en isolatie",
      "Dossier compleet maken: facturen, foto's, garanties"
    ],
    opmerkingen: "Zie de sectie Oplevering voor de volledige technische en dossier-checklist."
  }
];

/* Actieplanning: alles wat vooraf uitgezocht, besloten, aangevraagd, ingepland of
   gekocht moet worden — samenvoeging van de oude Besluiten, Uit te zoeken en Acties.
   blokkeertDag verwijst naar KLUSDAGEN[].id en drijft de "Blokkeert planning"-badge aan. */
const ACTIEPLANNING = [
  // Uitzoeken
  { actie: "Heeft de woning een spouw? Endoscopisch laten vaststellen", categorie: "Uitzoeken", deadline: "Vóór alle andere offertes", wie: "Isolatiepartij", afhankelijkVan: "—", doorlooptijd: "1–2 weken", status: "Open", blokkeertDag: [6] },
  { actie: "Staat en toegankelijkheid van de kruipruimte, en of er water staat", categorie: "Uitzoeken", deadline: "Vóór alle andere offertes", wie: "Isolatiepartij", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [6] },
  { actie: "Funderingstype en of er een funderingsonderzoek of gemeentedossier is", categorie: "Uitzoeken", deadline: "Zo snel mogelijk", wie: "Zelf / gemeente", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "Is er asbest aanwezig, en waar", categorie: "Uitzoeken", deadline: "Vóór klusdag 1", wie: "Gecertificeerd bureau", afhankelijkVan: "—", doorlooptijd: "1 week", status: "Open", blokkeertDag: [1, 5] },
  { actie: "Staat van de groepenkast: aantal groepen en aardlekschakelaars", categorie: "Uitzoeken", deadline: "Vóór elektra-offerte", wie: "Elektricien", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "Materiaal van riolering en waterleiding", categorie: "Uitzoeken", deadline: "Zo snel mogelijk", wie: "Loodgieter", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "Welke ventilatie er nu is per ruimte", categorie: "Uitzoeken", deadline: "Vóór isolatiewerk", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "Is er een bouwkundig rapport van de aankoop, en wat staat erin", categorie: "Uitzoeken", deadline: "Zo snel mogelijk", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "Exacte m² per ruimte opmeten en definitief vaststellen", categorie: "Uitzoeken", deadline: "Vóór vloer bestellen", wie: "Zelf / Barry", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [12] },
  { actie: "Is het toilet beneden ook in 2023 vernieuwd of nog het oude", categorie: "Uitzoeken", deadline: "Zo snel mogelijk", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "Parkeervergunning aanvragen: voorwaarden en wachttijd", categorie: "Uitzoeken", deadline: "Zo snel mogelijk", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },

  // Beslissen
  { actie: "Vliering: alleen opslag of ooit bewoonbaar", categorie: "Beslissen", deadline: "Vóór isolatie-offerte", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [5, 6] },
  { actie: "Gevelisolatie doen of niet, na het spouwonderzoek", categorie: "Beslissen", deadline: "Vóór schilderwerk", wie: "Zelf", afhankelijkVan: "Spouwonderzoek", doorlooptijd: "—", status: "Open", blokkeertDag: [10] },
  { actie: "Schilderwerk zelf doen of uitbesteden", categorie: "Beslissen", deadline: "—", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Gedaan", opmerkingen: "Besloten: zelf doen, binnen en buiten." },
  { actie: "Airco nu voorbereiden of niet", categorie: "Beslissen", deadline: "Vóór elektricien", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [2, 3] },
  { actie: "Keukenvloer: behouden, vervangen of laten aansluiten", categorie: "Beslissen", deadline: "Vóór vloerbestelling", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [12] },
  { actie: "Vloer: materiaal, kleur, legpatroon", categorie: "Beslissen", deadline: "Vóór bestelling", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", opmerkingen: "Visgraat vraagt 15 tot 20 procent meer materiaal en meer legkosten.", blokkeertDag: [12] },
  { actie: "Functie tweede slaapkamer", categorie: "Beslissen", deadline: "Vóór elektricien", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [2, 3] },
  { actie: "Wijnkoelkast: wel of niet, en waar", categorie: "Beslissen", deadline: "Vóór elektricien", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [2, 3] },
  { actie: "Schuifdeur keuken verwijderen", categorie: "Beslissen", deadline: "Vóór klusdag 1", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [1] },
  { actie: "Deur naar de gang: houden, vervangen, met glas", categorie: "Beslissen", deadline: "Vóór schilderwerk", wie: "Zelf", afhankelijkVan: "Bestellevertijd deur", doorlooptijd: "—", status: "Open", blokkeertDag: [11] },
  { actie: "Trapafwerking: schilderen, bekleden of beide", categorie: "Beslissen", deadline: "Vóór klusdag 14", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [14] },
  { actie: "Definitieve verfkleuren per ruimte", categorie: "Beslissen", deadline: "Vóór inkoop verf", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [9, 10] },
  { actie: "Smart home: alleen verlichting of breder", categorie: "Beslissen", deadline: "Vóór elektricien", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [2, 3] },
  { actie: "Elektraplan definitief maken", categorie: "Beslissen", deadline: "Vóór elektricien", wie: "Zelf", afhankelijkVan: "Bovenstaande elektra-beslissingen", doorlooptijd: "—", status: "Open", blokkeertDag: [3] },
  { actie: "Positie TV, stopcontacten en kabeldoorvoer bepalen", categorie: "Beslissen", deadline: "Vóór elektra voorbereiden", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [2] },
  { actie: "BESTÅ/tv-meubel: maatvoering, indeling, fronten en bovenblad bepalen", categorie: "Beslissen", deadline: "Zo vroeg mogelijk", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "Levertijd 6–10 weken bij maatwerk", status: "Open" },
  { actie: "Beslissen of BESTÅ wordt meegeschilderd", categorie: "Beslissen", deadline: "Vóór bestellen BESTÅ", wie: "Zelf", afhankelijkVan: "Maatvoering BESTÅ", doorlooptijd: "—", status: "Open" },
  { actie: "Vloerplinten kiezen", categorie: "Beslissen", deadline: "Vóór bestelling", wie: "Zelf", afhankelijkVan: "Keuze vloer", doorlooptijd: "—", status: "Open" },
  { actie: "Deur- en kozijnlijsten bepalen", categorie: "Beslissen", deadline: "Vóór bestelling", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "Gordijnen en raamdecoratie kiezen", categorie: "Beslissen", deadline: "Vóór klusdag 17", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "Levertijd", status: "Open" },
  { actie: "Meubels inventariseren: houden, verkopen, weg", categorie: "Beslissen", deadline: "Vóór verhuizing", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "Dakterras en tuin: nu of volgend seizoen", categorie: "Beslissen", deadline: "Kan later", wie: "Zelf", afhankelijkVan: "Budget en planning", doorlooptijd: "—", status: "Open" },

  // Offerte aanvragen
  { actie: "Kruipruimte- en spouwonderzoek inplannen", categorie: "Offerte aanvragen", deadline: "Vóór alle andere offertes", wie: "Isolatiepartij", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [6] },
  { actie: "Isolatie-offertes vloer en dak aanvragen en werkzaamheden inplannen", categorie: "Offerte aanvragen", deadline: "Vóór vloerplanning", wie: "Isolatiepartij", afhankelijkVan: "Spouw- en kruipruimteonderzoek", doorlooptijd: "—", status: "Open", blokkeertDag: [6] },
  { actie: "Offerte vloer definitief maken", categorie: "Offerte aanvragen", deadline: "Na opmeten", wie: "Barry", afhankelijkVan: "Exacte m² bekend", doorlooptijd: "—", status: "Open", blokkeertDag: [12] },
  { actie: "Elektra inventarisatie en offerte", categorie: "Offerte aanvragen", deadline: "Vóór schilderwerk", wie: "Thomas van Ooijen of Ben Nikkels", afhankelijkVan: "Elektraplan definitief", doorlooptijd: "—", status: "Open", blokkeertDag: [3] },
  { actie: "Offerte gevelherstel en buitenschilderwerk", categorie: "Offerte aanvragen", deadline: "Vóór buitenwerk", wie: "Schilder of gevelpartij", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "Dakinspectie inplannen", categorie: "Offerte aanvragen", deadline: "Vóór dakisolatie", wie: "Dakdekker", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [6] },

  // Vakman inplannen
  { actie: "Bouwkundige keuring plannen als die er niet is", categorie: "Vakman inplannen", deadline: "Direct", wie: "Keuringsbedrijf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "Algemeen klus- en timmerwerk bespreken", categorie: "Vakman inplannen", deadline: "Vóór klusdag 1", wie: "Marcel Haagsman of John", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [4] },
  { actie: "Vlieringtrap: zelf maken of timmerman inplannen", categorie: "Vakman inplannen", deadline: "Vóór klusdag 5", wie: "Zelf / timmerman", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [5] },
  { actie: "Trap-uitvoerder inplannen indien uitbesteed", categorie: "Vakman inplannen", deadline: "Vóór klusdag 14", wie: "Zelf / timmerman", afhankelijkVan: "Trapafwerking gekozen", doorlooptijd: "—", status: "Open", blokkeertDag: [14] },

  // Bestellen / inkopen
  { actie: "Verf en schildermaterialen bestellen", categorie: "Bestellen / inkopen", deadline: "Vóór klusdag 9", wie: "Zelf", afhankelijkVan: "Verfkleuren definitief", doorlooptijd: "—", status: "Open", blokkeertDag: [9] },
  { actie: "BESTÅ/tv-meubel bestellen", categorie: "Bestellen / inkopen", deadline: "Na definitief ontwerp", wie: "Zelf", afhankelijkVan: "Maatvoering en meeschilderen bepaald", doorlooptijd: "Levertijd 6–10 weken", status: "Open", blokkeertDag: [15] },
  { actie: "Deurklink slaapkamer bestellen/vervangen", categorie: "Bestellen / inkopen", deadline: "Vóór klusdag 11", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "Deur- en kozijnlijsten bestellen", categorie: "Bestellen / inkopen", deadline: "Vóór klusdag 11", wie: "Zelf", afhankelijkVan: "Lijsten bepaald", doorlooptijd: "—", status: "Open", blokkeertDag: [11] },
  { actie: "Trapmateriaal bestellen (overzettreden/bekleding/traploper)", categorie: "Bestellen / inkopen", deadline: "Vóór klusdag 14", wie: "Zelf", afhankelijkVan: "Trapafwerking gekozen", doorlooptijd: "—", status: "Open", blokkeertDag: [14] },
  { actie: "Gordijnen/raamdecoratie bestellen", categorie: "Bestellen / inkopen", deadline: "Vóór klusdag 17", wie: "Zelf", afhankelijkVan: "Keuze gemaakt", doorlooptijd: "Levertijd", status: "Open", blokkeertDag: [17] },
  { actie: "Definitieve lampenlijst maken en armaturen bestellen", categorie: "Bestellen / inkopen", deadline: "Vóór klusdag 16", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [16] },
  { actie: "Container regelen", categorie: "Bestellen / inkopen", deadline: "1–2 weken vóór klusdag 1", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [1] },
  { actie: "Beschermmateriaal kopen (folie, karton, stofzeilen)", categorie: "Bestellen / inkopen", deadline: "Vóór klusdag 1", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", blokkeertDag: [1] },
  { actie: "Benodigde gereedschappen controleren en aanvullen", categorie: "Bestellen / inkopen", deadline: "Vóór klusdag 1", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open", opmerkingen: "Zie de sectie Gereedschap.", blokkeertDag: [1] },

  // Administratie / subsidie
  { actie: "Subsidiehistorie adres controleren", categorie: "Administratie / subsidie", deadline: "Vóór eigen aanvraag", wie: "Zelf, via gemeente of RVO", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "Gemeentelijke verduurzamingssubsidies controleren (Alphen aan den Rijn)", categorie: "Administratie / subsidie", deadline: "Vóór ISDE-aanvraag", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "Opstalverzekering, nutsbedrijven en inschrijving regelen", categorie: "Administratie / subsidie", deadline: "1–2 weken vóór sleuteloverdracht", wie: "Zelf", afhankelijkVan: "—", doorlooptijd: "—", status: "Open" },
  { actie: "ISDE-aanvraag indienen", categorie: "Administratie / subsidie", deadline: "Binnen 24 maanden na uitvoering, na inschrijving op adres", wie: "Zelf", afhankelijkVan: "Isolatiewerk afgerond, facturen compleet", doorlooptijd: "—", status: "Open" }
];

const RISICOS = [
  { risico: "Geen spouw", waarom: "Bouwjaar 1929", impact: "Gevelisolatiebudget klopt niet, plan moet om", check: "Endoscopisch onderzoek" },
  { risico: "Natte of lage kruipruimte", waarom: "Hoge grondwaterstand in de regio", impact: "Vloerisolatie kan niet, of alleen met bodemfolie erbij", check: "Inspectie met foto's" }
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

const RISICO_VUISTREGEL = "De vuistregel: niets afwerken voordat deze twee zijn afgevinkt. Verf en vloer zijn het goedkoopst om nu uit te stellen en het duurst om later opnieuw te doen.";

const TOOLS = [
  { naam: "Kwasten en rollers (diverse maten)", aantal: "" },
  { naam: "Verfbakken en afplaktape", aantal: "" },
  { naam: "Schuurmachine en schuurpapier", aantal: "" },
  { naam: "Verfkrabber en plamuurmes", aantal: "" },
  { naam: "Accuboormachine", aantal: "" },
  { naam: "Slagboormachine (voor steen/beton)", aantal: "" },
  { naam: "Schroevendraaierset", aantal: "" },
  { naam: "Waterpas", aantal: "" },
  { naam: "Rolmaat", aantal: "" },
  { naam: "Hamer", aantal: "" },
  { naam: "Figuurzaag of handzaag", aantal: "" },
  { naam: "Ladder (trap- en rechte ladder)", aantal: "" },
  { naam: "Bouwstofzuiger", aantal: "" },
  { naam: "Kruiwagen of bouwemmers", aantal: "" },
  { naam: "Afvalzakken en stofzeilen", aantal: "" },
  { naam: "Werkhandschoenen en veiligheidsbril", aantal: "" },
  { naam: "Stofmaskers (FFP2)", aantal: "" },
  { naam: "Kitpistool", aantal: "" },
  { naam: "Nietpistool (tacker)", aantal: "" },
  { naam: "Verlengsnoer en bouwlamp", aantal: "" }
];

/* Plattegronden: plaats een afbeelding op images/plattegronden/<slug>.jpg */
const FLOORPLANS = [
  { slug: "begane-grond", naam: "Begane grond" },
  { slug: "verdieping", naam: "Verdieping" }
];
