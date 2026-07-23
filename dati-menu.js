'use strict';
/* =========================================================
   Trattoria da Franca — Menu digitale
   FILE 3/5: DATI MENU — tutti i testi e i contenuti del menu.
   Qui vanno modificati: piatti, prezzi, vini, birre, allergeni
   e le traduzioni IT/EN. Nessuna logica di funzionamento qui:
   per quella vedi app.js. Per le foto vedi dati-foto.js.
   ========================================================= */

/* ---------- TESTI INTERFACCIA ---------- */
const ui = {
  it: {
    catTitolo: "Cosa vuoi consultare?",
    piatti: "Piatti", vini: "Lista dei Vini", birre: "Birre in Bottiglia",
    allergeni: "Lista Allergeni",
    allergeniTitolo: "I 14 allergeni",
    allergeniNota: "Ai sensi del Reg. UE 1169/2011. Per qualsiasi dubbio su intolleranze o allergie, il personale di sala è a disposizione.",
    schedaVino: {
      zona: "Zona di produzione", vitigno: "Vitigno", descrizione: "Descrizione",
      daScrivere: "Da scrivere"
    },
    cambiaLingua: "← Cambia lingua", indietro: "← Categorie",
    tornaCategorie: "← Torna alle categorie",
    avvisoPranzo: "Alcuni piatti non sono disponibili a pranzo (11:30–15:00)"
  },
  en: {
    catTitolo: "What would you like to see?",
    piatti: "Dishes", vini: "Wine List", birre: "Bottled Beers",
    allergeni: "Allergen List",
    allergeniTitolo: "The 14 allergens",
    allergeniNota: "As per EU Regulation 1169/2011. For any doubt about intolerances or allergies, our staff is at your disposal.",
    schedaVino: {
      zona: "Production area", vitigno: "Grape variety", descrizione: "Description",
      daScrivere: "To be written"
    },
    cambiaLingua: "← Change language", indietro: "← Categories",
    tornaCategorie: "← Back to categories",
    avvisoPranzo: "Some dishes are not available at lunch (11:30 AM–3:00 PM)"
  }
};

/* ---------- DATI ALLERGENI (14 allergeni UE) ---------- */
const allergeniData = [
  { ic:"🌾", it:"Cereali contenenti glutine",              en:"Cereals containing gluten" },
  { ic:"🦐", it:"Crostacei e prodotti a base di crostacei", en:"Crustaceans and products thereof" },
  { ic:"🥚", it:"Uova e prodotti a base di uova",           en:"Eggs and products thereof" },
  { ic:"🐟", it:"Pesce e prodotti a base di pesce",         en:"Fish and products thereof" },
  { ic:"🥜", it:"Arachidi e prodotti a base di arachidi",   en:"Peanuts and products thereof" },
  { ic:"🫘", it:"Soia e prodotti a base di soia",           en:"Soybeans and products thereof" },
  { ic:"🥛", it:"Latte e prodotti a base di latte (incluso lattosio)", en:"Milk and products thereof (including lactose)" },
  { ic:"🌰", it:"Frutta a guscio (mandorle, nocciole, noci, ecc.)",   en:"Nuts (almonds, hazelnuts, walnuts, etc.)" },
  { ic:"🥬", it:"Sedano e prodotti a base di sedano",       en:"Celery and products thereof" },
  { ic:"🌱", it:"Senape e prodotti a base di senape",       en:"Mustard and products thereof" },
  { ic:"🌻", it:"Semi di sesamo e prodotti a base di sesamo", en:"Sesame seeds and products thereof" },
  { ic:"🍷", it:"Anidride solforosa e solfiti (>10 mg/kg)", en:"Sulphur dioxide and sulphites (>10 mg/kg)" },
  { ic:"🫛", it:"Lupini e prodotti a base di lupini",       en:"Lupin and products thereof" },
  { ic:"🦪", it:"Molluschi e prodotti a base di molluschi", en:"Molluscs and products thereof" }
];


