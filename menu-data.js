/* =========================================================
   Trattoria da Franca — Menu digitale
   MENU-DATA — ponte fra Firebase Realtime Database e le
   variabili globali che app.js già sa leggere (piattiData,
   viniData, birreData, schedeVini, schedeBirre, immaginiSezioni).

   Percorso Firebase:  menu/  (separato da stats/, già esistente)

   Comportamento:
   1) Prova a leggere menu/ da Firebase.
   2) Se i dati esistono ed sono validi, li trasforma nella stessa
      forma "legacy" di dati-menu.js/dati-foto.js e SOVRASCRIVE le
      variabili globali (che per questo, in dati-menu.js e
      dati-foto.js, sono dichiarate con "var" e non "const":
      le "var" diventano proprietà di window e quindi sono
      leggibili/scrivibili anche da questo modulo).
   3) Se la lettura fallisce, non risponde o i dati non ci sono
      ancora (nessuna migrazione fatta), NON tocca nulla: restano
      attivi i dati statici già caricati da dati-menu.js/dati-foto.js.
   4) In ogni caso, al termine, nasconde lo scheletro di caricamento
      e avvia il sito pubblico chiamando window.avviaApp().

   Questo file espone anche, sotto window.MenuData, le funzioni di
   lettura/scrittura/migrazione riusate dal pannello admin
   (admin-menu.js), così la logica di trasformazione dati è scritta
   in un solo posto.
   ========================================================= */

import { initializeApp, getApps, getApp }
  from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, get, set, update, remove }
  from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const RADICE = 'menu';           // percorso radice nel Realtime Database
const GRUPPI = ['piatti','vini','birre'];

/* ---------- INIZIALIZZAZIONE FIREBASE (sicura anche se già inizializzato) ----------
   firebase-init.js inizializza già l'app di default; alcuni file (es.
   admin.js) ne chiamano una seconda copia. Per evitare l'errore
   "Firebase App named '[DEFAULT]' already exists" riusiamo l'app
   già creata, se presente. */
function ottieniApp(){
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('INSERISCI_')) return null;
  try { return getApps().length ? getApp() : initializeApp(cfg); }
  catch(e){ console.warn('[menu-data] init Firebase fallito:', e.message); return null; }
}

let _db = null;
function db(){
  if (_db) return _db;
  const app = ottieniApp();
  if (!app) return null;
  try { _db = getDatabase(app); return _db; }
  catch(e){ console.warn('[menu-data] getDatabase fallito:', e.message); return null; }
}

/* ---------- HELPER GENERICI ---------- */
function slug(testo){
  return (testo || '').toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')   // toglie accenti
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/(^-+|-+$)/g,'')
    .slice(0, 40) || 'voce';
}
/* Genera un id leggibile e univoco rispetto all'insieme "usati" (Set) */
function idUnico(base, prefisso, usati){
  const radice = prefisso + '_' + slug(base);
  let id = radice, n = 2;
  while (usati.has(id)) { id = radice + '-' + n; n++; }
  usati.add(id);
  return id;
}

/* ---------- LETTURA GREZZA DA FIREBASE ---------- */
async function leggiMenuGrezzo(){
  const database = db();
  if (!database) return null;
  const snap = await get(ref(database, RADICE));
  return snap.exists() ? snap.val() : null;
}

/* ---------- TRASFORMAZIONE: grezzo (Firebase, per-ID) → forma legacy ----------
   Ricostruisce esattamente le stesse strutture dati che dati-menu.js e
   dati-foto.js definiscono in modo statico, così app.js non ha bisogno
   di sapere da dove arrivano i dati. */
