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
    schedaBirra: {
      birrificio: "Birrificio", stile: "Stile", descrizione: "Descrizione",
      daScrivere: "Da scrivere"
    },
    cambiaLingua: "← Cambia lingua", indietro: "← Categorie",
    tornaCategorie: "← Torna alle categorie",
    avvisoPranzo: "Alcuni piatti non sono disponibili a pranzo (11:30–15:00)",
    cercaPiatti: "Cerca un piatto...",
    nessunRisultato: "Nessun piatto trovato."
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
    schedaBirra: {
      birrificio: "Brewery", stile: "Style", descrizione: "Description",
      daScrivere: "To be written"
    },
    cambiaLingua: "← Change language", indietro: "← Categories",
    tornaCategorie: "← Back to categories",
    avvisoPranzo: "Some dishes are not available at lunch (11:30 AM–3:00 PM)",
    cercaPiatti: "Search for a dish...",
    nessunRisultato: "No dishes found."
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
   - la zona di produzione, il vitigno e una breve descrizione, in italiano
     E in inglese (sottochiavi "it" e "en"), così la scheda si legge nella
     lingua che il cliente ha scelto nel menu.
   Il nome del vino usato come chiave deve corrispondere esattamente al nome
   presente in viniData (versione italiana). Se un campo manca, viene
   mostrato "Da scrivere"/"To be written"; se manca la foto, il riquadro
   immagine viene semplicemente nascosto. */