/* ---------- DATI MENU PIATTI ---------- */
const piattiData = {
  it: {
    titolo: "Menù",
    nota: [
      "La gentile clientela è pregata di informare il personale di sala per qualsiasi intolleranza ed allergia.",
      "Vi ricordiamo inoltre che il locale non dispone di una cucina separata per le pietanze senza glutine, sarà comunque nostra premura preparare tutte le pietanze senza contaminazioni."
    ],
    sezioni: [
      { titolo: "Antipasti", items: [
        ["Culaccia, stracciatella e chips di polenta croccante","€ 16,00", null, [7]],
        ["Crudo di patanegra con pinsa romana, sale grosso e rosmarino","€ 16,00", null, [1]],
        ["Selezione di formaggi con composte","€ 16,50", null, [7]],
        ["Battuta di manzo a coltello con misticanza e frutta","€ 15,00", ["lun","mar","mer","gio","ven"], []],
        ["Sformatino di patate con asparagi e guanciale croccante","€ 14,50", null, [3,7]],
        ["Salume misto (coppa, pancetta, crudo, salame)","€ 12,50", null, [12]],
        ["Tagliere della casa (consigliato per 2 persone)","€ 24,00", null, [7,12]],
        ["Caprese con mozzarella di bufala e pesto di basilico","€ 12,50", null, [7,8]],
        ["Carne salada trentina con pomodori freschi e olio agrumato","€ 16,00", null, [12]],
        ["Millefoglie di melanzane, pomodoro e mozzarella","€ 13,00", null, [7]],
        ["Gnocco fritto (6 pezzi)","€ 3,80", null, [1]],
        ["Tigelle (5 pezzi)","€ 3,80", ["lun","mar","mer","gio","ven","sab"], [1]]
      ]},
      { titolo: "Primi", items: [
        ["Tortelli di zucca con burro e salvia oppure pomodoro e pancetta","€ 13,00", null, [1,3,7]],
        ["Tortelli di ricotta e basilico con pomodorini e stracciatella","€ 13,00", null, [1,3,7]],
        ["Tortelli di porchetta al burro ed erba cipollina","€ 13,00", null, [1,3,7]],
        ["Tagliatelle all'anatra","€ 13,00", null, [1,3]],
        ["Tagliatelle asparagi e speck","€ 13,00", null, [1,3]],
        ["Maccheroncini con lo stracotto d'asino","€ 13,00", null, [1]],
        ["Maccheroncini con pistacchio, mascarpone e pancetta","€ 13,00", null, [1,7,8]],
        ["Maccheroncini di grano saraceno con pesto di rucola, stracchino e salsiccia","€ 13,00", null, [1,7,8]],
        ["Bigoli con lambrusco e salsiccia","€ 13,00", null, [1,3,12]],
        ["Bigoli alla carbonara","€ 13,00", null, [1,3,7]],
        ["Bigoli con acciughe del cantabrico, burro e limone","€ 13,00", null, [1,3,4,7]],
        ["Risotto alla mantovana","€ 13,00", null, [7]],
        ["Risotto con mitili, gin e stracciatella","€ 13,00", null, [7,14]]
      ]},
      { titolo: "Secondi", items: [
        ["Stracotto d'asino con polenta abbrustolita","€ 16,00", null, []],
        ["Costine in salsa bbq cotte a bassa temperatura","€ 15,00", null, []],
        ["Stinco al forno alla birra e miele","€ 14,00", null, [1]],
        ["Tagliata di pollo con pomodorini secchi e aceto balsamico","€ 15,00", null, []],
        ["Tagliata di manzo al rosmarino affumicato e olio d'oliva a crudo","€ 19,00", null, []],
        ["Tagliata di manzo con rucola e grana","€ 19,00", null, [7]],
        ["Filetto di manzo con cipolla caramellata e pancetta","€ 20,00", null, []],
        ["Tagliata di manzo con brandy e granella di pistacchio","€ 20,00", null, [8]]
      ]},
      { titolo: "Secondi alla brace/griglia", items: [
        ["Grigliata di maiale (costine, pancetta, coppa, salsiccia)","€ 14,50", ["lun","mar","mer","gio","ven"], [12]],
        ["Tagliata di manzo","€ 17,50", null, []],
        ["Filetto di manzo","€ 18,50", null, []],
        ["Costata garonese","€/kg 46,00", null, []],
        ["Fiorentina garonese","€/kg 56,00", null, []],
        ["Salsiccia con polenta abbrustolita","€ 13,00", null, [12]]
      ]},
      { titolo: "Contorni", items: [
        ["Patatine fritte","€ 4,50", null, []],
        ["Patate al forno","€ 4,50", null, []],
        ["Verdure grigliate","€ 4,50", null, []],
        ["Verdure pastellate","€ 4,50", null, [1,3]],
        ["Verdure cotte","€ 4,50", null, []]
      ]},
      { titolo: "Dessert", items: [
        ["Dolci della casa","€ 6,00"],
        ["Sorbetto","€ 4,00"]
      ]},
      { titolo: "Acqua e Bevande", items: [
        ["Naturale o Frizzante 0,5L","€ 1,50"],
        ["Naturale o Frizzante 1L","€ 2,50"],
        ["Coca cola in lattina 33cl","€ 3,50"],
        ["Coca cola in bottiglia 1L","€ 6,00"]
      ]},
      { titolo: "Vino della Casa", tabella: true, colonne: ["1/4L","1/2L","1L"], items: [
        ["Trebbiano bianco", ["€ 4,00","€ 6,00","€ 11,00"]],
        ["Lambrusco rosso", ["€ 4,00","€ 6,00","€ 11,00"]],
        ["Lambrusco rosato", ["€ 4,00","€ 6,00","€ 11,00"]],
        ["Sangiovese", ["€ 4,00","€ 6,00","€ 11,00"]]
      ]}
    ],
    coperto: "Coperto € 2"
  },
  en: {
    titolo: "Menu",
    nota: [
      "Guests are kindly requested to inform the waiting staff of any intolerance or allergy.",
      "Please note that the restaurant does not have a separate kitchen for gluten-free dishes; we will nonetheless take every care to prepare all dishes avoiding cross-contamination."
    ],
    sezioni: [
      { titolo: "Starters", items: [
        ["Culaccia ham, stracciatella cheese and crispy polenta chips","€ 16,00", null, [7]],
        ["Cured Patanegra ham with Roman pinsa, coarse salt and rosemary","€ 16,00", null, [1]],
        ["Selection of cheeses with fruit compotes","€ 16,50", null, [7]],
        ["Hand-cut beef tartare with mixed leaves and fruit","€ 15,00", ["lun","mar","mer","gio","ven"], []],
        ["Potato flan with asparagus and crispy guanciale","€ 14,50", null, [3,7]],
        ["Mixed cured meats (coppa, pancetta, prosciutto, salami)","€ 12,50", null, [12]],
        ["House sharing board (recommended for 2 people)","€ 24,00", null, [7,12]],
        ["Caprese salad with buffalo mozzarella and basil pesto","€ 12,50", null, [7,8]],
        ["Trentino-style cured beef with fresh tomatoes and citrus oil","€ 16,00", null, [12]],
        ["Eggplant, tomato and mozzarella millefeuille","€ 13,00", null, [7]],
        ["Fried dough \"gnocco fritto\" (6 pieces)","€ 3,80", null, [1]],
        ["\"Tigelle\" flatbreads (5 pieces)","€ 3,80", ["lun","mar","mer","gio","ven","sab"], [1]]
      ]},
      { titolo: "First Courses", items: [
        ["Pumpkin tortelli with butter and sage, or tomato and pancetta","€ 13,00", null, [1,3,7]],
        ["Ricotta and basil tortelli with cherry tomatoes and stracciatella","€ 13,00", null, [1,3,7]],
        ["Porchetta tortelli with butter and chives","€ 13,00", null, [1,3,7]],
        ["Tagliatelle with duck ragù","€ 13,00", null, [1,3]],
        ["Tagliatelle with asparagus and speck","€ 13,00", null, [1,3]],
        ["Maccheroncini with slow-cooked donkey meat","€ 13,00", null, [1]],
        ["Maccheroncini with pistachio, mascarpone and pancetta","€ 13,00", null, [1,7,8]],
        ["Buckwheat maccheroncini with rocket pesto, stracchino cheese and sausage","€ 13,00", null, [1,7,8]],
        ["Bigoli pasta with Lambrusco wine and sausage","€ 13,00", null, [1,3,12]],
        ["Bigoli pasta carbonara","€ 13,00", null, [1,3,7]],
        ["Bigoli pasta with Cantabrian anchovies, butter and lemon","€ 13,00", null, [1,3,4,7]],
        ["Risotto Mantova-style","€ 13,00", null, [7]],
        ["Risotto with mussels, gin and stracciatella","€ 13,00", null, [7,14]]
      ]},
      { titolo: "Main Courses", items: [
        ["Slow-cooked donkey stew with toasted polenta","€ 16,00", null, []],
        ["Low-temperature cooked ribs in BBQ sauce","€ 15,00", null, []],
        ["Oven-baked pork shank with beer and honey","€ 14,00", null, [1]],
        ["Sliced chicken with sun-dried tomatoes and balsamic vinegar","€ 15,00", null, []],
        ["Sliced beef with smoked rosemary and raw olive oil","€ 19,00", null, []],
        ["Sliced beef with rocket and Grana cheese","€ 19,00", null, [7]],
        ["Beef fillet with caramelized onion and pancetta","€ 20,00", null, []],
        ["Sliced beef with brandy and chopped pistachio","€ 20,00", null, [8]]
      ]},
      { titolo: "Grilled Main Courses", items: [
        ["Grilled pork platter (ribs, pancetta, coppa, sausage)","€ 14,50", ["lun","mar","mer","gio","ven"], [12]],
        ["Sliced beef","€ 17,50", null, []],
        ["Beef fillet","€ 18,50", null, []],
        ["Garonese rib steak","€/kg 46,00", null, []],
        ["Garonese Fiorentina steak","€/kg 56,00", null, []],
        ["Sausage with toasted polenta","€ 13,00", null, [12]]
      ]},
      { titolo: "Side Dishes", items: [
        ["French fries","€ 4,50", null, []],
        ["Roast potatoes","€ 4,50", null, []],
        ["Grilled vegetables","€ 4,50", null, []],
        ["Battered vegetables","€ 4,50", null, [1,3]],
        ["Cooked vegetables","€ 4,50", null, []]
      ]},
      { titolo: "Desserts", items: [
        ["House desserts","€ 6,00"],
        ["Sorbet","€ 4,00"]
      ]},
      { titolo: "Drinks", items: [
        ["Still or Sparkling 0.5L","€ 1,50"],
        ["Still or Sparkling 1L","€ 2,50"],
        ["Coca-Cola can 33cl","€ 3,50"],
        ["Coca-Cola bottle 1L","€ 6,00"]
      ]},
      { titolo: "House Wine", tabella: true, colonne: ["1/4L","1/2L","1L"], items: [
        ["Trebbiano white", ["€ 4,00","€ 6,00","€ 11,00"]],
        ["Lambrusco red", ["€ 4,00","€ 6,00","€ 11,00"]],
        ["Lambrusco rosé", ["€ 4,00","€ 6,00","€ 11,00"]],
        ["Sangiovese", ["€ 4,00","€ 6,00","€ 11,00"]]
      ]}
    ],
    coperto: "Cover charge € 2"
  }
};