function costruisciDatiLegacy(grezzo){
  if (!grezzo || typeof grezzo !== 'object') return null;
  const sezioniDb = grezzo.sezioni || {};
  const vociDb = grezzo.voci || {};
  const gruppiDb = grezzo.gruppi || {};

  const out = {
    piattiData: { it:{titolo:'Menù', nota:(grezzo.nota&&grezzo.nota.it)||[], sezioni:[], coperto:(grezzo.coperto&&grezzo.coperto.it)||''},
                  en:{titolo:'Menu', nota:(grezzo.nota&&grezzo.nota.en)||[], sezioni:[], coperto:(grezzo.coperto&&grezzo.coperto.en)||''} },
    viniData:   { it:{titolo:'Vini', sezioni:[]}, en:{titolo:'Wines', sezioni:[]} },
    birreData:  { it:{titolo:'Birre', sezioni:[]}, en:{titolo:'Beers', sezioni:[]} },
    schedeVini: {},
    schedeBirre: {},
    immaginiSezioni: []
  };
  const datasetPerGruppo = { piatti: out.piattiData, vini: out.viniData, birre: out.birreData };

  GRUPPI.forEach(gruppo=>{
    const ordineSezioni = (gruppiDb[gruppo] && gruppiDb[gruppo].ordine) || [];
    ordineSezioni.forEach(sectionId=>{
      const sez = sezioniDb[sectionId];
      if (!sez) return;
      const titoloIt = (sez.titolo && sez.titolo.it) || '';
      const titoloEn = (sez.titolo && sez.titolo.en) || titoloIt;
      const ordineVoci = sez.ordine || [];

      ['it','en'].forEach(lingua=>{
        const sezOut = { titolo: lingua==='it' ? titoloIt : titoloEn };
        if (sez.tabella){ sezOut.tabella = true; sezOut.colonne = sez.colonne || []; }
        sezOut.items = ordineVoci.map(itemId=>{
          const voce = vociDb[itemId];
          if (!voce) return null;
          const nome = (voce.nome && voce.nome[lingua]) || (voce.nome && voce.nome.it) || '';
          if (sez.tabella) return [nome, voce.prezzi || [], itemId];
          if (gruppo === 'piatti') return [nome, voce.prezzo || '', voce.giorniNonDisponibiliPranzo || null, voce.allergeni || [], itemId];
          return [nome, voce.prezzo || '', itemId];
        }).filter(Boolean);
        datasetPerGruppo[gruppo][lingua].sezioni.push(sezOut);
      });

      /* Foto storytelling della sezione: se presenti, generiamo una voce
         "immaginiSezioni" che si aggancia SOLO a questa sezione (le
         parole chiave sono i titoli stessi della sezione, non parole
         generiche), evitando la fragilità dell'associazione per parola
         chiave generica usata nella versione statica del sito. */
      if (sez.foto && Array.isArray(sez.foto.imgs) && sez.foto.imgs.length){
        out.immaginiSezioni.push({
          id: sectionId,
          chiavi: [titoloIt.toLowerCase(), titoloEn.toLowerCase()].filter(Boolean),
          imgs: sez.foto.imgs.slice(),
          didascalie: (sez.foto.didascalie || []).map(d => ({ it:(d&&d.it)||'', en:(d&&d.en)||'' }))
        });
      }

      /* Schede tecniche vino/birra: la chiave usata da app.js è il NOME
         (in entrambe le lingue) — la ricostruiamo ad ogni caricamento a
         partire dall'id stabile, quindi rinominare una voce non rompe
         più nulla: alla prossima lettura la scheda segue il nuovo nome. */
      if (gruppo === 'vini' || gruppo === 'birre'){
        const archivio = gruppo === 'vini' ? out.schedeVini : out.schedeBirre;
        ordineVoci.forEach(itemId=>{
          const voce = vociDb[itemId];
          if (!voce || !voce.scheda) return;
          const s = voce.scheda;
          const record = { it:{}, en:{} };
          if (s.foto) record.foto = s.foto;
          if (gruppo === 'vini'){
            record.it = { zona:(s.zona&&s.zona.it)||'', vitigno:(s.vitigno&&s.vitigno.it)||'', descrizione:(s.descrizione&&s.descrizione.it)||'' };
            record.en = { zona:(s.zona&&s.zona.en)||'', vitigno:(s.vitigno&&s.vitigno.en)||'', descrizione:(s.descrizione&&s.descrizione.en)||'' };
          } else {
            record.it = { birrificio:(s.birrificio&&s.birrificio.it)||'', stile:(s.stile&&s.stile.it)||'', descrizione:(s.descrizione&&s.descrizione.it)||'' };
            record.en = { birrificio:(s.birrificio&&s.birrificio.en)||'', stile:(s.stile&&s.stile.en)||'', descrizione:(s.descrizione&&s.descrizione.en)||'' };
          }
          const nomeIt = (voce.nome && voce.nome.it) || '';
          const nomeEn = (voce.nome && voce.nome.en) || nomeIt;
          if (nomeIt) archivio[nomeIt] = record;
          if (nomeEn && nomeEn !== nomeIt) archivio[nomeEn] = record;
        });
      }
    });
  });

  return out;
}

/* Applica i dati trasformati alle variabili globali che app.js legge.
   Richiede che dati-menu.js/dati-foto.js abbiano dichiarato queste
   variabili con "var" (non "const"): solo così sono proprietà di
   window e possono essere sovrascritte da un modulo separato. */