const schedeVini = {
  /* --- Le Bollicine --- */
  "Prosecco Superiore DOCG Valdobbiadene \"Bandarossa\" – Bortolomiol": {
    foto: "vini/bandarossa.webp",
    it: {
      zona: "Valdobbiadene (TV), Veneto",
      vitigno: "Glera (100%)",
      descrizione: "Giallo paglierino brillante con perlage fine e persistente. Al naso emergono note di mela, pera, pesca bianca e delicati sentori floreali. Al palato è fresco, cremoso e sapido, ideale come aperitivo o in abbinamento a piatti di pesce delicati."
    },
    en: {
      zona: "Valdobbiadene (TV), Veneto",
      vitigno: "Glera (100%)",
      descrizione: "Bright straw yellow with a fine, persistent perlage. On the nose, notes of apple, pear and white peach emerge, along with delicate floral hints. On the palate it is fresh, creamy and savoury, ideal as an aperitif or paired with delicate fish dishes."
    }
  },
  "Blanc de Noirs Metodo Classico – Gualtieri": {
    foto: "vini/blancdenoir.webp",
    it: {
      zona: "Gualtieri (RE), Emilia-Romagna",
      vitigno: "Lambrusco Maestri e Marani (vinificati in bianco)",
      descrizione: "Giallo paglierino dai riflessi verdolini. Fresco e floreale, con note fruttate e sentori di mela Golden. Secco, armonioso e piacevolmente equilibrato."
    },
    en: {
      zona: "Gualtieri (RE), Emilia-Romagna",
      vitigno: "Lambrusco Maestri and Marani (vinified as white)",
      descrizione: "Straw yellow with greenish highlights. Fresh and floral, with fruity notes and hints of Golden apple. Dry, harmonious and pleasantly balanced."
    }
  },
  "Prosecco Superiore Valdobbiadene DOCG – Bortolin": {
    it: {
      zona: "Valdobbiadene (TV), Veneto",
      vitigno: "Glera",
      descrizione: "Prosecco Superiore dalle colline di Valdobbiadene, fresco e fruttato, di stile classico."
    },
    en: {
      zona: "Valdobbiadene (TV), Veneto",
      vitigno: "Glera",
      descrizione: "Prosecco Superiore from the hills of Valdobbiadene, fresh and fruity, in a classic style."
    }
  },
  "Spumante Brut \"Serre\" – Pederiva": {
    foto: "vini/serrepederiva.webp",
    it: {
      zona: "Valpolicella (TV), Veneto",
      vitigno: "Glera, Verdiso, Pinot Nero",
      descrizione: "Spumante dal perlage fine e persistente, con profumi di mela verde, agrumi e delicati sentori floreali. Al palato è fresco, vivace e armonioso, con un finale pulito e persistente, ideale come aperitivo o in abbinamento ad antipasti di mare e risotti delicati."
    },
    en: {
      zona: "Valpolicella (TV), Veneto",
      vitigno: "Glera, Verdiso, Pinot Noir",
      descrizione: "Sparkling wine with a fine, persistent perlage, with aromas of green apple, citrus and delicate floral hints. On the palate it is fresh, lively and harmonious, with a clean, persistent finish, ideal as an aperitif or paired with seafood starters and delicate risottos."
    }
  },
  "Prosecco Superiore Valdobbiadene DOCG Brut – Tordera": {
    foto: "vini/tordera.webp",
    it: {
      zona: "Valdobbiadene (TV), Veneto",
      vitigno: "Glera",
      descrizione: "Vino dal colore giallo paglierino brillante, con perlage fine e persistente. Al naso esprime fresche note fruttate di mela verde, mela gialla, agrumi e lime. Al palato è fresco, piacevole ed equilibrato, con un elegante richiamo alla mela e una piacevole vivacità."
    },
    en: {
      zona: "Valdobbiadene (TV), Veneto",
      vitigno: "Glera",
      descrizione: "A wine with a bright straw yellow colour and a fine, persistent perlage. On the nose it shows fresh fruity notes of green apple, yellow apple, citrus and lime. On the palate it is fresh, pleasant and balanced, with an elegant apple character and pleasant liveliness."
    }
  },
  "Prosecco Superiore Conegliano Valdobbiadene DOCG Brut – Masottina": {
    foto: "vini/masottina.webp",
    it: {
      zona: "Conegliano (TV), Veneto",
      vitigno: "Glera",
      descrizione: "Presenta profumi fruttati e floreali, con una piacevole freschezza e una spiccata acidità. Affinato secondo tradizione, offre un gusto equilibrato e raffinato, ideale per aperitivi e abbinamenti delicati."
    },
    en: {
      zona: "Conegliano (TV), Veneto",
      vitigno: "Glera",
      descrizione: "It shows fruity and floral aromas, with pleasant freshness and pronounced acidity. Aged according to tradition, it offers a balanced, refined taste, ideal for aperitifs and delicate pairings."
    }
  },
  "Franciacorta Brut – San-Tus": {
    foto: "vini/santus.webp",
    it: {
      zona: "Franciacorta (BS), Lombardia",
      vitigno: "Chardonnay e Pinot Nero",
      descrizione: "Franciacorta Brut elegante e raffinato, prodotto da uve Chardonnay e Pinot Nero raccolte a mano e affinate a lungo sui lieviti. Al naso esprime delicate note di cedro, papaya e miele. Al palato è cremoso e armonioso, con un perlage fine e persistente e un gusto di grande finezza."
    },
    en: {
      zona: "Franciacorta (BS), Lombardy",
      vitigno: "Chardonnay and Pinot Noir",
      descrizione: "An elegant, refined Franciacorta Brut, made from hand-picked Chardonnay and Pinot Noir grapes aged for a long time on the lees. On the nose it shows delicate notes of citron, papaya and honey. On the palate it is creamy and harmonious, with a fine, persistent perlage and a taste of great finesse."
    }
  },
  "Perlugo Metodo Classico Bio – Pievalta": {
    foto: "vini/pierlugo.webp",
    it: {
      zona: "Maiolati Spontini (AN), Marche",
      vitigno: "Verdicchio",
      descrizione: "Metodo Classico Dosaggio Zero da uve Verdicchio, caratterizzato da grande freschezza e mineralità. Al naso esprime profumi di fiori bianchi, agrumi, lime e frutta a polpa bianca, con delicate note di crosta di pane. Al palato è elegante, sapido e fragrante, con un perlage fine e persistente, ideale come aperitivo e con piatti di pesce delicati."
    },
    en: {
      zona: "Maiolati Spontini (AN), Marche",
      vitigno: "Verdicchio",
      descrizione: "A Metodo Classico Zero Dosage sparkling wine made from Verdicchio grapes, characterised by great freshness and minerality. On the nose it shows aromas of white flowers, citrus, lime and white-fleshed fruit, with delicate notes of bread crust. On the palate it is elegant, savoury and fragrant, with a fine, persistent perlage, ideal as an aperitif and with delicate fish dishes."
    }
  },
  "Trento DOC Brut \"601\" – Cantina di Trento": {
    foto: "vini/601brut.webp",
    it: {
      zona: "Colline di Trento, Trentino",
      vitigno: "Chardonnay",
      descrizione: "Trento DOC Metodo Classico dal colore giallo paglierino intenso, con profumi eleganti di frutta e delicate note di lievito. Al palato è fresco, cremoso e strutturato, con una spuma fine e persistente. Ideale come aperitivo o in abbinamento ai piatti della tradizione trentina."
    },
    en: {
      zona: "Trento hills, Trentino",
      vitigno: "Chardonnay",
      descrizione: "A Trento DOC Metodo Classico with an intense straw yellow colour, elegant fruit aromas and delicate yeasty notes. On the palate it is fresh, creamy and structured, with fine, persistent bubbles. Ideal as an aperitif or paired with traditional Trentino dishes."
    }
  },
  "Pignoletto Brut – Romandiola": {
    foto: "vini/pignoletto.webp",
    it: {
      zona: "Colli Bolognesi/Romagna, Emilia-Romagna",
      vitigno: "Grechetto Gentile (Pignoletto)",
      descrizione: "Colore giallo paglierino chiaro con riflessi verdognoli, bouquet intenso e armonico con sentore di rosa, sapore morbido, corposo e leggermente fruttato."
    },
    en: {
      zona: "Colli Bolognesi/Romagna, Emilia-Romagna",
      vitigno: "Grechetto Gentile (Pignoletto)",
      descrizione: "Pale straw yellow colour with greenish highlights, an intense, harmonious bouquet with a hint of rose, and a soft, full-bodied, lightly fruity flavour."
    }
  },
  "Dirado Brut Millesimato – Corte Capitelli": {
    foto: "vini/dirado.webp",
    it: {
      zona: "Montebello Vicentino (VI), Veneto",
      vitigno: "Garganega",
      descrizione: "Spumante dal colore bianco cristallino e brillante, con schiuma cremosa e perlage fine e persistente. Al naso presenta eleganti note minerali, balsamiche e sentori di fieno maturo. Al palato è morbido e setoso, con un perfetto equilibrio tra freschezza e sapidità."
    },
    en: {
      zona: "Montebello Vicentino (VI), Veneto",
      vitigno: "Garganega",
      descrizione: "A sparkling wine with a crystalline, bright white colour, creamy foam and a fine, persistent perlage. On the nose it shows elegant mineral and balsamic notes together with hints of ripe hay. On the palate it is soft and silky, with a perfect balance between freshness and savouriness."
    }
  },
  "Trento DOC \"601\" Dosaggio Zero – Cantina di Trento": {
    foto: "vini/601zero.webp",
    it: {
      zona: "Colline di Trento, Trentino",
      vitigno: "Chardonnay",
      descrizione: "Trento DOC Dosaggio Zero Metodo Classico dal colore giallo paglierino intenso e dal perlage fine e persistente. Al naso esprime eleganti note di lievito e sfumature minerali. Al palato è fresco, asciutto e strutturato, con una piacevole cremosità e un finale lungo e persistente. Ideale come aperitivo."
    },
    en: {
      zona: "Trento hills, Trentino",
      vitigno: "Chardonnay",
      descrizione: "A Trento DOC Zero Dosage Metodo Classico with an intense straw yellow colour and a fine, persistent perlage. On the nose it shows elegant yeasty notes and mineral nuances. On the palate it is fresh, dry and structured, with pleasant creaminess and a long, persistent finish. Ideal as an aperitif."
    }
  },
  "Verdicchio Metodo Classico Extra Brut 2025 – Umani Ronchi": {
    foto: "vini/verdicchioumanironchi.webp",
    it: {
      zona: "Castelli di Jesi (AN), Marche",
      vitigno: "Verdicchio e Chardonnay",
      descrizione: "Spumante dal colore giallo paglierino brillante, con perlage fine e persistente. Al naso offre eleganti note floreali e fruttate, con sentori di bergamotto, mandarino e pane appena sfornato. Al palato è cremoso e fresco, con una piacevole sapidità e un finale agrumato e persistente, ideale con pesce, crostacei e frutti di mare."
    },
    en: {
      zona: "Castelli di Jesi (AN), Marche",
      vitigno: "Verdicchio and Chardonnay",
      descrizione: "A sparkling wine with a bright straw yellow colour and a fine, persistent perlage. On the nose it offers elegant floral and fruity notes, with hints of bergamot, mandarin and freshly baked bread. On the palate it is creamy and fresh, with pleasant savouriness and a persistent citrus finish, ideal with fish, crustaceans and shellfish."
    }
  },

  /* --- I Bianchi --- */
  "Custoza DOC 2022 – Menegotti": {
    foto: "vini/custoza.webp",
    it: {
      zona: "Custoza, Villafranca di Verona (VR), Veneto",
      vitigno: "Fernanda 45% Garganega 40%, Trebbiano 10%, Tocai Friulano 5%",
      descrizione: "Custoza DOC dal colore giallo paglierino, con profumi fruttati intensi e leggermente aromatici. Al palato è sapido, delicato e armonioso, con un buon equilibrio e una piacevole rotondità. Ideale come aperitivo, con antipasti, piatti di pesce e carni bianche."
    },
    en: {
      zona: "Custoza, Villafranca di Verona (VR), Veneto",
      vitigno: "Fernanda 45%, Garganega 40%, Trebbiano 10%, Tocai Friulano 5%",
      descrizione: "A Custoza DOC with a straw yellow colour, intense, slightly aromatic fruity aromas. On the palate it is savoury, delicate and harmonious, with good balance and a pleasant roundness. Ideal as an aperitif, with starters, fish dishes and white meats."
    }
  },
  "Irpinia Falanghina DOC 2024 – Luciano Ercolino": {
    foto: "vini/irpinia.webp",
    it: {
      zona: "Irpinia (AV), Campania",
      vitigno: "Falanghina",
      descrizione: "Vino dal colore giallo paglierino luminoso, con profumi agrumati di lime, pompelmo e kiwi accompagnati da delicate note floreali di gelsomino. Al palato è fresco e minerale, con una piacevole acidità e una buona persistenza che ne valorizza l'eleganza."
    },
    en: {
      zona: "Irpinia (AV), Campania",
      vitigno: "Falanghina",
      descrizione: "A wine with a bright straw yellow colour, with citrusy aromas of lime, grapefruit and kiwi accompanied by delicate floral notes of jasmine. On the palate it is fresh and mineral, with pleasant acidity and good length that enhances its elegance."
    }
  },
  "Tamanis Friuli DOC Aquileia – Ca' Bolani": {
    foto: "vini/tamanis-bianco.webp",
    it: {
      zona: "Cervignano del Friuli (UD), Friuli-Venezia Giulia",
      vitigno: "Friulano, Pinot Bianco, Malvasia, Sauvignon",
      descrizione: "Vino dal colore dorato brillante e intenso, caratterizzato da un profilo aromatico complesso e territoriale. Al naso esprime note fruttate fresche e raffinate, mentre al palato è morbido, fresco e armonioso, con un finale ampio, aromatico e persistente."
    },
    en: {
      zona: "Cervignano del Friuli (UD), Friuli-Venezia Giulia",
      vitigno: "Friulano, Pinot Bianco, Malvasia, Sauvignon",
      descrizione: "A wine with a bright, intense golden colour, characterised by a complex, territory-driven aromatic profile. On the nose it shows fresh, refined fruity notes, while on the palate it is soft, fresh and harmonious, with a broad, aromatic, persistent finish."
    }
  },
  "Passerina 2025 – Umani Ronchi": {
    foto: "vini/passerina.webp",
    it: {
      zona: "Osimo (AN), Marche",
      vitigno: "Passerina",
      descrizione: "Vino dal colore giallo paglierino luminoso con lievi riflessi dorati. Al naso offre eleganti profumi di fiori selvatici e frutta a polpa gialla, con note di pesca, albicocca e mela Golden. Al palato è fresco e sapido, con buona struttura e un finale armonioso ed elegante."
    },
    en: {
      zona: "Osimo (AN), Marche",
      vitigno: "Passerina",
      descrizione: "A wine with a bright straw yellow colour with slight golden highlights. On the nose it offers elegant aromas of wildflowers and yellow-fleshed fruit, with notes of peach, apricot and Golden apple. On the palate it is fresh and savoury, with good structure and a harmonious, elegant finish."
    }
  },
  "Pecorino 2025 – Umani Ronchi": {
    foto: "vini/pecorino.webp",
    it: {
      zona: "Abruzzo",
      vitigno: "Pecorino",
      descrizione: "Vino dal colore giallo paglierino intenso, con profumi freschi di mela verde, nespola, fiori bianchi e delicate note balsamiche. Al palato è fresco e sapido, con una piacevole struttura e un finale armonioso. Ideale con antipasti di pesce, crudità e primi piatti di mare."
    },
    en: {
      zona: "Abruzzo",
      vitigno: "Pecorino",
      descrizione: "A wine with an intense straw yellow colour, with fresh aromas of green apple, loquat, white flowers and delicate balsamic notes. On the palate it is fresh and savoury, with a pleasant structure and a harmonious finish. Ideal with fish starters, raw fish and seafood pasta dishes."
    }
  },
  "Fiano di Avellino DOCG 2024 – Luciano Ercolino": {
    foto: "vini/fiano.webp",
    it: {
      zona: "San Potito Ultra (AV), Campania",
      vitigno: "Fiano",
      descrizione: "Fiano di Avellino DOCG dal colore giallo paglierino intenso e luminoso. Al naso esprime profumi di pera, albicocca e citronella, con eleganti note di mandorla tostata e miele d'acacia. Al palato è morbido, aromatico e minerale, con buona struttura e persistenza. Ideale con pesce, verdure, carni bianche e sushi."
    },
    en: {
      zona: "San Potito Ultra (AV), Campania",
      vitigno: "Fiano",
      descrizione: "A Fiano di Avellino DOCG with an intense, bright straw yellow colour. On the nose it shows aromas of pear, apricot and lemongrass, with elegant notes of toasted almond and acacia honey. On the palate it is soft, aromatic and mineral, with good structure and length. Ideal with fish, vegetables, white meats and sushi."
    }
  },

  /* --- I Rosati --- */
  "Trento DOC Brut Rosé - Cantina di Trento": {
    foto: "vini/601rose.webp",
    it: {
      zona: "Colline di Trento, Trentino",
      vitigno: "Pinot Nero",
      descrizione: "Trento DOC Rosé Metodo Classico dal delicato colore rosa tenue e dal perlage fine e persistente. Al naso offre fresche note fruttate e floreali, arricchite da un leggero sentore di lievito. Al palato è elegante, fresco e ben strutturato, con una piacevole vena minerale, ideale come aperitivo o in abbinamento a piatti delicati."
    },
    en: {
      zona: "Trento hills, Trentino",
      vitigno: "Pinot Noir",
      descrizione: "A Trento DOC Rosé Metodo Classico with a delicate pale pink colour and a fine, persistent perlage. On the nose it offers fresh fruity and floral notes, enriched by a light yeasty hint. On the palate it is elegant, fresh and well structured, with a pleasant mineral streak, ideal as an aperitif or paired with delicate dishes."
    }
  },
  "Rosé Extra Brut - Ca' dei Frati": {
    foto: "vini/rosecadeifrati.webp",
    it: {
      zona: "Lugana, Sirmione (BS), Lombardia",
      vitigno: "Barbera, Marzemino, Groppello, Sangiovese",
      descrizione: "Metodo Classico Rosé dal colore rosa pallido, brillante e luminoso, con perlage fine e persistente. Al naso esprime freschi profumi di frutti rossi e delicate note di rosa, accompagnati da eleganti sentori di lievito. Al palato è raffinato, fresco e armonioso, ideale come aperitivo o in abbinamento a piatti di pesce."
    },
    en: {
      zona: "Lugana, Sirmione (BS), Lombardy",
      vitigno: "Barbera, Marzemino, Groppello, Sangiovese",
      descrizione: "A Metodo Classico Rosé with a pale, bright, luminous pink colour and a fine, persistent perlage. On the nose it shows fresh aromas of red berries and delicate rose notes, accompanied by elegant yeasty hints. On the palate it is refined, fresh and harmonious, ideal as an aperitif or paired with fish dishes."
    }
  },
  "Prope Cerasuolo d'Abruzzo - Velenosi": {
    foto: "vini/prope.webp",
    it: {
      zona: "Controguerra (TE), Abruzzo",
      vitigno: "Montepulciano",
      descrizione: "Vino dal colore rosa brillante e acceso. Al naso esprime eleganti note floreali di rosa e viola, accompagnate da sentori di piccoli frutti rossi come ribes e lampone. Al palato è sapido e avvolgente, con buona struttura e persistenza, caratterizzato da delicate sfumature floreali e fruttate."
    },
    en: {
      zona: "Controguerra (TE), Abruzzo",
      vitigno: "Montepulciano",
      descrizione: "A wine with a bright, vivid pink colour. On the nose it shows elegant floral notes of rose and violet, accompanied by hints of small red berries such as redcurrant and raspberry. On the palate it is savoury and enveloping, with good structure and length, characterised by delicate floral and fruity nuances."
    }
  },
  "Sollevante Spumante Brut - Tenuta La Commenda": {
    foto: "vini/sollevante.webp",
    it: {
      zona: "Rio Saliceto (RE), Emilia-Romagna",
      vitigno: "Lambrusco di Sorbara",
      descrizione: "Spumante dal colore rosa fiore di pesco brillante, con perlage fine, persistente e setoso. Al naso esprime eleganti note floreali di rosa e freschi sentori fruttati di fragola, lampone e pompelmo. Al palato è fresco, sapido e persistente, con una piacevole acidità, ideale come aperitivo e in abbinamento a piatti delicati di pesce, carni bianche, salumi e pizza."
    },
    en: {
      zona: "Rio Saliceto (RE), Emilia-Romagna",
      vitigno: "Lambrusco di Sorbara",
      descrizione: "A sparkling wine with a bright peach-blossom pink colour, and a fine, persistent, silky perlage. On the nose it shows elegant floral notes of rose and fresh fruity hints of strawberry, raspberry and grapefruit. On the palate it is fresh, savoury and persistent, with pleasant acidity, ideal as an aperitif and paired with delicate fish dishes, white meats, cured meats and pizza."
    }
  },
  "Morena Metodo Classico - Cantina Reale": {
    foto: "vini/morena.webp",
    it: {
      zona: "Abruzzo",
      vitigno: "Pinot Nero",
      descrizione: "Elegante spumante rosato dal perlage fine, con profumi di frutti rossi e gusto sapido e armonioso, affinato 24 mesi in bottiglia. Perfetto come aperitivo e in abbinamento a salumi, pesce e carni bianche."
    },
    en: {
      zona: "Abruzzo",
      vitigno: "Pinot Noir",
      descrizione: "An elegant rosé sparkling wine with a fine perlage, aromas of red berries and a savoury, harmonious taste, aged 24 months in bottle. Perfect as an aperitif and paired with cured meats, fish and white meats."
    }
  },
  "Chiaretto di Bardolino Rosé - Menegotti": {
    foto: "vini/chiaretto.webp",
    it: {
      zona: "Bardolino (VR), Veneto",
      vitigno: "Corvina, Rondinella, Molinara, Sangiovese",
      descrizione: "Rosato fresco ed elegante dal colore rosa brillante, con profumi delicati di fiori e piccoli frutti rossi. Al palato è sapido, armonico e caratterizzato da una piacevole freschezza."
    },
    en: {
      zona: "Bardolino (VR), Veneto",
      vitigno: "Corvina, Rondinella, Molinara, Sangiovese",
      descrizione: "A fresh, elegant rosé with a bright pink colour, with delicate aromas of flowers and small red berries. On the palate it is savoury, harmonious and characterised by pleasant freshness."
    }
  },

  /* --- I Rossi --- */
  "Montepulciano d'Abruzzo 0,375 - Vigna Corvino": {
    foto: "vini/monte375.webp",
    it: {
      zona: "Collecorvino (PE), Abruzzo",
      vitigno: "Montepulciano",
      descrizione: "Vino rosso dal colore rubino intenso con riflessi violacei, profumi di frutta rossa e gusto morbido, fresco ed equilibrato, con una buona persistenza."
    },
    en: {
      zona: "Collecorvino (PE), Abruzzo",
      vitigno: "Montepulciano",
      descrizione: "A red wine with an intense ruby colour and violet highlights, aromas of red fruit and a soft, fresh, balanced taste, with good length."
    }
  },
  "Ninfa 2022 - Velenosi": {
    foto: "vini/ninfa.webp",
    it: {
      zona: "Offida e Castel di Lama (AP), Marche",
      vitigno: "Montepulciano, Cabernet Sauvignon, Merlot e Syrah",
      descrizione: "Rosso intenso e strutturato, affinato in legno, con profumi di frutti scuri, liquirizia, pepe e tabacco. Al palato è morbido, elegante e persistente, con tannini fini e ben integrati."
    },
    en: {
      zona: "Offida and Castel di Lama (AP), Marche",
      vitigno: "Montepulciano, Cabernet Sauvignon, Merlot and Syrah",
      descrizione: "An intense, structured red, aged in wood, with aromas of dark fruit, liquorice, pepper and tobacco. On the palate it is soft, elegant and persistent, with fine, well-integrated tannins."
    }
  },
  "Tamanis Friuli DOC 2020 - Ca' Bolani": {
    foto: "vini/tamanisrosso.webp",
    it: {
      zona: "Aquileia (UD), Friuli-Venezia Giulia",
      vitigno: "Refosco, Merlot e Cabernet",
      descrizione: "Rosso intenso dai riflessi violacei, con profumi fruttati e note speziate di legno ben integrate. Al palato è fresco, morbido e strutturato, con buona persistenza e carattere territoriale."
    },
    en: {
      zona: "Aquileia (UD), Friuli-Venezia Giulia",
      vitigno: "Refosco, Merlot and Cabernet",
      descrizione: "An intense red with violet highlights, with fruity aromas and well-integrated spicy oak notes. On the palate it is fresh, soft and structured, with good length and a strong sense of place."
    }
  },
  "Roggio del Filare 2020 - Velenosi": {
    foto: "vini/roggio.webp",
    it: {
      zona: "Castorano (AP), Marche",
      vitigno: "Montepulciano e Sangiovese",
      descrizione: "Rosso di grande struttura e complessità, dal colore rubino intenso con profumi di frutti rossi maturi, spezie e note balsamiche. Al palato è morbido, elegante e persistente, con tannini ben integrati e lunga evoluzione."
    },
    en: {
      zona: "Castorano (AP), Marche",
      vitigno: "Montepulciano and Sangiovese",
      descrizione: "A red of great structure and complexity, with an intense ruby colour and aromas of ripe red fruit, spices and balsamic notes. On the palate it is soft, elegant and persistent, with well-integrated tannins and great ageing potential."
    }
  },
  "Caeles Nero d'Avola 2023 - Firriato": {
    foto: "vini/caeles.webp",
    it: {
      zona: "Agro di Trapani (TP), Sicilia",
      vitigno: "Nero d'Avola",
      descrizione: "Rosso siciliano dal colore rubino intenso, con profumi di frutti rossi maturi, spezie e note mediterranee. Al palato è morbido, equilibrato e persistente, con tannini vellutati e piacevole freschezza."
    },
    en: {
      zona: "Trapani countryside (TP), Sicily",
      vitigno: "Nero d'Avola",
      descrizione: "A Sicilian red with an intense ruby colour, with aromas of ripe red fruit, spices and Mediterranean notes. On the palate it is soft, balanced and persistent, with velvety tannins and pleasant freshness."
    }
  },
  "Mezzacosta Rosso Veronese 2019 - Menegotti": {
    foto: "vini/mezzacosta.webp",
    it: {
      zona: "Villafranca di Verona (VR), Veneto",
      vitigno: "Merlot, Cabernet",
      descrizione: "Rosso elegante e strutturato dal colore rubino intenso, con profumi di frutti rossi maturi, spezie e leggere note balsamiche. Al palato è morbido, armonico e persistente, con tannini equilibrati."
    },
    en: {
      zona: "Villafranca di Verona (VR), Veneto",
      vitigno: "Merlot, Cabernet",
      descrizione: "An elegant, structured red with an intense ruby colour, with aromas of ripe red fruit, spices and light balsamic notes. On the palate it is soft, harmonious and persistent, with balanced tannins."
    }
  },
  "Solestà Rosso Piceno Superiore 2022 - Velenosi": {
    foto: "vini/solestà.webp",
    it: {
      zona: "Ascoli Piceno, Marche",
      vitigno: "Montepulciano e Sangiovese",
      descrizione: "Rosso strutturato dal colore rubino intenso, con profumi di frutti rossi maturi, spezie e note balsamiche. Al palato è morbido, equilibrato e persistente, con tannini eleganti e buona freschezza."
    },
    en: {
      zona: "Ascoli Piceno, Marche",
      vitigno: "Montepulciano and Sangiovese",
      descrizione: "A structured red with an intense ruby colour, with aromas of ripe red fruit, spices and balsamic notes. On the palate it is soft, balanced and persistent, with elegant tannins and good freshness."
    }
  },
  "Querciantica Lacrima di Morro d'Alba DOC Superiore - Velenosi": {
    foto: "vini/morro.webp",
    it: {
      zona: "Morro d'Alba (AN), Marche",
      vitigno: "Lacrima",
      descrizione: "Rosso aromatico dal colore rubino intenso, caratterizzato da profumi floreali di rosa e violetta, con note di frutti rossi. Al palato è morbido, fresco e armonioso, con un finale elegante e persistente."
    },
    en: {
      zona: "Morro d'Alba (AN), Marche",
      vitigno: "Lacrima",
      descrizione: "An aromatic red with an intense ruby colour, characterised by floral aromas of rose and violet, with notes of red fruit. On the palate it is soft, fresh and harmonious, with an elegant, persistent finish."
    }
  },
  "Südtirol Blauburgunder 2024 - Muri-Gries": {
    foto: "vini/südtirol.webp",
    it: {
      zona: "Bolzano, Alto Adige",
      vitigno: "Pinot Nero",
      descrizione: "Rosso elegante dal colore rubino brillante, con profumi di piccoli frutti rossi, note speziate e sentori delicati di sottobosco. Al palato è fresco, fine e armonioso, con tannini vellutati e buona persistenza."
    },
    en: {
      zona: "Bolzano, South Tyrol",
      vitigno: "Pinot Noir",
      descrizione: "An elegant red with a bright ruby colour, with aromas of small red berries, spicy notes and delicate hints of undergrowth. On the palate it is fresh, fine and harmonious, with velvety tannins and good length."
    }
  },
  "Guiry Sangiovese 2022 - Tenuta Biodinamica Mara": {
    foto: "vini/guiry.webp",
    it: {
      zona: "San Clemente (RN), Emilia-Romagna",
      vitigno: "Sangiovese",
      descrizione: "Rosso biologico e biodinamico dal colore rubino brillante, con profumi di ciliegia, frutti rossi e note speziate. Al palato è fresco, equilibrato e armonioso, con tannini morbidi e piacevole persistenza."
    },
    en: {
      zona: "San Clemente (RN), Emilia-Romagna",
      vitigno: "Sangiovese",
      descrizione: "An organic, biodynamic red with a bright ruby colour, with aromas of cherry, red fruit and spicy notes. On the palate it is fresh, balanced and harmonious, with soft tannins and pleasant length."
    }
  },
  "Amarone della Valpolicella 2021 - Bertani": {
    foto: "vini/amarone.webp",
    it: {
      zona: "Valpolicella (VR), Veneto",
      vitigno: "Corvina Veronese e Rondinella",
      descrizione: "Grande rosso da appassimento dal colore rubino intenso, con profumi complessi di frutta rossa matura, spezie, cacao e note balsamiche. Al palato è ricco, elegante e strutturato, con tannini raffinati e lunga persistenza."
    },
    en: {
      zona: "Valpolicella (VR), Veneto",
      vitigno: "Corvina Veronese and Rondinella",
      descrizione: "A great appassimento red with an intense ruby colour, with complex aromas of ripe red fruit, spices, cocoa and balsamic notes. On the palate it is rich, elegant and structured, with refined tannins and a long finish."
    }
  },
  "Brunello di Montalcino 2019 - Val di Suga": {
    foto: "vini/brunello.webp",
    it: {
      zona: "Montalcino (SI), Toscana",
      vitigno: "Sangiovese (Sangiovese Grosso)",
      descrizione: "Rosso di grande eleganza e struttura, dal colore rubino intenso con profumi di ciliegia, frutti di bosco, spezie e note balsamiche. Al palato è armonioso, complesso e persistente, con tannini raffinati e lunga capacità evolutiva."
    },
    en: {
      zona: "Montalcino (SI), Tuscany",
      vitigno: "Sangiovese (Sangiovese Grosso)",
      descrizione: "A red of great elegance and structure, with an intense ruby colour and aromas of cherry, wild berries, spices and balsamic notes. On the palate it is harmonious, complex and persistent, with refined tannins and great ageing potential."
    }
  },
  "Salterio Rosso di Montepulciano DOC 2024 - Tenuta Trerose": {
    foto: "vini/montepulciano.webp",
    it: {
      zona: "Montepulciano (SI), Toscana",
      vitigno: "Prugnolo Gentile (Sangiovese)",
      descrizione: "Rosso toscano fresco e fragrante dal colore rubino brillante, con profumi di ciliegia, frutti rossi e leggere note speziate. Al palato è equilibrato, morbido e piacevolmente persistente, con tannini delicati."
    },
    en: {
      zona: "Montepulciano (SI), Tuscany",
      vitigno: "Prugnolo Gentile (Sangiovese)",
      descrizione: "A fresh, fragrant Tuscan red with a bright ruby colour, with aromas of cherry, red fruit and light spicy notes. On the palate it is balanced, soft and pleasantly persistent, with delicate tannins."
    }
  },
  "Ludi Offida DOCG 2019 - Velenosi": {
    foto: "vini/offida.webp",
    it: {
      zona: "Offida (AP), Marche",
      vitigno: "Montepulciano, Cabernet Sauvignon e Merlot",
      descrizione: "Rosso intenso e strutturato dal colore rubino profondo, con profumi complessi di frutti rossi maturi, spezie, tabacco e note balsamiche. Al palato è elegante, morbido e persistente, con tannini ben integrati e grande equilibrio."
    },
    en: {
      zona: "Offida (AP), Marche",
      vitigno: "Montepulciano, Cabernet Sauvignon and Merlot",
      descrizione: "An intense, structured red with a deep ruby colour, with complex aromas of ripe red fruit, spices, tobacco and balsamic notes. On the palate it is elegant, soft and persistent, with well-integrated tannins and great balance."
    }
  },
  "Verso Sera Montepulciano d'Abruzzo DOCG 2021 - Velenosi": {
    foto: "vini/versosera.webp",
    it: {
      zona: "Colline teramane (TE), Abruzzo",
      vitigno: "Montepulciano",
      descrizione: "Rosso dal colore rubino intenso, con profumi di ciliegia, frutti di bosco e delicate note speziate. Al palato è morbido, equilibrato e persistente, con tannini vellutati e una piacevole freschezza."
    },
    en: {
      zona: "Teramo hills (TE), Abruzzo",
      vitigno: "Montepulciano",
      descrizione: "A red with an intense ruby colour, with aromas of cherry, wild berries and delicate spicy notes. On the palate it is soft, balanced and persistent, with velvety tannins and pleasant freshness."
    }
  },

  /* --- I Lambruschi --- */
  "Lambrusco Grasparossa di Castelvetro DOC Amabile - Gavioli": {
    foto: "vini/grasparossa.webp",
    it: {
      zona: "Castelvetro di Modena (MO), Emilia-Romagna",
      vitigno: "Lambrusco Grasparossa",
      descrizione: "Spumante rosso amabile dal colore rubino intenso con riflessi violacei, caratterizzato da profumi di frutti rossi e note floreali. Al palato è vivace, fresco e leggermente dolce, con una piacevole effervescenza."
    },
    en: {
      zona: "Castelvetro di Modena (MO), Emilia-Romagna",
      vitigno: "Lambrusco Grasparossa",
      descrizione: "A semi-sweet sparkling red with an intense ruby colour and violet highlights, characterised by aromas of red fruit and floral notes. On the palate it is lively, fresh and lightly sweet, with pleasant effervescence."
    }
  },
  "Lambrusco Concerto 1,5 L - Medici Ermete": {
    foto: "vini/concerto.webp",
    it: {
      zona: "Reggio Emilia, Emilia-Romagna",
      vitigno: "Lambrusco Salamino",
      descrizione: "Lambrusco rosso secco dal colore rubino intenso, con profumi di ciliegia, frutti di bosco e note floreali. Al palato è fresco, armonico e fragrante, con una vivace effervescenza e una piacevole persistenza."
    },
    en: {
      zona: "Reggio Emilia, Emilia-Romagna",
      vitigno: "Lambrusco Salamino",
      descrizione: "A dry red Lambrusco with an intense ruby colour, with aromas of cherry, wild berries and floral notes. On the palate it is fresh, harmonious and fragrant, with lively effervescence and pleasant length."
    }
  },
  "Lambrusco La Villetta DOP - Corte Villetta": {
    foto: "vini/lavilletta.webp",
    it: {
      zona: "Dosolo (MN), Lomardia",
      vitigno: "Lambrusco",
      descrizione: "Lambrusco frizzante dal colore rosso rubino con riflessi violacei, caratterizzato da profumi di frutti rossi e note floreali. Al palato è fresco, vivace e armonico, con una piacevole effervescenza e morbidezza."
    },
    en: {
      zona: "Dosolo (MN), Lombardy",
      vitigno: "Lambrusco",
      descrizione: "A semi-sparkling Lambrusco with a ruby red colour and violet highlights, characterised by aromas of red fruit and floral notes. On the palate it is fresh, lively and harmonious, with pleasant effervescence and softness."
    }
  },
  "Galpedar Lambrusco - Lebovitz": {
    foto: "vini/galpedar.webp",
    it: {
      zona: "Governolo (MN), Lombardia",
      vitigno: "Ruberti",
      descrizione: "Lambrusco frizzante dal colore rosso rubino intenso, con profumi di piccoli frutti rossi e note floreali. Al palato è fresco, vivace e armonico, con una piacevole effervescenza e un gusto morbido e fragrante."
    },
    en: {
      zona: "Governolo (MN), Lombardy",
      vitigno: "Ruberti",
      descrizione: "A semi-sparkling Lambrusco with an intense ruby red colour, with aromas of small red berries and floral notes. On the palate it is fresh, lively and harmonious, with pleasant effervescence and a soft, fragrant taste."
    }
  },
  "Il Ligabue Lambrusco DOP - Cantina Gualtieri": {
    foto: "vini/ligabue.webp",
    it: {
      zona: "Gualtieri (RE), Emilia-Romagna",
      vitigno: "Lambrusco Salamino e Lambrusco Maestri",
      descrizione: "Lambrusco dal colore rosso rubino intenso con spuma vivace, caratterizzato da profumi di frutti rossi e viola. Al palato è fresco, equilibrato e piacevolmente fruttato, con una vivace effervescenza e un finale armonioso."
    },
    en: {
      zona: "Gualtieri (RE), Emilia-Romagna",
      vitigno: "Lambrusco Salamino and Lambrusco Maestri",
      descrizione: "A Lambrusco with an intense ruby red colour and lively foam, characterised by aromas of red fruit and violet. On the palate it is fresh, balanced and pleasantly fruity, with lively effervescence and a harmonious finish."
    }
  },
  "Si Fosse Foco Lambrusco Biologico Scuro - Pacchioni": {
    foto: "vini/sifossefoco.webp",
    it: {
      zona: "Pegognaga (MN), Lombardia",
      vitigno: "Lambrusco Ruberti, Lambrusco Salamino, Ancellotta",
      descrizione: "Lambrusco mantovano biologico dal colore rosso rubino intenso, con profumi fruttati e gusto pieno, equilibrato e corposo. Frizzante e strutturato, esprime al meglio la tradizione del territorio con abbinamenti a salumi, primi piatti e carni alla griglia."
    },
    en: {
      zona: "Pegognaga (MN), Lombardy",
      vitigno: "Lambrusco Ruberti, Lambrusco Salamino, Ancellotta",
      descrizione: "An organic Lambrusco from the Mantua area with an intense ruby red colour, with fruity aromas and a full, balanced, full-bodied taste. Semi-sparkling and structured, it best expresses the local tradition, pairing well with cured meats, first courses and grilled meats."
    }
  },
  "Bucciamara - Cantina Gualtieri": {
    foto: "vini/bucciamara.webp",
    it: {
      zona: "Gualtieri (RE), Emilia-Romagna",
      vitigno: "Lambrusco Salamino, Lambrusco Maestri e Ancellotta",
      descrizione: "Lambrusco frizzante dal colore rosso rubino intenso con riflessi porpora, caratterizzato da profumi vinosi e sentori di piccoli frutti rossi. Al palato è pieno, corposo e armonico, con una piacevole freschezza e tannini equilibrati."
    },
    en: {
      zona: "Gualtieri (RE), Emilia-Romagna",
      vitigno: "Lambrusco Salamino, Lambrusco Maestri and Ancellotta",
      descrizione: "A semi-sparkling Lambrusco with an intense ruby red colour and purple highlights, characterised by vinous aromas and hints of small red berries. On the palate it is full, full-bodied and harmonious, with pleasant freshness and balanced tannins."
    }
  },
  "Bollerosse Lambrusco Reggiano Frizzante DOP - Podere Francesco": {
    foto: "vini/podere.webp",
    it: {
      zona: "Novellara (RE), Emilia-Romagna",
      vitigno: "Lambrusco Salamino e Ancellotta",
      descrizione: "Lambrusco frizzante dal colore rosso rubino intenso, con profumi freschi di frutti rossi e note floreali. Al palato è vivace, equilibrato e armonico, con una piacevole effervescenza e un finale fruttato."
    },
    en: {
      zona: "Novellara (RE), Emilia-Romagna",
      vitigno: "Lambrusco Salamino and Ancellotta",
      descrizione: "A semi-sparkling Lambrusco with an intense ruby red colour, with fresh aromas of red fruit and floral notes. On the palate it is lively, balanced and harmonious, with pleasant effervescence and a fruity finish."
    }
  },
  "Confini Lambrusco di Sermide - Confini del Vino": {
    foto: "vini/confini.webp",
    it: {
      zona: "Sermide (MN), Lombardia",
      vitigno: "Lambrusco Salamino e Ancellotta",
      descrizione: "Lambrusco mantovano frizzante dal colore rosso rubino intenso, con profumi di frutti rossi e note vinose. Al palato è fresco, vivace e armonico, con una piacevole effervescenza e un carattere tipico della tradizione dell'Oltrepò Mantovano."
    },
    en: {
      zona: "Sermide (MN), Lombardy",
      vitigno: "Lambrusco Salamino and Ancellotta",
      descrizione: "A semi-sparkling Lambrusco from the Mantua area with an intense ruby red colour, with aromas of red fruit and vinous notes. On the palate it is fresh, lively and harmonious, with pleasant effervescence and a character typical of the Oltrepò Mantovano tradition."
    }
  }
};