/* ---------- DATI VINI ---------- */
const viniData = {
  it: {
    titolo: "Vini",
    sezioni: [
      { titolo: "Le Bollicine", items: [
        ["Prosecco Superiore DOCG Valdobbiadene \"Bandarossa\" – Bortolomiol","€ 22"],
        ["Blanc de Noirs Metodo Classico – Gualtieri","€ 20"],
        ["Prosecco Superiore Valdobbiadene DOCG – Bortolin","€ 22"],
        ["Spumante Brut \"Serre\" – Pederiva","€ 16"],
        ["Prosecco Superiore Valdobbiadene DOCG Brut – Tordera","€ 22"],
        ["Prosecco Superiore Conegliano Valdobbiadene DOCG Brut – Masottina","€ 20"],
        ["Franciacorta Brut – San-Tus","€ 35"],
        ["Perlugo Metodo Classico Bio – Pievalta","€ 25"],
        ["Trento DOC Brut \"601\" – Cantina di Trento","€ 27"],
        ["Pignoletto Brut – Romandiola","€ 17"],
        ["Dirado Brut Millesimato – Corte Capitelli","€ 20"],
        ["Trento DOC \"601\" Dosaggio Zero – Cantina di Trento","€ 30"],
        ["Verdicchio Metodo Classico Extra Brut 2025 – Umani Ronchi","€ 35"]
      ]},
      { titolo: "I Bianchi", items: [
        ["Custoza DOC 2022 – Menegotti","€ 15"],
        ["Irpinia Falanghina DOC 2024 – Luciano Ercolino","€ 18"],
        ["Tamanis Friuli DOC Aquileia – Ca' Bolani","€ 22"],
        ["Passerina 2025 – Umani Ronchi","€ 18"],
        ["Pecorino 2025 – Umani Ronchi","€ 18"],
        ["Fiano di Avellino DOCG 2024 – Luciano Ercolino","€ 23"]
      ]},
      { titolo: "I Rosati", items: [
        ["Trento DOC Brut Rosé - Cantina di Trento","€ 28"],
        ["Rosé Extra Brut - Ca' dei Frati","€ 35"],
        ["Prope Cerasuolo d'Abruzzo - Velenosi","€ 18"],
        ["Sollevante Spumante Brut - Tenuta La Commenda","€ 20"],
        ["Morena Metodo Classico - Cantina Reale","€ 25"],
        ["Chiaretto di Bardolino Rosé - Menegotti","€ 18"]
      ]},
      { titolo: "I Rossi", items: [
        ["Montepulciano d'Abruzzo 0,375 - Vigna Corvino","€ 9"],
        ["Ninfa 2022 - Velenosi","€ 26"],
        ["Tamanis Friuli DOC 2020 - Ca' Bolani","€ 26"],
        ["Roggio del Filare 2020 - Velenosi","€ 50"],
        ["Caeles Nero d'Avola 2023 - Firriato","€ 24"],
        ["Mezzacosta Rosso Veronese 2019 - Menegotti","€ 25"],
        ["Solestà Rosso Piceno Superiore 2022 - Velenosi","€ 26"],
        ["Querciantica Lacrima di Morro d'Alba DOC Superiore - Velenosi","€ 25"],
        ["Südtirol Blauburgunder 2024 - Muri-Gries","€ 25"],
        ["Guiry Sangiovese 2022 - Tenuta Biodinamica Mara","€ 22"],
        ["Amarone della Valpolicella 2021 - Bertani","€ 50"],
        ["Brunello di Montalcino 2019 - Val di Suga","€ 50"],
        ["Salterio Rosso di Montepulciano DOC 2024 - Tenuta Trerose","€ 22"],
        ["Ludi Offida DOCG 2019 - Velenosi","€ 40"],
        ["Verso Sera Montepulciano d'Abruzzo DOCG 2021 - Velenosi","€ 60"]
      ]},
      { titolo: "I Lambruschi", items: [
        ["Lambrusco Grasparossa di Castelvetro DOC Amabile - Gavioli","€ 14"],
        ["Lambrusco Concerto 1,5 L - Medici Ermete","€ 26"],
        ["Lambrusco La Villetta DOP - Corte Villetta","€ 12"],
        ["Galpedar Lambrusco - Lebovitz","€ 14"],
        ["Il Ligabue Lambrusco DOP - Cantina Gualtieri","€ 16"],
        ["Si Fosse Foco Lambrusco Biologico Scuro - Pacchioni","€ 14"],
        ["Bucciamara - Cantina Gualtieri","€ 16"],
        ["Bollerosse Lambrusco Reggiano Frizzante DOP - Podere Francesco","€ 13"],
        ["Confini Lambrusco di Sermide - Confini del Vino","€ 14"]
      ]}
    ]
  },
  en: {
    titolo: "Wines",
    sezioni: [
      { titolo: "Sparkling Wines", items: [
        ["Prosecco Superiore DOCG Valdobbiadene \"Bandarossa\" – Bortolomiol","€ 22"],
        ["Blanc de Noirs Classic Method – Gualtieri","€ 20"],
        ["Prosecco Superiore Valdobbiadene DOCG – Bortolin","€ 22"],
        ["Sparkling Brut \"Serre\" – Pederiva","€ 16"],
        ["Prosecco Superiore Valdobbiadene DOCG Brut – Tordera","€ 22"],
        ["Prosecco Superiore Conegliano Valdobbiadene DOCG Brut – Masottina","€ 20"],
        ["Franciacorta Brut – San-Tus","€ 35"],
        ["Perlugo Classic Method, Organic – Pievalta","€ 25"],
        ["Trento DOC Brut \"601\" – Cantina di Trento","€ 27"],
        ["Pignoletto Brut – Romandiola","€ 17"],
        ["Dirado Brut Vintage – Corte Capitelli","€ 20"],
        ["Trento DOC \"601\" Zero Dosage – Cantina di Trento","€ 30"],
        ["Verdicchio Classic Method Extra Brut 2025 – Umani Ronchi","€ 35"]
      ]},
      { titolo: "White Wines", items: [
        ["Custoza DOC 2022 – Menegotti","€ 15"],
        ["Irpinia Falanghina DOC 2024 – Luciano Ercolino","€ 18"],
        ["Tamanis Friuli DOC Aquileia – Ca' Bolani","€ 22"],
        ["Passerina 2025 – Umani Ronchi","€ 18"],
        ["Pecorino 2025 – Umani Ronchi","€ 18"],
        ["Fiano di Avellino DOCG 2024 – Luciano Ercolino","€ 23"]
      ]},
      { titolo: "Rosé Wines", items: [
        ["Trento DOC Brut Rosé - Cantina di Trento","€ 28"],
        ["Rosé Extra Brut - Ca' dei Frati","€ 35"],
        ["Prope Cerasuolo d'Abruzzo - Velenosi","€ 18"],
        ["Sollevante Sparkling Brut - Tenuta La Commenda","€ 20"],
        ["Morena Classic Method - Cantina Reale","€ 25"],
        ["Chiaretto di Bardolino Rosé - Menegotti","€ 18"]
      ]},
      { titolo: "Red Wines", items: [
        ["Montepulciano d'Abruzzo 0.375 - Vigna Corvino","€ 9"],
        ["Ninfa 2022 - Velenosi","€ 26"],
        ["Tamanis Friuli DOC 2020 - Ca' Bolani","€ 26"],
        ["Roggio del Filare 2020 - Velenosi","€ 50"],
        ["Caeles Nero d'Avola 2023 - Firriato","€ 24"],
        ["Mezzacosta Rosso Veronese 2019 - Menegotti","€ 25"],
        ["Solestà Rosso Piceno Superiore 2022 - Velenosi","€ 26"],
        ["Querciantica Lacrima di Morro d'Alba DOC Superiore - Velenosi","€ 25"],
        ["Südtirol Blauburgunder 2024 - Muri-Gries","€ 25"],
        ["Guiry Sangiovese 2022 - Tenuta Biodinamica Mara","€ 22"],
        ["Amarone della Valpolicella 2021 - Bertani","€ 50"],
        ["Brunello di Montalcino 2019 - Val di Suga","€ 50"],
        ["Salterio Rosso di Montepulciano DOC 2024 - Tenuta Trerose","€ 22"],
        ["Ludi Offida DOCG 2019 - Velenosi","€ 40"],
        ["Verso Sera Montepulciano d'Abruzzo DOCG 2021 - Velenosi","€ 60"]
      ]},
      { titolo: "Lambrusco Wines", items: [
        ["Lambrusco Grasparossa di Castelvetro DOC Amabile - Gavioli","€ 14"],
        ["Lambrusco Concerto 1.5 L - Medici Ermete","€ 26"],
        ["Lambrusco La Villetta DOP - Corte Villetta","€ 12"],
        ["Galpedar Lambrusco - Lebovitz","€ 14"],
        ["Il Ligabue Lambrusco DOP - Cantina Gualtieri","€ 16"],
        ["Si Fosse Foco Lambrusco, Organic, Dark - Pacchioni","€ 14"],
        ["Bucciamara - Cantina Gualtieri","€ 16"],
        ["Bollerosse Lambrusco Reggiano Frizzante DOP - Podere Francesco","€ 13"],
        ["Confini Lambrusco di Sermide - Confini del Vino","€ 14"]
      ]}
    ]
  }
};