function applicaDatiLegacy(dati){
  /* Conserva una copia dei dati statici originali (dati-menu.js /
     dati-foto.js) prima di sovrascriverli: lo strumento di migrazione
     nel pannello admin li userà come sorgente, anche se questa
     funzione viene eseguita più di una volta nella stessa sessione. */
  if (!window._menuStaticoOriginale){
    window._menuStaticoOriginale = {
      piattiData: window.piattiData, viniData: window.viniData, birreData: window.birreData,
      schedeVini: window.schedeVini, schedeBirre: window.schedeBirre,
      immaginiSezioni: window.immaginiSezioni
    };
  }
  window.piattiData = dati.piattiData;
  window.viniData = dati.viniData;
  window.birreData = dati.birreData;
  window.schedeVini = dati.schedeVini;
  window.schedeBirre = dati.schedeBirre;
  window.immaginiSezioni = dati.immaginiSezioni;
  window.MENU_ORIGINE_FIREBASE = true;
}

/* ---------- SCRITTURA (usata dal pannello admin) ---------- */
function percorsoCompleto(percorso){
  return percorso ? (RADICE + '/' + percorso) : RADICE;
}
async function scriviPercorso(percorso, valore){
  const database = db();
  if (!database) throw new Error('Firebase non disponibile');
  await set(ref(database, percorsoCompleto(percorso)), valore);
}
async function aggiornaPercorsi(patch){
  const database = db();
  if (!database) throw new Error('Firebase non disponibile');
  const patchAssoluto = {};
  Object.keys(patch).forEach(k=>{ patchAssoluto[percorsoCompleto(k)] = patch[k]; });
  await update(ref(database), patchAssoluto);
}
async function rimuoviPercorso(percorso){
  const database = db();
  if (!database) throw new Error('Firebase non disponibile');
  await remove(ref(database, percorsoCompleto(percorso)));
}

/* ---------- SKELETON DI CARICAMENTO (sito pubblico) ---------- */
function nascondiScheletro(){
  if (window._reteSicurezzaCaricamento) clearTimeout(window._reteSicurezzaCaricamento);
  const sk = document.getElementById('scheletro-caricamento');
  if (sk) sk.remove();
  document.body.classList.remove('caricamento-menu');
}

/* Se Firebase non riesce a stabilire la connessione (rete assente,
   dominio bloccato, regole non ancora pubblicate, ecc.) la promessa di
   lettura può restare in attesa a lungo invece di rifiutarsi subito:
   una corsa contro un timeout garantisce comunque una risposta rapida. */
function conTimeout(promessa, ms){
  return Promise.race([
    promessa,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout lettura menu')), ms))
  ]);
}

/* ---------- BOOTSTRAP SITO PUBBLICO ---------- */
async function avvia(){
  window.MENU_ORIGINE_FIREBASE = false;
  try {
    const grezzo = await conTimeout(leggiMenuGrezzo(), 5000);
    if (grezzo){
      const dati = costruisciDatiLegacy(grezzo);
      /* Consideriamo valido il risultato solo se contiene almeno una
         sezione da qualche parte: altrimenti meglio il fallback statico
         (es. subito dopo l'attivazione di Firebase, prima della
         migrazione manuale). */
      const haContenuti = ['piattiData','viniData','birreData'].some(k =>
        dati[k].it.sezioni.length || dati[k].en.sezioni.length);
      if (haContenuti) applicaDatiLegacy(dati);
    }
  } catch(e){
    console.warn('[menu-data] lettura menu da Firebase fallita, uso il menu statico di riserva:', e.message);
  } finally {
    nascondiScheletro();
    if (typeof window.avviaApp === 'function') window.avviaApp();
  }
}

/* Solo sul sito pubblico esiste lo scheletro di caricamento: se manca
   (es. pagina aperta direttamente su #admin) non facciamo nulla qui,
   sarà admin-menu.js a occuparsi della propria interfaccia. */
if (document.getElementById('scheletro-caricamento')) {
  avvia();
} else if (typeof window.avviaApp === 'function') {
  /* Sicurezza: se per qualsiasi motivo lo scheletro non c'è, avviamo
     comunque il sito col fallback statico invece di lasciarlo fermo. */
  window.avviaApp();
}

/* ---------- API ESPORTATA (usata da admin-menu.js) ---------- */
export const MenuData = {
  RADICE, GRUPPI,
  slug, idUnico,
  leggiMenuGrezzo,
  costruisciDatiLegacy,
  applicaDatiLegacy,
  scriviPercorso,
  aggiornaPercorsi,
  rimuoviPercorso,
  db,
  app: ottieniApp
};
window.MenuData = MenuData;