/* Alcuni vini hanno un nome leggermente diverso nella versione inglese del menu
   (es. "Metodo Classico" -> "Classic Method"). Questi alias fanno sì che la
   scheda tecnica si apra correttamente anche per chi naviga in inglese,
   puntando alla stessa scheda già compilata sopra (che ora contiene testi
   sia in italiano che in inglese). */
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

/* ---------- SCHEDA TECNICA BIRRA ----------
   Stessa logica della scheda vino, ma con campi adatti alla birra:
   - "foto" (facoltativa, nome/percorso immagine bottiglia/etichetta)
   - "birrificio" (produttore) e "stile" al posto di zona/vitigno
   - "descrizione", in italiano e inglese
   I campi birrificio non sono ancora compilati (mostrano "Da scrivere" /
   "To be written"): basta aggiungere il testo qui sotto quando disponibile,
   la scheda si aggiorna automaticamente. */
const schedeBirre = {
  "Guglielmo – Hell Non Filtrata": {
    it: {
      birrificio: "",
      stile: "Hell non filtrata (lager chiara)",
      descrizione: "Birra artigianale non filtrata in stile Hell: colore dorato con leggera velatura, aromi maltati e delicatamente floreali. Al palato è morbida, beverina e con un finale pulito, ideale come aperitivo o in abbinamento a piatti leggeri."
    },
    en: {
      birrificio: "",
      stile: "Unfiltered Hell (pale lager)",
      descrizione: "An unfiltered craft beer in the Hell style: golden colour with a light haze, malty and delicately floral aromas. On the palate it is soft and easy-drinking, with a clean finish — ideal as an aperitif or paired with lighter dishes."
    }
  },
  "Cordelia – IPA Non Filtrata": {
    it: {
      birrificio: "",
      stile: "IPA non filtrata",
      descrizione: "Birra artigianale non filtrata in stile IPA, dal colore ambrato e dal profilo aromatico intenso, con note di luppolo agrumate e resinose. Al palato è decisa, amaricante e persistente, perfetta con piatti saporiti e speziati."
    },
    en: {
      birrificio: "",
      stile: "Unfiltered IPA",
      descrizione: "An unfiltered craft IPA with an amber colour and an intense aromatic profile, showing citrusy, resinous hop notes. On the palate it is bold, bitter and persistent — perfect with flavourful, spiced dishes."
    }
  },
  "Amleto – Bock Non Filtrata": {
    it: {
      birrificio: "",
      stile: "Bock non filtrata",
      descrizione: "Birra artigianale non filtrata in stile Bock, dal colore ambrato intenso e dal corpo pieno, con note maltate di caramello e pane tostato. Al palato è avvolgente e leggermente dolce, ideale in abbinamento a carni alla griglia e piatti robusti."
    },
    en: {
      birrificio: "",
      stile: "Unfiltered Bock",
      descrizione: "An unfiltered craft Bock with a deep amber colour and a full body, showing malty notes of caramel and toasted bread. On the palate it is warming and lightly sweet — ideal paired with grilled meats and hearty dishes."
    }
  }
};

/* Alias per i nomi birra nella versione inglese del menu (stesso meccanismo
   usato per i vini), così la scheda tecnica si apre correttamente anche
   navigando in inglese. */
const aliasSchedeBirre = {
  "Guglielmo – Unfiltered Hell Lager": "Guglielmo – Hell Non Filtrata",
  "Cordelia – Unfiltered IPA": "Cordelia – IPA Non Filtrata",
  "Amleto – Unfiltered Bock": "Amleto – Bock Non Filtrata"
};
Object.keys(aliasSchedeBirre).forEach(nomeEN => {
  const nomeIT = aliasSchedeBirre[nomeEN];
  if (schedeBirre[nomeIT]) schedeBirre[nomeEN] = schedeBirre[nomeIT];
});