/* ---------- DATI BIRRE ---------- */
const birreData = {
  it: {
    titolo: "Birre",
    sezioni: [
      { titolo: "Birre Artigianali", items: [
        ["Guglielmo – Hell Non Filtrata","€ 6"],
        ["Cordelia – IPA Non Filtrata","€ 6"],
        ["Amleto – Bock Non Filtrata","€ 6"]
      ]}
    ]
  },
  en: {
    titolo: "Beers",
    sezioni: [
      { titolo: "Craft Beers", items: [
        ["Guglielmo – Unfiltered Hell Lager","€ 6"],
        ["Cordelia – Unfiltered IPA","€ 6"],
        ["Amleto – Unfiltered Bock","€ 6"]
      ]}
    ]
  }
};

/* ---------- SCHEDA TECNICA VINO ----------
   Per ciascun vino la scheda tecnica mostra:
   - la foto della bottiglia (campo "foto", nome/percorso del file immagine)
   - la zona di produzione (campo "zona")
   - il vitigno (campo "vitigno")
   - una breve descrizione (campo "descrizione")
   Il nome del vino usato come chiave deve corrispondere esattamente al nome
   presente in viniData. Se un campo manca, viene mostrato "Da scrivere"; se
   manca la foto, il riquadro immagine viene semplicemente nascosto. */
