'use strict';
/* =========================================================
   Trattoria da Franca — Menu digitale
   FILE 4/5: DATI FOTO — quali immagini mostrare in ogni sezione.
   "imgs": array di file immagine (1 = statica, 2+ = carosello
   automatico/scorrevole). "didascalie": testo IT/EN sotto la foto.
   Le immagini vanno caricate nella stessa cartella del sito
   (o aggiornare il percorso qui). Per il testo del menu vedi
   dati-menu.js. Per la logica vedi app.js.
   ========================================================= */

/* ---------- MAPPA IMMAGINI STORYTELLING ----------
   Chiavi ricercate nel titolo della sezione (case-insensitive).
   "imgs" è un array: 1 immagine = statica, 2+ = carosello scorrevole/automatico.
   L'ordine conta: le regole più specifiche (brace/griglia) vanno prima di quelle generiche (secondi). */
const immaginiSezioni = [
  { id:"antipasti", chiavi:["antipast","starter"], imgs:["antipasti.webp","antipasti-2.webp","antipasti-3.webp"],
    didascalie:[
      {it:"Taglieri della tradizione", en:"Traditional charcuterie boards"},
      {it:"Sapori da condividere", en:"Flavours to share"},
      {it:"Il benvenuto della casa", en:"The house welcome"}
    ] },
  { id:"primi", chiavi:["prim","first course","risotto"], imgs:["primi.webp","primi-2.webp","primi-3.webp"],
    didascalie:[
      {it:"Pasta fresca fatta in casa",  en:"Homemade fresh pasta"},
      {it:"Sfoglia tirata a mano", en:"Hand-rolled pasta sheet"},
      {it:"Il primo che aspettavi", en:"The first course you were waiting for"}
    ] },
  { id:"secondi-brace", chiavi:["brace","griglia","grill"], imgs:["brace.webp","brace-2.webp","brace-3.webp"],
    didascalie:[
      {it:"Dalla brace, come una volta", en:"From the grill, as it once was"},
      {it:"Il fuoco vivo della griglia", en:"The live fire of the grill"},
      {it:"Carni scelte alla brace", en:"Selected grilled meats"}
    ] },
  { id:"secondi", chiavi:["secondi","main course"], imgs:["secondi.webp","secondi-2.webp","secondi-3.webp"],
    didascalie:[
      {it:"Il cuore del pasto", en:"The heart of the meal"},
      {it:"Cotture lente, sapori pieni", en:"Slow cooking, full flavour"},
      {it:"Piatti della tradizione", en:"Traditional dishes"}
    ] },
  { id:"contorni", chiavi:["contorni","side dish"], imgs:["contorni.webp","contorni-2.webp","contorni-3.webp"],
    didascalie:[
      {it:"I compagni ideali", en:"The perfect companions"},
      {it:"Verdure di stagione", en:"Seasonal vegetables"},
      {it:"Il tocco che completa il piatto", en:"The finishing touch"}
    ] },
  { id:"dessert", chiavi:["dessert"], imgs:["desserts.webp"],
    didascalie:[ {it:"I dolci della casa", en:"House desserts"} ] },
  { id:"vini", chiavi:["vino","wine","bollicin","bianch","rosat","rossi","lambrusc","sparkl","white wine","rosé","red wine"], imgs:["vini.jpg"],
    didascalie:[ {it:"Dalla nostra cantina", en:"From our cellar"} ] },
  { id:"birre", chiavi:["birr","beer"], imgs:["birre.jpg"],
    didascalie:[ {it:"Birre artigianali", en:"Craft beers"} ] }
];