const schedeVini = {
  /* --- Le Bollicine --- */
  "Prosecco Superiore DOCG Valdobbiadene \"Bandarossa\" – Bortolomiol": {
    foto: "vini/bandarossa.webp",
    zona: "Valdobbiadene (TV), Veneto",
    vitigno: "Glera (100%)",
    descrizione: "Giallo paglierino brillante con perlage fine e persistente. Al naso emergono note di mela, pera, pesca bianca e delicati sentori floreali. Al palato è fresco, cremoso e sapido, ideale come aperitivo o in abbinamento a piatti di pesce delicati."
  },
  "Blanc de Noirs Metodo Classico – Gualtieri": {
    foto: "vini/blancdenoir.webp",
    zona: "Gualtieri (RE), Emilia-Romagna",
    vitigno: "Lambrusco Maestri e Marani (vinificati in bianco)",
    descrizione: "Giallo paglierino dai riflessi verdolini. Fresco e floreale, con note fruttate e sentori di mela Golden. Secco, armonioso e piacevolmente equilibrato."
  },
  "Prosecco Superiore Valdobbiadene DOCG – Bortolin": {
    zona: "Valdobbiadene (TV), Veneto",
    vitigno: "Glera",
    descrizione: "Prosecco Superiore dalle colline di Valdobbiadene, fresco e fruttato, di stile classico."
  },
  "Spumante Brut \"Serre\" – Pederiva": {
    foto: "vini/serrepederiva.webp",
    zona: "Valpolicella (TV), Veneto",
    vitigno: "Glera, Verdiso, Pinot Nero",
    descrizione: "Spumante dal perlage fine e persistente, con profumi di mela verde, agrumi e delicati sentori floreali. Al palato è fresco, vivace e armonioso, con un finale pulito e persistente, ideale come aperitivo o in abbinamento ad antipasti di mare e risotti delicati.."
  },
  "Prosecco Superiore Valdobbiadene DOCG Brut – Tordera": {
    foto: "vini/tordera.webp",
    zona: "Valdobbiadene (TV), Veneto",
    vitigno: "Glera",
    descrizione: "Vino dal colore giallo paglierino brillante, con perlage fine e persistente. Al naso esprime fresche note fruttate di mela verde, mela gialla, agrumi e lime. Al palato è fresco, piacevole ed equilibrato, con un elegante richiamo alla mela e una piacevole vivacità."
  },
  "Prosecco Superiore Conegliano Valdobbiadene DOCG Brut – Masottina": {
    foto: "vini/masottina.webp",
    zona: "Conegliano (TV), Veneto",
    vitigno: "Glera",
    descrizione: "Presenta profumi fruttati e floreali, con una piacevole freschezza e una spiccata acidità. Affinato secondo tradizione, offre un gusto equilibrato e raffinato, ideale per aperitivi e abbinamenti delicati."
  },
  "Franciacorta Brut – San-Tus": {
    foto: "vini/santus.webp",
    zona: "Franciacorta (BS), Lombardia",
    vitigno: "Chardonnay e Pinot Nero",
    descrizione: "Franciacorta Brut elegante e raffinato, prodotto da uve Chardonnay e Pinot Nero raccolte a mano e affinate a lungo sui lieviti. Al naso esprime delicate note di cedro, papaya e miele. Al palato è cremoso e armonioso, con un perlage fine e persistente e un gusto di grande finezza."
  },
  "Perlugo Metodo Classico Bio – Pievalta": {
    foto: "vini/pierlugo.webp",
    zona: "Maiolati Spontini (AN), Marche",
    vitigno: "Verdicchio",
    descrizione: "Metodo Classico Dosaggio Zero da uve Verdicchio, caratterizzato da grande freschezza e mineralità. Al naso esprime profumi di fiori bianchi, agrumi, lime e frutta a polpa bianca, con delicate note di crosta di pane. Al palato è elegante, sapido e fragrante, con un perlage fine e persistente, ideale come aperitivo e con piatti di pesce delicati."
  },
  "Trento DOC Brut \"601\" – Cantina di Trento": {
    foto: "vini/601brut.webp",
    zona: "Colline di Trento, Trentino",
    vitigno: "Chardonnay",
    descrizione: "Trento DOC Metodo Classico dal colore giallo paglierino intenso, con profumi eleganti di frutta e delicate note di lievito. Al palato è fresco, cremoso e strutturato, con una spuma fine e persistente. Ideale come aperitivo o in abbinamento ai piatti della tradizione trentina."
  },
  "Pignoletto Brut – Romandiola": {
    foto: "vini/pignoletto.webp",
    zona: "Colli Bolognesi/Romagna, Emilia-Romagna",
    vitigno: "Grechetto Gentile (Pignoletto)",
    descrizione: "Colore giallo paglierino chiaro con riflessi verdognoli, bouquet intenso e armonico con sentore di rosa, sapore morbido, corposo e leggermente fruttato."
  },
  "Dirado Brut Millesimato – Corte Capitelli": {
    foto: "vini/dirado.webp",
    zona: "Montebello Vicentino (VI), Veneto",
    vitigno: "Garganega",
    descrizione: "Spumante dal colore bianco cristallino e brillante, con schiuma cremosa e perlage fine e persistente. Al naso presenta eleganti note minerali, balsamiche e sentori di fieno maturo. Al palato è morbido e setoso, con un perfetto equilibrio tra freschezza e sapidità."
  },
  "Trento DOC \"601\" Dosaggio Zero – Cantina di Trento": {
    foto: "vini/601zero.webp",
    zona: "Colline di Trento, Trentino",
    vitigno: "Chardonnay",
    descrizione: "Trento DOC Dosaggio Zero Metodo Classico dal colore giallo paglierino intenso e dal perlage fine e persistente. Al naso esprime eleganti note di lievito e sfumature minerali. Al palato è fresco, asciutto e strutturato, con una piacevole cremosità e un finale lungo e persistente. Ideale come aperitivo."
  },
  "Verdicchio Metodo Classico Extra Brut 2025 – Umani Ronchi": {
    foto: "vini/verdicchioumanironchi.webp",
    zona: "Castelli di Jesi (AN), Marche",
    vitigno: "Verdicchio e Chardonnay",
    descrizione: "Spumante dal colore giallo paglierino brillante, con perlage fine e persistente. Al naso offre eleganti note floreali e fruttate, con sentori di bergamotto, mandarino e pane appena sfornato. Al palato è cremoso e fresco, con una piacevole sapidità e un finale agrumato e persistente, ideale con pesce, crostacei e frutti di mare."
  },

  /* --- I Bianchi --- */
  "Custoza DOC 2022 – Menegotti": {
    foto: "vini/custoza.webp",
    zona: "Custoza, Villafranca di Verona (VR), Veneto",
    vitigno: "Fernanda 45% Garganega 40%, Trebbiano 10%, Tocai Friulano 5%",
    descrizione: "Custoza DOC dal colore giallo paglierino, con profumi fruttati intensi e leggermente aromatici. Al palato è sapido, delicato e armonioso, con un buon equilibrio e una piacevole rotondità. Ideale come aperitivo, con antipasti, piatti di pesce e carni bianche."
  },
  "Irpinia Falanghina DOC 2024 – Luciano Ercolino": {
    foto: "vini/irpinia.webp",
    zona: "Irpinia (AV), Campania",
    vitigno: "Falanghina",
    descrizione: "Vino dal colore giallo paglierino luminoso, con profumi agrumati di lime, pompelmo e kiwi accompagnati da delicate note floreali di gelsomino. Al palato è fresco e minerale, con una piacevole acidità e una buona persistenza che ne valorizza l’eleganza."
  },
  "Tamanis Friuli DOC Aquileia – Ca' Bolani": {
    foto: "vini/tamanis-bianco.webp",
    zona: "Cervignano del Friuli (UD), Friuli-Venezia Giulia",
    vitigno: "Friulano, Pinot Bianco, Malvasia, Sauvignon",
    descrizione: "Vino dal colore dorato brillante e intenso, caratterizzato da un profilo aromatico complesso e territoriale. Al naso esprime note fruttate fresche e raffinate, mentre al palato è morbido, fresco e armonioso, con un finale ampio, aromatico e persistente."
  },
  "Passerina 2025 – Umani Ronchi": {
    foto: "vini/passerina.webp",
    zona: "Osimo (AN), Marche",
    vitigno: "Passerina",
    descrizione: "Vino dal colore giallo paglierino luminoso con lievi riflessi dorati. Al naso offre eleganti profumi di fiori selvatici e frutta a polpa gialla, con note di pesca, albicocca e mela Golden. Al palato è fresco e sapido, con buona struttura e un finale armonioso ed elegante."
  },
  "Pecorino 2025 – Umani Ronchi": {
    foto: "vini/pecorino.webp",
    zona: "Abruzzo",
    vitigno: "Pecorino",
    descrizione: "Vino dal colore giallo paglierino intenso, con profumi freschi di mela verde, nespola, fiori bianchi e delicate note balsamiche. Al palato è fresco e sapido, con una piacevole struttura e un finale armonioso. Ideale con antipasti di pesce, crudità e primi piatti di mare."
  },
  "Fiano di Avellino DOCG 2024 – Luciano Ercolino": {
    foto: "vini/fiano.webp",
    zona: "San Potito Ultra (AV), Campania",
    vitigno: "Fiano",
    descrizione: "Fiano di Avellino DOCG dal colore giallo paglierino intenso e luminoso. Al naso esprime profumi di pera, albicocca e citronella, con eleganti note di mandorla tostata e miele d’acacia. Al palato è morbido, aromatico e minerale, con buona struttura e persistenza. Ideale con pesce, verdure, carni bianche e sushi."
  },

  /* --- I Rosati --- */
  "Trento DOC Brut Rosé - Cantina di Trento": {
    foto: "vini/601rose.webp",
    zona: "Colline di Trento, Trentino",
    vitigno: "Pinot Nero",
    descrizione: "Trento DOC Rosé Metodo Classico dal delicato colore rosa tenue e dal perlage fine e persistente. Al naso offre fresche note fruttate e floreali, arricchite da un leggero sentore di lievito. Al palato è elegante, fresco e ben strutturato, con una piacevole vena minerale, ideale come aperitivo o in abbinamento a piatti delicati."
  },
  "Rosé Extra Brut - Ca' dei Frati": {
    foto: "vini/rosecadeifrati.webp",
    zona: "Lugana, Sirmione (BS), Lombardia",
    vitigno: "Barbera, Marzemino, Groppello, Sangiovese",
    descrizione: "Metodo Classico Rosé dal colore rosa pallido, brillante e luminoso, con perlage fine e persistente. Al naso esprime freschi profumi di frutti rossi e delicate note di rosa, accompagnati da eleganti sentori di lievito. Al palato è raffinato, fresco e armonioso, ideale come aperitivo o in abbinamento a piatti di pesce."
  },
  "Prope Cerasuolo d'Abruzzo - Velenosi": {
    foto: "vini/prope.webp",
    zona: "Controguerra (TE), Abruzzo",
    vitigno: "Montepulciano",
    descrizione: "Vino dal colore rosa brillante e acceso. Al naso esprime eleganti note floreali di rosa e viola, accompagnate da sentori di piccoli frutti rossi come ribes e lampone. Al palato è sapido e avvolgente, con buona struttura e persistenza, caratterizzato da delicate sfumature floreali e fruttate."
  },
  "Sollevante Spumante Brut - Tenuta La Commenda": {
    foto: "vini/sollevante.webp",
    zona: "Rio Saliceto (RE), Emilia-Romagna",
    vitigno: "Lambrusco di Sorbara",
    descrizione: "Spumante dal colore rosa fiore di pesco brillante, con perlage fine, persistente e setoso. Al naso esprime eleganti note floreali di rosa e freschi sentori fruttati di fragola, lampone e pompelmo. Al palato è fresco, sapido e persistente, con una piacevole acidità, ideale come aperitivo e in abbinamento a piatti delicati di pesce, carni bianche, salumi e pizza."
  },
  "Morena Metodo Classico - Cantina Reale": {
    foto: "vini/morena.webp",
    zona: "Abruzzo",
    vitigno: "Pinot Nero",
    descrizione: "Elegante spumante rosato dal perlage fine, con profumi di frutti rossi e gusto sapido e armonioso, affinato 24 mesi in bottiglia. Perfetto come aperitivo e in abbinamento a salumi, pesce e carni bianche."
  },
  "Chiaretto di Bardolino Rosé - Menegotti": {
    foto: "vini/chiaretto.webp",
    zona: "Bardolino (VR), Veneto",
    vitigno: "Corvina, Rondinella, Molinara, Sangiovese",
    descrizione: "Rosato fresco ed elegante dal colore rosa brillante, con profumi delicati di fiori e piccoli frutti rossi. Al palato è sapido, armonico e caratterizzato da una piacevole freschezza."
  },

  /* --- I Rossi --- */
  "Montepulciano d'Abruzzo 0,375 - Vigna Corvino": {
    foto: "vini/monte375.webp",
    zona: "Collecorvino (PE), Abruzzo",
    vitigno: "Montepulciano",
    descrizione: "Vino rosso dal colore rubino intenso con riflessi violacei, profumi di frutta rossa e gusto morbido, fresco ed equilibrato, con una buona persistenza."
  },
  "Ninfa 2022 - Velenosi": {
    foto: "vini/ninfa.webp",
    zona: "Offida e Castel di Lama (AP), Marche",
    vitigno: "Montepulciano, Cabernet Sauvignon, Merlot e Syrah",
    descrizione: "Rosso intenso e strutturato, affinato in legno, con profumi di frutti scuri, liquirizia, pepe e tabacco. Al palato è morbido, elegante e persistente, con tannini fini e ben integrati."
  },
  "Tamanis Friuli DOC 2020 - Ca' Bolani": {
    foto: "vini/tamanisrosso.webp",
    zona: "Aquileia (UD), Friuli-Venezia Giulia",
    vitigno: "Refosco, Merlot e Cabernet",
    descrizione: "Rosso intenso dai riflessi violacei, con profumi fruttati e note speziate di legno ben integrate. Al palato è fresco, morbido e strutturato, con buona persistenza e carattere territoriale."
  },
  "Roggio del Filare 2020 - Velenosi": {
    foto: "vini/roggio.webp",
    zona: "Castorano (AP), Marche",
    vitigno: "Montepulciano e Sangiovese",
    descrizione: "Rosso di grande struttura e complessità, dal colore rubino intenso con profumi di frutti rossi maturi, spezie e note balsamiche. Al palato è morbido, elegante e persistente, con tannini ben integrati e lunga evoluzione."
  },
  "Caeles Nero d'Avola 2023 - Firriato": {
    foto: "vini/caeles.webp",
    zona: "Agro di Trapani (TP), Sicilia",
    vitigno: "Nero d'Avola",
    descrizione: "Rosso siciliano dal colore rubino intenso, con profumi di frutti rossi maturi, spezie e note mediterranee. Al palato è morbido, equilibrato e persistente, con tannini vellutati e piacevole freschezza."
  },
  "Mezzacosta Rosso Veronese 2019 - Menegotti": {
    foto: "vini/mezzacosta.webp",
    zona: "Villafranca di Verona (VR), Veneto",
    vitigno: "Merlot, Cabernet",
    descrizione: "Rosso elegante e strutturato dal colore rubino intenso, con profumi di frutti rossi maturi, spezie e leggere note balsamiche. Al palato è morbido, armonico e persistente, con tannini equilibrati."
  },
  "Solestà Rosso Piceno Superiore 2022 - Velenosi": {
    foto: "vini/solestà.webp",
    zona: "Ascoli Piceno, Marche",
    vitigno: "Montepulciano e Sangiovese",
    descrizione: "Rosso strutturato dal colore rubino intenso, con profumi di frutti rossi maturi, spezie e note balsamiche. Al palato è morbido, equilibrato e persistente, con tannini eleganti e buona freschezza."
  },
  "Querciantica Lacrima di Morro d'Alba DOC Superiore - Velenosi": {
    foto: "vini/morro.webp",
    zona: "Morro d'Alba (AN), Marche",
    vitigno: "Lacrima",
    descrizione: "Rosso aromatico dal colore rubino intenso, caratterizzato da profumi floreali di rosa e violetta, con note di frutti rossi. Al palato è morbido, fresco e armonioso, con un finale elegante e persistente."
  },
  "Südtirol Blauburgunder 2024 - Muri-Gries": {
    foto: "vini/südtirol.webp",
    zona: "Bolzano, Alto Adige",
    vitigno: "Pinot Nero",
    descrizione: "Rosso elegante dal colore rubino brillante, con profumi di piccoli frutti rossi, note speziate e sentori delicati di sottobosco. Al palato è fresco, fine e armonioso, con tannini vellutati e buona persistenza."
  },
  "Guiry Sangiovese 2022 - Tenuta Biodinamica Mara": {
    foto: "vini/guiry.webp",
    zona: "San Clemente (RN), Emilia-Romagna",
    vitigno: "Sangiovese",
    descrizione: "Rosso biologico e biodinamico dal colore rubino brillante, con profumi di ciliegia, frutti rossi e note speziate. Al palato è fresco, equilibrato e armonioso, con tannini morbidi e piacevole persistenza."
  },
  "Amarone della Valpolicella 2021 - Bertani": {
    foto: "vini/amarone.webp",
    zona: "Valpolicella (VR), Veneto",
    vitigno: "Corvina Veronese e Rondinella",
    descrizione: "Grande rosso da appassimento dal colore rubino intenso, con profumi complessi di frutta rossa matura, spezie, cacao e note balsamiche. Al palato è ricco, elegante e strutturato, con tannini raffinati e lunga persistenza."
  },
  "Brunello di Montalcino 2019 - Val di Suga": {
    foto: "vini/brunello.webp",
    zona: "Montalcino (SI), Toscana",
    vitigno: "Sangiovese (Sangiovese Grosso)",
    descrizione: "Rosso di grande eleganza e struttura, dal colore rubino intenso con profumi di ciliegia, frutti di bosco, spezie e note balsamiche. Al palato è armonioso, complesso e persistente, con tannini raffinati e lunga capacità evolutiva."
  },
  "Salterio Rosso di Montepulciano DOC 2024 - Tenuta Trerose": {
    foto: "vini/montepulciano.webp",
    zona: "Montepulciano (SI), Toscana",
    vitigno: "Prugnolo Gentile (Sangiovese)",
    descrizione: "Rosso toscano fresco e fragrante dal colore rubino brillante, con profumi di ciliegia, frutti rossi e leggere note speziate. Al palato è equilibrato, morbido e piacevolmente persistente, con tannini delicati."
  },
  "Ludi Offida DOCG 2019 - Velenosi": {
    foto: "vini/offida.webp",
    zona: "Offida (AP), Marche",
    vitigno: "Montepulciano, Cabernet Sauvignon e Merlot",
    descrizione: "Rosso intenso e strutturato dal colore rubino profondo, con profumi complessi di frutti rossi maturi, spezie, tabacco e note balsamiche. Al palato è elegante, morbido e persistente, con tannini ben integrati e grande equilibrio."
  },
  "Verso Sera Montepulciano d'Abruzzo DOCG 2021 - Velenosi": {
    foto: "vini/versosera.webp",
    zona: "Colline teramane (TE), Abruzzo",
    vitigno: "Montepulciano",
    descrizione: "Rosso dal colore rubino intenso, con profumi di ciliegia, frutti di bosco e delicate note speziate. Al palato è morbido, equilibrato e persistente, con tannini vellutati e una piacevole freschezza."
  },

  /* --- I Lambruschi --- */
  "Lambrusco Grasparossa di Castelvetro DOC Amabile - Gavioli": {
    foto: "vini/grasparossa.webp",
    zona: "Castelvetro di Modena (MO), Emilia-Romagna",
    vitigno: "Lambrusco Grasparossa",
    descrizione: "Spumante rosso amabile dal colore rubino intenso con riflessi violacei, caratterizzato da profumi di frutti rossi e note floreali. Al palato è vivace, fresco e leggermente dolce, con una piacevole effervescenza."
  },
  "Lambrusco Concerto 1,5 L - Medici Ermete": {
    foto: "vini/concerto.webp",
    zona: "Reggio Emilia, Emilia-Romagna",
    vitigno: "Lambrusco Salamino",
    descrizione: "Lambrusco rosso secco dal colore rubino intenso, con profumi di ciliegia, frutti di bosco e note floreali. Al palato è fresco, armonico e fragrante, con una vivace effervescenza e una piacevole persistenza."
  },
  "Lambrusco La Villetta DOP - Corte Villetta": {
    foto: "vini/lavilletta.webp",
    zona: "Dosolo (MN), Lomardia",
    vitigno: "Lambrusco",
    descrizione: "Lambrusco frizzante dal colore rosso rubino con riflessi violacei, caratterizzato da profumi di frutti rossi e note floreali. Al palato è fresco, vivace e armonico, con una piacevole effervescenza e morbidezza."
  },
  "Galpedar Lambrusco - Lebovitz": {
    zona: "Emilia-Romagna",
    vitigno: "Lambrusco",
    descrizione: "Lambrusco frizzante dal carattere fruttato, adatto a un consumo conviviale e informale."
  },
  "Il Ligabue Lambrusco DOP - Cantina Gualtieri": {
    zona: "Gualtieri (RE), Emilia-Romagna",
    vitigno: "Lambrusco Maestri e Marani",
    descrizione: "Lambrusco Reggiano premiato, frizzante e rosso rubino, compagno ideale dell'aperitivo."
  },
  "Si Fosse Foco Lambrusco Biologico Scuro - Pacchioni": {
    zona: "Carpi (MO), Emilia-Romagna",
    vitigno: "Lambrusco",
    descrizione: "Lambrusco biologico dal colore scuro e intenso, vinoso e persistente."
  },
  "Bucciamara - Cantina Gualtieri": {
    zona: "Gualtieri (RE), Emilia-Romagna",
    vitigno: "Lambrusco",
    descrizione: "Selezione Reggiano Rosso, franco e di buon corpo, dalla bella spuma densa e violacea."
  },
  "Bollerosse Lambrusco Reggiano Frizzante DOP - Podere Francesco": {
    zona: "Reggio Emilia, Emilia-Romagna",
    vitigno: "Lambrusco",
    descrizione: "Lambrusco Reggiano frizzante, fresco e fruttato, dal perlage vivace."
  },
  "Confini Lambrusco di Sermide - Confini del Vino": {
    zona: "Sermide (MN), Lombardia",
    vitigno: "Lambrusco",
    descrizione: "Lambrusco Mantovano di confine tra Lombardia ed Emilia, frizzante e fruttato."
  }
};

/* Alcuni vini hanno un nome leggermente diverso nella versione inglese del menu
   (es. "Metodo Classico" -> "Classic Method"). Questi alias fanno sì che la
   scheda tecnica si apra correttamente anche per chi naviga in inglese,
   puntando alla stessa scheda già compilata sopra. */
const aliasSchedeVini = {
  "Blanc de Noirs Classic Method – Gualtieri": "Blanc de Noirs Metodo Classico – Gualtieri",
  "Sparkling Brut \"Serre\" – Pederiva": "Spumante Brut \"Serre\" – Pederiva",
  "Perlugo Classic Method, Organic – Pievalta": "Perlugo Metodo Classico Bio – Pievalta",
  "Dirado Brut Vintage – Corte Capitelli": "Dirado Brut Millesimato – Corte Capitelli",
  "Trento DOC \"601\" Zero Dosage – Cantina di Trento": "Trento DOC \"601\" Dosaggio Zero – Cantina di Trento",
  "Verdicchio Classic Method Extra Brut 2025 – Umani Ronchi": "Verdicchio Metodo Classico Extra Brut 2025 – Umani Ronchi",
  "Sollevante Sparkling Brut - Tenuta La Commenda": "Sollevante Spumante Brut - Tenuta La Commenda",
  "Morena Classic Method - Cantina Reale": "Morena Metodo Classico - Cantina Reale",
  "Montepulciano d'Abruzzo 0.375 - Vigna Corvino": "Montepulciano d'Abruzzo 0,375 - Vigna Corvino",
  "Lambrusco Concerto 1.5 L - Medici Ermete": "Lambrusco Concerto 1,5 L - Medici Ermete",
  "Si Fosse Foco Lambrusco, Organic, Dark - Pacchioni": "Si Fosse Foco Lambrusco Biologico Scuro - Pacchioni"
};
Object.keys(aliasSchedeVini).forEach(nomeEN => {
  const nomeIT = aliasSchedeVini[nomeEN];
  if (schedeVini[nomeIT]) schedeVini[nomeEN] = schedeVini[nomeIT];
});