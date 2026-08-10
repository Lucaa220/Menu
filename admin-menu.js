/* =========================================================
   Trattoria da Franca — Dashboard admin
   ADMIN-MENU — pannello "Gestisci menu": modifica di sezioni,
   piatti/vini/birre, prezzi, allergeni, schede tecniche e foto
   storytelling, tutto salvato su Firebase (menu/), più lo
   strumento di importazione una tantum dei dati statici attuali.

   Riusa le funzioni condivise di menu-data.js (stessa lettura/
   scrittura/trasformazione dati usata dal sito pubblico), così la
   struttura dati è definita in un solo posto.
   ========================================================= */

import { ref as dbRef, get as dbGet, remove as dbRemove, push as dbPush }
  from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { MenuData } from "./menu-data.js";

const GIORNI = [
  { c:'lun', l:'Lun' }, { c:'mar', l:'Mar' }, { c:'mer', l:'Mer' },
  { c:'gio', l:'Gio' }, { c:'ven', l:'Ven' }, { c:'sab', l:'Sab' }, { c:'dom', l:'Dom' }
];
const NOMI_GRUPPO = { piatti:'Piatti', vini:'Vini', birre:'Birre', menufissi:'Menù fissi' };

let contenitore = null;
let contenitoreManutenzione = null;
let grezzo = null;          // albero grezzo in memoria (cache locale, rispecchia Firebase)
let gruppoAttivo = 'piatti';

/* ---------- ALBERO VUOTO (prima di ogni migrazione) ---------- */
function alberoVuoto(){
  return {
    coperto: { it:'', en:'' },
    nota: { it:[], en:[] },
    gruppi: { piatti:{ordine:[]}, vini:{ordine:[]}, birre:{ordine:[]} },
    sezioni: {},
    voci: {},
    menuFissiOrdine: [],   // ordine di visualizzazione dei menù a prezzo fisso
    menuFissi: {}          // ogni voce: nome, prezzo, descrizione, note, attivo, portate[]
  };
}

/* ---------- AVVIO (chiamato da admin.js al primo click sulla scheda) ---------- */
window.avviaAdminMenu = async function avviaAdminMenu(){
  contenitore = document.getElementById('tab-gestisci-menu');
  if (!contenitore) return;
  contenitore.innerHTML = '<p class="loading">Caricamento menu…</p>';
  try {
    grezzo = (await MenuData.leggiMenuGrezzo()) || alberoVuoto();
    grezzo.menuFissiOrdine = grezzo.menuFissiOrdine || [];
    grezzo.menuFissi = grezzo.menuFissi || {};
  } catch(e){
    contenitore.innerHTML = '<p class="vuoto">Errore di lettura da Firebase: ' + escHtml(e.message) + '</p>';
    return;
  }
  disegna();
};

/* ---------- AVVIO PANNELLO MANUTENZIONE (backup / cestino / registro) ---------- */
window.avviaAdminManutenzione = async function avviaAdminManutenzione(){
  contenitoreManutenzione = document.getElementById('tab-manutenzione');
  if (!contenitoreManutenzione) return;
  contenitoreManutenzione.innerHTML = '<p class="loading">Caricamento…</p>';
  await disegnaManutenzione();
  attaccaListenerManutenzione();
};

/* ---------- HELPER ---------- */
function escHtml(s){
  return (s==null ? '' : String(s)).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function idUsatiAttuali(){
  const s = new Set();
  Object.keys(grezzo.sezioni||{}).forEach(k=>s.add(k));
  Object.keys(grezzo.voci||{}).forEach(k=>s.add(k));
  return s;
}
function raccogliGiorniSelezionati(elVoce){
  return Array.from(elVoce.querySelectorAll('[data-campo="pranzo-giorno"]:checked')).map(cb=>cb.value);
}
async function segnalaEsito(el, promessa){
  el.classList.remove('mg-ok','mg-errore');
  try {
    await promessa();
    el.classList.add('mg-ok');
    setTimeout(()=>el.classList.remove('mg-ok'), 1400);
  } catch(e){
    el.classList.add('mg-errore');
    window.alert('Errore nel salvataggio: ' + e.message);
  }
}

/* ---------- CESTINO E REGISTRO MODIFICHE ----------
   Vivono FUORI dall'albero "menu/" (in cestino/ e log/ a livello di
   radice del database) apposta: il sito pubblico legge tutto il nodo
   "menu/" per mostrare il menu ai clienti, quindi tenere questi dati
   altrove evita di far scaricare a ogni visitatore anche il cestino e
   i log (peso inutile, oltre che email dell'admin non necessarie sul
   sito pubblico). Le regole di sicurezza di Firebase per cestino/ e
   log/ vanno impostate come "lettura e scrittura solo autenticati". */
function utenteCorrente(){
  try {
    const a = getAuth(MenuData.app());
    return (a && a.currentUser && a.currentUser.email) || 'sconosciuto';
  } catch(e){ return 'sconosciuto'; }
}
async function registraLog(azione, dettaglio){
  const database = MenuData.db();
  if (!database) return;
  try {
    await dbPush(dbRef(database, 'log'), { quando: Date.now(), chi: utenteCorrente(), azione, dettaglio: dettaglio || '' });
  } catch(e){ console.warn('[admin-menu] registrazione log fallita:', e.message); }
}
async function leggiLog(){
  const database = MenuData.db();
  if (!database) return {};
  try {
    const snap = await dbGet(dbRef(database, 'log'));
    return snap.exists() ? snap.val() : {};
  } catch(e){ return {}; }
}
async function spostaNelCestino(voce){
  const database = MenuData.db();
  if (!database) return;
  await dbPush(dbRef(database, 'cestino'), Object.assign({ quando: Date.now(), da: utenteCorrente() }, voce));
}
async function leggiCestino(){
  const database = MenuData.db();
  if (!database) return {};
  try {
    const snap = await dbGet(dbRef(database, 'cestino'));
    return snap.exists() ? snap.val() : {};
  } catch(e){ return {}; }
}
async function rimuoviDalCestino(pushId){
  const database = MenuData.db();
  if (!database) return;
  await dbRemove(dbRef(database, 'cestino/'+pushId));
}

/* ---------- CLOUDINARY: compressione lato client + upload ----------
   Le foto NON passano più da Firebase Storage: quel servizio richiede,
   dal 2026, il piano a pagamento Blaze (carta di credito) anche solo
   per essere attivato, e in più — trattandosi di richieste HTTP dirette
   al bucket — avrebbe comunque bisogno di una configurazione CORS
   manuale una tantum per funzionare da un dominio esterno come GitHub
   Pages. Cloudinary risolve entrambi i problemi: piano gratuito
   permanente senza carta di credito, e gli upload "unsigned" sono
   pensati apposta per essere chiamati direttamente dal browser (nessun
   problema di CORS, nessun server serve).

   Il resto del pannello (login, testi, prezzi, sezioni...) continua a
   usare Firebase Realtime Database esattamente come prima: cambia solo
   la destinazione delle foto. L'URL restituito da Cloudinary viene
   comunque salvato dentro Firebase (sez.foto.imgs, voce.scheda.foto),
   quindi app.js non ha bisogno di sapere da dove arriva l'immagine. */
function comprimiImmagine(file, latoMax, qualita){
  latoMax = latoMax || 1600; qualita = qualita || 0.82;
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith('image/')) { reject(new Error("Il file scelto non è un'immagine.")); return; }
    if (file.size > 8*1024*1024) { reject(new Error('Immagine troppo grande (max 8 MB).')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > latoMax || height > latoMax){
        if (width >= height){ height = Math.round(height * latoMax / width); width = latoMax; }
        else { width = Math.round(width * latoMax / height); height = latoMax; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (!blob) { reject(new Error('Compressione immagine fallita.')); return; }
        resolve(blob);
      }, 'image/jpeg', qualita);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Immagine non leggibile.')); };
    img.src = url;
  });
}
async function caricaSuCloudinary(file, percorso, latoMax, qualita){
  const cfg = window.CLOUDINARY_CONFIG;
  if (!cfg || !cfg.cloudName || !cfg.uploadPreset
      || cfg.cloudName.indexOf('INSERISCI_') === 0 || cfg.uploadPreset.indexOf('INSERISCI_') === 0){
    throw new Error('Cloudinary non configurato: compila cloudinary-config.js con il tuo cloud name e upload preset (vedi le istruzioni scritte in quel file).');
  }
  const blob = await comprimiImmagine(file, latoMax, qualita);

  const form = new FormData();
  form.append('file', blob, 'foto.jpg');
  form.append('upload_preset', cfg.uploadPreset);
  /* "percorso" (es. "menu-foto/sezioni/antipasti/1699999999") diventa il
     public_id Cloudinary: definisce sia il nome del file sia, grazie
     alle "/", la sua posizione nelle cartelle della media library —
     stessa logica di prima con Firebase Storage.
     NOTA: nei preset "Unsigned" Cloudinary non permette di sovrascrivere
     un file esistente (per sicurezza: altrimenti chiunque potrebbe
     rimpiazzare qualsiasi file indovinandone il nome). Per questo anche
     il percorso delle foto scheda vino/birra include un timestamp:
     ogni caricamento crea sempre un file nuovo, e quello sostituito
     resta nella media library come file orfano — esattamente come già
     succede oggi per le foto di sezione quando vengono rimosse — da
     ripulire ogni tanto a mano se non serve più (vedi il messaggio di
     conferma mostrato in quel momento). */
  if (percorso) form.append('public_id', percorso.replace(/\.[a-z0-9]+$/i, ''));

  let risposta;
  try {
    risposta = await fetch('https://api.cloudinary.com/v1_1/' + cfg.cloudName + '/image/upload', {
      method: 'POST',
      body: form
    });
  } catch(e){
    throw new Error(erroreCaricamentoLeggibile({ message: e.message }));
  }

  if (!risposta.ok){
    let dettaglio = 'HTTP ' + risposta.status;
    try {
      const corpo = await risposta.json();
      if (corpo && corpo.error && corpo.error.message) dettaglio = corpo.error.message;
    } catch(e){ /* risposta non-JSON: teniamo il codice HTTP */ }
    throw new Error(erroreCaricamentoLeggibile({ status:risposta.status, message:dettaglio }));
  }

  const dati = await risposta.json();
  if (!dati || !dati.secure_url) throw new Error('Cloudinary non ha restituito un URL valido per la foto caricata.');
  return dati.secure_url;
}

/* Traduce un errore tecnico di caricamento Cloudinary in un messaggio
   comprensibile per chi usa il pannello admin. I casi più comuni in
   fase di primo utilizzo sono: preset non impostato su "Unsigned"
   (Cloudinary risponde 400/401 con un messaggio che lo dice
   esplicitamente), cloud name o nome preset sbagliati (400/404), o un
   problema di rete lato utente (offline, connessione instabile). */
function erroreCaricamentoLeggibile(e){
  const testo = (e && e.message) || String(e);
  const status = e && e.status;
  if (/unsigned/i.test(testo)){
    return 'Cloudinary ha rifiutato il caricamento: il preset indicato in cloudinary-config.js non è impostato su "Unsigned". Vai su Cloudinary → Impostazioni → Upload → Upload presets, apri il tuo preset e imposta "Signing Mode" su "Unsigned". Dettaglio tecnico: ' + testo;
  }
  if (status === 400 || status === 404){
    return 'Cloudinary ha rifiutato il caricamento: controlla che cloudName e uploadPreset in cloudinary-config.js corrispondano esattamente ai valori mostrati nella tua Dashboard Cloudinary (maiuscole/minuscole comprese). Dettaglio tecnico: ' + testo;
  }
  if (/network|failed to fetch|load failed/i.test(testo)){
    return 'Caricamento non riuscito per un problema di connessione: verifica la rete e riprova. Dettaglio tecnico: ' + testo;
  }
  return testo;
}

/* ---------- DISEGNO: STRUTTURA FISSA DEL PANNELLO ---------- */
function disegna(){
  contenitore.innerHTML = `
    <div class="pannello mg-migrazione">
      <h2>Importazione iniziale</h2>
      <p>Importa una tantum i dati statici attuali del sito (dati-menu.js / dati-foto.js) su Firebase: da quel momento potrai modificare tutto da qui, senza toccare codice. Se la rilanci quando ci sono già dati su Firebase, questi verranno sovrascritti — te lo chiederemo prima di procedere.</p>
      <button type="button" class="mg-bottone-secondario" data-azione="importa">Importa dati attuali in Firebase</button>
      <p id="mg-stato-importazione" class="mg-stato"></p>
    </div>

    <div class="pannello">
      <h2>Testo "coperto"</h2>
      <div class="mg-riga-2">
        <label>Italiano<input type="text" data-campo="coperto-it" value="${escHtml(grezzo.coperto && grezzo.coperto.it)}" placeholder="Coperto € 2"></label>
        <label>Inglese<input type="text" data-campo="coperto-en" value="${escHtml(grezzo.coperto && grezzo.coperto.en)}" placeholder="Cover charge € 2"></label>
      </div>
    </div>

    <div class="mg-tabs" id="mg-tabs">
      <button type="button" data-azione="cambia-gruppo" data-gruppo="piatti" class="attivo">Piatti</button>
      <button type="button" data-azione="cambia-gruppo" data-gruppo="vini">Vini</button>
      <button type="button" data-azione="cambia-gruppo" data-gruppo="birre">Birre</button>
      <button type="button" data-azione="cambia-gruppo" data-gruppo="menufissi">Menù fissi</button>
    </div>
    <div id="mg-corpo-gruppo"></div>
  `;
  disegnaGruppo(gruppoAttivo);
  attaccaListener();
}

function disegnaGruppo(gruppo){
  gruppoAttivo = gruppo;
  document.querySelectorAll('#mg-tabs button').forEach(b => b.classList.toggle('attivo', b.dataset.gruppo === gruppo));
  const corpo = document.getElementById('mg-corpo-gruppo');

  if (gruppo === 'menufissi'){
    const ordine = grezzo.menuFissiOrdine || [];
    const html = ordine.map((id,i) => htmlMenuFisso(id, grezzo.menuFissi[id] || {}, i, ordine.length)).join('');
    corpo.innerHTML = `
      <div class="pannello">
        <h2>Menù a prezzo fisso</h2>
        <p class="mg-nota-mini">Crea qui i menù a prezzo fisso (es. "Menù Turistico € 25"): appariranno come categoria a sé nel sito pubblico, con le portate incluse. La categoria compare ai clienti solo quando c'è almeno un menù "Disponibile".</p>
        ${html || '<p class="vuoto">Nessun menù a prezzo fisso. Aggiungine uno qui sotto.</p>'}
        <button type="button" class="mg-aggiungi mg-aggiungi-sezione" data-azione="aggiungi-menufisso">+ Aggiungi menù a prezzo fisso</button>
      </div>
    `;
    return;
  }

  const ordine = (grezzo.gruppi[gruppo] && grezzo.gruppi[gruppo].ordine) || [];
  const sezioniHtml = ordine.map((sectionId, i) => htmlSezione(gruppo, sectionId, grezzo.sezioni[sectionId], i, ordine.length)).join('');
  corpo.innerHTML = `
    <div class="pannello">
      <h2>Sezioni — ${NOMI_GRUPPO[gruppo]}</h2>
      ${sezioniHtml || '<p class="vuoto">Nessuna sezione. Importa i dati attuali oppure aggiungine una qui sotto.</p>'}
      <button type="button" class="mg-aggiungi mg-aggiungi-sezione" data-azione="aggiungi-sezione">+ Aggiungi sezione</button>
    </div>
  `;
}

/* ---------- SEZIONE ---------- */
function htmlSezione(gruppo, sectionId, sez, indice, totale){
  const tit = sez.titolo || {it:'',en:''};
  const tabella = !!sez.tabella;
  const colonneTxt = (sez.colonne||[]).join(', ');
  const voci = sez.ordine || [];
  return `
  <div class="mg-sezione" data-sezione="${sectionId}">
    <div class="mg-sezione-testa">
      <div class="mg-frecce">
        <button type="button" data-azione="sposta-sezione" data-dir="su" ${indice===0?'disabled':''} title="Sposta su">▲</button>
        <button type="button" data-azione="sposta-sezione" data-dir="giu" ${indice===totale-1?'disabled':''} title="Sposta giù">▼</button>
      </div>
      <div class="mg-sezione-titoli">
        <input type="text" data-campo="titolo-it" placeholder="Titolo (italiano)" value="${escHtml(tit.it)}">
        <input type="text" data-campo="titolo-en" placeholder="Titolo (inglese)" value="${escHtml(tit.en)}">
      </div>
      <label class="mg-check-inline" title="Per sezioni come 'Vino della Casa', con più colonne di prezzo">
        <input type="checkbox" data-campo="tabella" ${tabella?'checked':''}> tabella a più prezzi
      </label>
      <button type="button" class="mg-elimina" data-azione="elimina-sezione">Elimina sezione</button>
    </div>
    ${tabella ? `<div class="mg-colonne"><label>Colonne prezzi, separate da virgola<input type="text" data-campo="colonne" value="${escHtml(colonneTxt)}" placeholder="1/4L, 1/2L, 1L"></label></div>` : ''}
    ${htmlFotoSezione(sez)}
    <div class="mg-voci">
      ${voci.map((itemId,i)=>htmlVoce(gruppo, itemId, sez, i, voci.length)).join('') || '<p class="vuoto-mini">Nessuna voce in questa sezione.</p>'}
    </div>
    <button type="button" class="mg-aggiungi" data-azione="aggiungi-voce">+ Aggiungi voce</button>
  </div>`;
}

/* ---------- MENÙ A PREZZO FISSO ----------
   Struttura diversa dalle sezioni "normali": ogni menù è una scheda
   autonoma (nome, prezzo, descrizione, note, disponibilità) con un
   elenco di "portate" (es. Antipasto, Primo...), ciascuna con le sue
   voci. Tutto annidato in un unico oggetto per menù (non condiviso
   con altre sezioni), quindi più semplice da salvare: ogni modifica
   alle portate riscrive semplicemente l'intero array "portate". */
function htmlMenuFisso(id, mf, indice, totale){
  const nome = mf.nome || {it:'',en:''};
  const descrizione = mf.descrizione || {it:'',en:''};
  const note = mf.note || {it:'',en:''};
  const attivo = mf.attivo !== false; // assente/true = disponibile
  const portate = mf.portate || [];
  return `<div class="mg-sezione mg-menufisso${!attivo ? ' mg-voce-non-disponibile' : ''}" data-menufisso="${id}">
    <div class="mg-sezione-testa">
      <div class="mg-frecce">
        <button type="button" data-azione="sposta-menufisso" data-dir="su" ${indice===0?'disabled':''} title="Sposta su">▲</button>
        <button type="button" data-azione="sposta-menufisso" data-dir="giu" ${indice===totale-1?'disabled':''} title="Sposta giù">▼</button>
      </div>
      <div class="mg-sezione-titoli">
        <input type="text" data-campo="mf-nome-it" placeholder="Nome del menù (italiano)" value="${escHtml(nome.it)}">
        <input type="text" data-campo="mf-nome-en" placeholder="Nome del menù (inglese)" value="${escHtml(nome.en)}">
      </div>
      <label class="mg-prezzo-singolo">Prezzo<input type="text" data-campo="mf-prezzo" value="${escHtml(mf.prezzo||'')}" placeholder="€ 25,00"></label>
      <label class="mg-check-inline" title="Se disattivato, il menù resta salvato qui ma sparisce dal menu pubblico">
        <input type="checkbox" data-campo="mf-attivo" ${attivo?'checked':''}> Disponibile
      </label>
      <button type="button" class="mg-elimina" data-azione="elimina-menufisso">Elimina menù</button>
    </div>
    ${!attivo ? '<p class="mg-nota-non-disponibile">Non disponibile: nascosto dal menu pubblico.</p>' : ''}
    <div class="mg-riga-2">
      <label>Descrizione introduttiva IT <span class="mg-nota-mini">(facoltativa)</span><textarea data-campo="mf-descrizione-it" rows="2" placeholder="Es. Un percorso tra i sapori della tradizione">${escHtml(descrizione.it)}</textarea></label>
      <label>Descrizione introduttiva EN <span class="mg-nota-mini">(facoltativa)</span><textarea data-campo="mf-descrizione-en" rows="2" placeholder="e.g. A journey through traditional flavours">${escHtml(descrizione.en)}</textarea></label>
    </div>
    <div class="mg-voci">
      <h4 class="mg-portate-titolo">Portate incluse</h4>
      ${portate.map((p,i)=>htmlPortata(p,i,portate.length)).join('') || '<p class="vuoto-mini">Nessuna portata. Aggiungine una qui sotto (es. Antipasto, Primo, Dolce...).</p>'}
      <button type="button" class="mg-aggiungi" data-azione="aggiungi-portata">+ Aggiungi portata</button>
    </div>
    <div class="mg-riga-2">
      <label>Note IT <span class="mg-nota-mini">es. "Bevande escluse"</span><input type="text" data-campo="mf-note-it" value="${escHtml(note.it)}"></label>
      <label>Note EN<input type="text" data-campo="mf-note-en" value="${escHtml(note.en)}"></label>
    </div>
  </div>`;
}
function htmlPortata(portata, indice, totale){
  const titolo = portata.titolo || {it:'',en:''};
  const voci = portata.voci || [];
  return `<div class="mg-voce mg-portata" data-portata="${indice}">
    <div class="mg-voce-testa">
      <div class="mg-frecce">
        <button type="button" data-azione="sposta-portata" data-dir="su" ${indice===0?'disabled':''}>▲</button>
        <button type="button" data-azione="sposta-portata" data-dir="giu" ${indice===totale-1?'disabled':''}>▼</button>
      </div>
      <input type="text" data-campo="portata-titolo-it" placeholder="Portata (italiano), es. Antipasto" value="${escHtml(titolo.it)}">
      <input type="text" data-campo="portata-titolo-en" placeholder="Portata (inglese), es. Starter" value="${escHtml(titolo.en)}">
      <button type="button" class="mg-elimina" data-azione="elimina-portata">Elimina portata</button>
    </div>
    <div class="mg-portata-voci">
      ${voci.map((v,vi)=>htmlVocePortata(v,vi,voci.length)).join('') || '<p class="vuoto-mini">Nessuna voce in questa portata.</p>'}
      <button type="button" class="mg-aggiungi" data-azione="aggiungi-voce-portata">+ Aggiungi voce</button>
    </div>
  </div>`;
}
function htmlVocePortata(voce, indice, totale){
  const nome = voce.nome || {it:'',en:''};
  return `<div class="mg-foto-riga mg-voce-portata" data-voce-portata="${indice}">
    <div class="mg-foto-campi">
      <input type="text" data-campo="vp-nome-it" placeholder="Nome piatto (italiano)" value="${escHtml(nome.it)}">
      <input type="text" data-campo="vp-nome-en" placeholder="Nome piatto (inglese)" value="${escHtml(nome.en)}">
    </div>
    <div class="mg-frecce">
      <button type="button" data-azione="sposta-voce-portata" data-dir="su" ${indice===0?'disabled':''}>▲</button>
      <button type="button" data-azione="sposta-voce-portata" data-dir="giu" ${indice===totale-1?'disabled':''}>▼</button>
    </div>
    <button type="button" class="mg-elimina" data-azione="elimina-voce-portata">Rimuovi</button>
  </div>`;
}

function htmlFotoSezione(sez){
  const foto = sez.foto || { imgs:[], didascalie:[] };
  const imgs = foto.imgs || [];
  const righe = imgs.map((url, i) => {
    const d = (foto.didascalie && foto.didascalie[i]) || {it:'',en:''};
    return `<div class="mg-foto-riga" data-foto-indice="${i}">
      <img src="${escHtml(url)}" alt="" class="mg-foto-anteprima" loading="lazy">
      <div class="mg-foto-campi">
        <input type="text" data-campo="foto-cap-it" placeholder="Didascalia IT" value="${escHtml(d.it)}">
        <input type="text" data-campo="foto-cap-en" placeholder="Didascalia EN" value="${escHtml(d.en)}">
      </div>
      <div class="mg-frecce">
        <button type="button" data-azione="sposta-foto" data-dir="su" ${i===0?'disabled':''}>▲</button>
        <button type="button" data-azione="sposta-foto" data-dir="giu" ${i===imgs.length-1?'disabled':''}>▼</button>
      </div>
      <button type="button" class="mg-elimina" data-azione="elimina-foto">Rimuovi</button>
    </div>`;
  }).join('');
  return `<div class="mg-foto-sezione">
    <h4>Foto storytelling di questa sezione <span class="mg-nota-mini">(facoltative — 1 foto fissa, 2 o più diventano un carosello)</span></h4>
    ${righe || '<p class="vuoto-mini">Nessuna foto caricata.</p>'}
    <label class="mg-upload">📷 Carica foto<input type="file" accept="image/*" data-azione="carica-foto" hidden></label>
    <p class="mg-stato-upload"></p>
  </div>`;
}

/* ---------- VOCE (piatto / vino / birra) ---------- */
function htmlVoce(gruppo, itemId, sez, i, totale){
  const voce = grezzo.voci[itemId] || {};
  const nome = voce.nome || {it:'',en:''};
  let prezziHtml;
  if (sez.tabella){
    const colonne = sez.colonne || [];
    const prezzi = voce.prezzi || [];
    prezziHtml = `<div class="mg-prezzi-tabella">${colonne.map((c,ci)=>
      `<label>${escHtml(c)}<input type="text" data-campo="prezzo-col" data-col="${ci}" value="${escHtml(prezzi[ci]||'')}"></label>`).join('')}</div>`;
  } else {
    prezziHtml = `<label class="mg-prezzo-singolo">Prezzo<input type="text" data-campo="prezzo" value="${escHtml(voce.prezzo||'')}" placeholder="€ 0,00"></label>`;
  }

  const extraPiatti = gruppo === 'piatti' ? (htmlDisponibilitaPranzo(itemId, voce) + htmlAllergeni(voce)) : '';
  const extraScheda = (gruppo === 'vini' || gruppo === 'birre') ? htmlScheda(gruppo, voce) : '';
  const eVinoOBirra = (gruppo === 'vini' || gruppo === 'birre');
  const disponibile = voce.disponibile !== false; // assente/true = disponibile
  const disponibilitaHtml = eVinoOBirra ? `
      <label class="mg-check-inline mg-disponibile" title="Se disattivato, la voce resta salvata qui ma sparisce dal menu pubblico (es. bottiglia terminata)">
        <input type="checkbox" data-campo="disponibile" ${disponibile?'checked':''}> Disponibile
      </label>` : '';

  return `<div class="mg-voce${eVinoOBirra && !disponibile ? ' mg-voce-non-disponibile' : ''}" data-voce="${itemId}">
    <div class="mg-voce-testa">
      <div class="mg-frecce">
        <button type="button" data-azione="sposta-voce" data-dir="su" ${i===0?'disabled':''}>▲</button>
        <button type="button" data-azione="sposta-voce" data-dir="giu" ${i===totale-1?'disabled':''}>▼</button>
      </div>
      <input type="text" data-campo="nome-it" placeholder="Nome (italiano)" value="${escHtml(nome.it)}">
      <input type="text" data-campo="nome-en" placeholder="Nome (inglese)" value="${escHtml(nome.en)}">
      ${prezziHtml}
      ${disponibilitaHtml}
      <button type="button" class="mg-elimina" data-azione="elimina-voce">Elimina</button>
    </div>
    ${eVinoOBirra && !disponibile ? '<p class="mg-nota-non-disponibile">Non disponibile: nascosta dal menu pubblico.</p>' : ''}
    ${extraPiatti}
    ${extraScheda}
  </div>`;
}

function htmlDisponibilitaPranzo(itemId, voce){
  const g = voce.giorniNonDisponibiliPranzo;
  const modo = g === true ? 'mai' : (Array.isArray(g) ? 'giorni' : 'sempre');
  const sel = Array.isArray(g) ? g : [];
  const nomeRadio = 'pranzo-' + itemId;
  return `<div class="mg-pranzo">
    <span class="mg-etichetta">A pranzo (11:30–15:00):</span>
    <label><input type="radio" name="${nomeRadio}" data-campo="pranzo-modo" value="sempre" ${modo==='sempre'?'checked':''}> sempre disponibile</label>
    <label><input type="radio" name="${nomeRadio}" data-campo="pranzo-modo" value="mai" ${modo==='mai'?'checked':''}> mai a pranzo</label>
    <label><input type="radio" name="${nomeRadio}" data-campo="pranzo-modo" value="giorni" ${modo==='giorni'?'checked':''}> non disponibile a pranzo nei giorni:</label>
    <span class="mg-giorni">${GIORNI.map(gi=>
      `<label class="mg-giorno"><input type="checkbox" data-campo="pranzo-giorno" value="${gi.c}" ${sel.includes(gi.c)?'checked':''}> ${gi.l}</label>`).join('')}</span>
  </div>`;
}
function htmlAllergeni(voce){
  const sel = new Set(voce.allergeni || []);
  const elenco = (typeof allergeniData !== 'undefined' ? allergeniData : []);
  return `<div class="mg-allergeni">
    <span class="mg-etichetta">Allergeni:</span>
    ${elenco.map((a,i)=>{
      const n = i+1;
      return `<label class="mg-allergene" title="${escHtml(a.it)}"><input type="checkbox" data-campo="allergene" value="${n}" ${sel.has(n)?'checked':''}> ${a.ic} ${n}</label>`;
    }).join('')}
  </div>`;
}
function htmlScheda(gruppo, voce){
  const s = voce.scheda || {};
  const campoA = gruppo==='vini' ? 'zona' : 'birrificio';
  const campoB = gruppo==='vini' ? 'vitigno' : 'stile';
  const labelA = gruppo==='vini' ? 'Zona di produzione' : 'Birrificio';
  const labelB = gruppo==='vini' ? 'Vitigno' : 'Stile';
  const a = s[campoA] || {it:'',en:''};
  const b = s[campoB] || {it:'',en:''};
  const d = s.descrizione || {it:'',en:''};
  return `<div class="mg-scheda">
    <h4>Scheda tecnica</h4>
    <div class="mg-riga-2">
      <label>${labelA} (IT)<input type="text" data-campo="scheda-${campoA}-it" value="${escHtml(a.it)}"></label>
      <label>${labelA} (EN)<input type="text" data-campo="scheda-${campoA}-en" value="${escHtml(a.en)}"></label>
    </div>
    <div class="mg-riga-2">
      <label>${labelB} (IT)<input type="text" data-campo="scheda-${campoB}-it" value="${escHtml(b.it)}"></label>
      <label>${labelB} (EN)<input type="text" data-campo="scheda-${campoB}-en" value="${escHtml(b.en)}"></label>
    </div>
    <div class="mg-riga-2">
      <label>Descrizione (IT)<textarea data-campo="scheda-descrizione-it" rows="2">${escHtml(d.it)}</textarea></label>
      <label>Descrizione (EN)<textarea data-campo="scheda-descrizione-en" rows="2">${escHtml(d.en)}</textarea></label>
    </div>
    <div class="mg-scheda-foto">
      ${s.foto ? `<img src="${escHtml(s.foto)}" class="mg-foto-anteprima" alt="">` : ''}
      <label class="mg-upload">📷 ${s.foto?'Sostituisci foto':'Carica foto'}<input type="file" accept="image/*" data-azione="carica-foto-scheda" hidden></label>
      ${s.foto ? `<button type="button" class="mg-elimina" data-azione="elimina-foto-scheda">Rimuovi foto</button>` : ''}
      <p class="mg-stato-upload"></p>
    </div>
  </div>`;
}

/* ---------- LISTENER (delegati sul contenitore, un'unica volta) ---------- */
let listenerAttaccati = false;
function attaccaListener(){
  if (listenerAttaccati) return;
  listenerAttaccati = true;

  contenitore.addEventListener('change', gestisciChange);
  contenitore.addEventListener('click', gestisciClick);
}

async function gestisciChange(e){
  const t = e.target;

  if (t.dataset.azione === 'carica-foto'){
    const sectionId = t.closest('[data-sezione]').dataset.sezione;
    return caricaFotoSezione(sectionId, t);
  }
  if (t.dataset.azione === 'carica-foto-scheda'){
    const itemId = t.closest('[data-voce]').dataset.voce;
    return caricaFotoScheda(itemId, t);
  }

  const campo = t.dataset.campo;
  if (!campo) return;

  if (campo === 'coperto-it' || campo === 'coperto-en'){
    const lingua = campo.endsWith('it') ? 'it' : 'en';
    grezzo.coperto = grezzo.coperto || {it:'',en:''};
    grezzo.coperto[lingua] = t.value;
    return segnalaEsito(t, () => MenuData.scriviPercorso('coperto', grezzo.coperto));
  }

  /* Menù a prezzo fisso: campi con prefisso dedicato (mf-, portata-, vp-),
     gestiti a parte perché la struttura dati è diversa da sezioni/voci. */
  if (campo.indexOf('mf-') === 0 || campo.indexOf('portata-') === 0 || campo.indexOf('vp-') === 0){
    return gestisciChangeMenuFisso(t, campo);
  }

  const elFoto = t.closest('[data-foto-indice]');
  const elVoce = t.closest('[data-voce]');
  const elSezione = t.closest('[data-sezione]');
  if (!elSezione) return;
  const sectionId = elSezione.dataset.sezione;
  const sez = grezzo.sezioni[sectionId];

  if (elFoto){
    const indice = Number(elFoto.dataset.fotoIndice);
    sez.foto = sez.foto || { imgs:[], didascalie:[] };
    sez.foto.didascalie[indice] = sez.foto.didascalie[indice] || {it:'',en:''};
    if (campo === 'foto-cap-it') sez.foto.didascalie[indice].it = t.value;
    if (campo === 'foto-cap-en') sez.foto.didascalie[indice].en = t.value;
    return segnalaEsito(t, () => MenuData.scriviPercorso('sezioni/'+sectionId+'/foto', sez.foto));
  }

  if (elVoce){
    const itemId = elVoce.dataset.voce;
    const voce = grezzo.voci[itemId];

    if (campo === 'nome-it' || campo === 'nome-en'){
      voce.nome = voce.nome || {it:'',en:''};
      voce.nome[campo.endsWith('it') ? 'it' : 'en'] = t.value;
      return segnalaEsito(t, () => MenuData.scriviPercorso('voci/'+itemId+'/nome', voce.nome));
    }
    if (campo === 'prezzo'){
      voce.prezzo = t.value;
      return segnalaEsito(t, () => MenuData.scriviPercorso('voci/'+itemId+'/prezzo', voce.prezzo));
    }
    if (campo === 'prezzo-col'){
      const col = Number(t.dataset.col);
      voce.prezzi = voce.prezzi || [];
      voce.prezzi[col] = t.value;
      return segnalaEsito(t, () => MenuData.scriviPercorso('voci/'+itemId+'/prezzi', voce.prezzi));
    }
    if (campo === 'pranzo-modo'){
      if (t.value === 'sempre') voce.giorniNonDisponibiliPranzo = null;
      else if (t.value === 'mai') voce.giorniNonDisponibiliPranzo = true;
      else voce.giorniNonDisponibiliPranzo = raccogliGiorniSelezionati(elVoce);
      await segnalaEsito(t, () => MenuData.scriviPercorso('voci/'+itemId+'/giorniNonDisponibiliPranzo', voce.giorniNonDisponibiliPranzo));
      disegnaGruppo(gruppoAttivo); // mostra/nasconde le checkbox dei giorni
      return;
    }
    if (campo === 'pranzo-giorno'){
      voce.giorniNonDisponibiliPranzo = raccogliGiorniSelezionati(elVoce);
      return segnalaEsito(t, () => MenuData.scriviPercorso('voci/'+itemId+'/giorniNonDisponibiliPranzo', voce.giorniNonDisponibiliPranzo));
    }
    if (campo === 'allergene'){
      const n = Number(t.value);
      const set = new Set(voce.allergeni || []);
      if (t.checked) set.add(n); else set.delete(n);
      voce.allergeni = Array.from(set).sort((x,y)=>x-y);
      return segnalaEsito(t, () => MenuData.scriviPercorso('voci/'+itemId+'/allergeni', voce.allergeni));
    }
    if (campo === 'disponibile'){
      voce.disponibile = t.checked;
      await segnalaEsito(t, () => MenuData.scriviPercorso('voci/'+itemId+'/disponibile', voce.disponibile));
      registraLog(t.checked ? 'Voce segnata disponibile' : 'Voce segnata NON disponibile', (voce.nome&&voce.nome.it)||itemId);
      disegnaGruppo(gruppoAttivo); // aggiorna l'evidenziazione della voce non disponibile
      return;
    }
    if (campo.indexOf('scheda-') === 0){
      const resto = campo.slice('scheda-'.length);      // es: "zona-it" oppure "descrizione-en"
      const lingua = resto.slice(-2);                     // "it" oppure "en"
      const nomeCampo = resto.slice(0, resto.length - 3); // toglie "-it"/"-en"
      voce.scheda = voce.scheda || {};
      voce.scheda[nomeCampo] = voce.scheda[nomeCampo] || {it:'',en:''};
      voce.scheda[nomeCampo][lingua] = t.value;
      return segnalaEsito(t, () => MenuData.scriviPercorso('voci/'+itemId+'/scheda/'+nomeCampo, voce.scheda[nomeCampo]));
    }
    return;
  }

  // campi a livello di sezione
  if (campo === 'titolo-it' || campo === 'titolo-en'){
    sez.titolo = sez.titolo || {it:'',en:''};
    sez.titolo[campo.endsWith('it') ? 'it' : 'en'] = t.value;
    return segnalaEsito(t, () => MenuData.scriviPercorso('sezioni/'+sectionId+'/titolo', sez.titolo));
  }
  if (campo === 'tabella'){
    sez.tabella = t.checked;
    if (sez.tabella && !sez.colonne) sez.colonne = ['1/4L','1/2L','1L'];
    await segnalaEsito(t, () => MenuData.aggiornaPercorsi({
      ['sezioni/'+sectionId+'/tabella']: sez.tabella,
      ['sezioni/'+sectionId+'/colonne']: sez.colonne || null
    }));
    disegnaGruppo(gruppoAttivo);
    return;
  }
  if (campo === 'colonne'){
    sez.colonne = t.value.split(',').map(s=>s.trim()).filter(Boolean);
    await segnalaEsito(t, () => MenuData.scriviPercorso('sezioni/'+sectionId+'/colonne', sez.colonne));
    disegnaGruppo(gruppoAttivo);
    return;
  }
}

async function gestisciChangeMenuFisso(t, campo){
  const elMf = t.closest('[data-menufisso]');
  if (!elMf) return;
  const mfId = elMf.dataset.menufisso;
  const mf = grezzo.menuFissi[mfId];
  if (!mf) return;

  if (campo === 'mf-nome-it' || campo === 'mf-nome-en'){
    mf.nome = mf.nome || {it:'',en:''};
    mf.nome[campo.endsWith('it')?'it':'en'] = t.value;
    return segnalaEsito(t, () => MenuData.scriviPercorso('menuFissi/'+mfId+'/nome', mf.nome));
  }
  if (campo === 'mf-prezzo'){
    mf.prezzo = t.value;
    return segnalaEsito(t, () => MenuData.scriviPercorso('menuFissi/'+mfId+'/prezzo', mf.prezzo));
  }
  if (campo === 'mf-descrizione-it' || campo === 'mf-descrizione-en'){
    mf.descrizione = mf.descrizione || {it:'',en:''};
    mf.descrizione[campo.endsWith('it')?'it':'en'] = t.value;
    return segnalaEsito(t, () => MenuData.scriviPercorso('menuFissi/'+mfId+'/descrizione', mf.descrizione));
  }
  if (campo === 'mf-note-it' || campo === 'mf-note-en'){
    mf.note = mf.note || {it:'',en:''};
    mf.note[campo.endsWith('it')?'it':'en'] = t.value;
    return segnalaEsito(t, () => MenuData.scriviPercorso('menuFissi/'+mfId+'/note', mf.note));
  }
  if (campo === 'mf-attivo'){
    mf.attivo = t.checked;
    await segnalaEsito(t, () => MenuData.scriviPercorso('menuFissi/'+mfId+'/attivo', mf.attivo));
    registraLog(t.checked ? 'Menù fisso segnato disponibile' : 'Menù fisso segnato NON disponibile', (mf.nome&&mf.nome.it)||mfId);
    disegnaGruppo('menufissi');
    return;
  }

  const elPortata = t.closest('[data-portata]');
  const ip = elPortata ? Number(elPortata.dataset.portata) : null;
  if (ip === null) return;
  const portata = (mf.portate||[])[ip];
  if (!portata) return;

  if (campo === 'portata-titolo-it' || campo === 'portata-titolo-en'){
    portata.titolo = portata.titolo || {it:'',en:''};
    portata.titolo[campo.endsWith('it')?'it':'en'] = t.value;
    return segnalaEsito(t, () => MenuData.scriviPercorso('menuFissi/'+mfId+'/portate', mf.portate));
  }

  const elVp = t.closest('[data-voce-portata]');
  const ivp = elVp ? Number(elVp.dataset.vocePortata) : null;
  if (ivp === null) return;
  const voce = (portata.voci||[])[ivp];
  if (!voce) return;
  if (campo === 'vp-nome-it' || campo === 'vp-nome-en'){
    voce.nome = voce.nome || {it:'',en:''};
    voce.nome[campo.endsWith('it')?'it':'en'] = t.value;
    return segnalaEsito(t, () => MenuData.scriviPercorso('menuFissi/'+mfId+'/portate', mf.portate));
  }
}

async function gestisciClick(e){
  const btn = e.target.closest('[data-azione]');
  if (!btn) return;
  const azione = btn.dataset.azione;
  if (azione === 'carica-foto' || azione === 'carica-foto-scheda') return; // gestiti da 'change' sull'input file

  /* I pulsanti "+ Aggiungi..." creano subito una riga vuota senza un
     popup di conferma nel mezzo: senza questa protezione, un doppio
     click/tap rapido potrebbe far scattare l'azione due volte prima
     che il pannello si ridisegni, creando due voci duplicate. Il
     ridisegno (disegnaGruppo) sostituisce comunque il pulsante con uno
     nuovo già abilitato; il timeout è solo una rete di sicurezza per i
     casi in cui l'azione si interrompe prima di ridisegnare. */
  if (azione.indexOf('aggiungi') === 0 && !btn.disabled){
    btn.disabled = true;
    setTimeout(() => { btn.disabled = false; }, 1500);
  }

  if (azione === 'cambia-gruppo'){ disegnaGruppo(btn.dataset.gruppo); return; }
  if (azione === 'importa'){ return eseguiMigrazione(); }

  /* Menù a prezzo fisso: struttura diversa da sezioni/voci, gestita a parte */
  if (gruppoAttivo === 'menufissi'){
    if (azione === 'aggiungi-menufisso') return aggiungiMenuFisso();
    const elMf = btn.closest('[data-menufisso]');
    const mfId = elMf && elMf.dataset.menufisso;
    if (azione === 'elimina-menufisso') return eliminaMenuFisso(mfId);
    if (azione === 'sposta-menufisso') return spostaMenuFisso(mfId, btn.dataset.dir);
    if (azione === 'aggiungi-portata') return aggiungiPortata(mfId);
    const elPortata = btn.closest('[data-portata]');
    const ip = elPortata ? Number(elPortata.dataset.portata) : null;
    if (azione === 'elimina-portata') return eliminaPortata(mfId, ip);
    if (azione === 'sposta-portata') return spostaPortata(mfId, ip, btn.dataset.dir);
    if (azione === 'aggiungi-voce-portata') return aggiungiVocePortata(mfId, ip);
    const elVp = btn.closest('[data-voce-portata]');
    const ivp = elVp ? Number(elVp.dataset.vocePortata) : null;
    if (azione === 'elimina-voce-portata') return eliminaVocePortata(mfId, ip, ivp);
    if (azione === 'sposta-voce-portata') return spostaVocePortata(mfId, ip, ivp, btn.dataset.dir);
    return;
  }

  if (azione === 'aggiungi-sezione'){ return aggiungiSezione(); }

  const elSezione = btn.closest('[data-sezione]');
  const sectionId = elSezione && elSezione.dataset.sezione;

  if (azione === 'elimina-sezione') return eliminaSezione(sectionId);
  if (azione === 'sposta-sezione') return spostaSezione(sectionId, btn.dataset.dir);
  if (azione === 'aggiungi-voce') return aggiungiVoce(sectionId);

  const elVoce = btn.closest('[data-voce]');
  const itemId = elVoce && elVoce.dataset.voce;

  if (azione === 'elimina-voce') return eliminaVoce(sectionId, itemId);
  if (azione === 'sposta-voce') return spostaVoce(sectionId, itemId, btn.dataset.dir);
  if (azione === 'elimina-foto-scheda') return eliminaFotoScheda(itemId);

  const elFoto = btn.closest('[data-foto-indice]');
  const indiceFoto = elFoto ? Number(elFoto.dataset.fotoIndice) : null;
  if (azione === 'sposta-foto') return spostaFoto(sectionId, indiceFoto, btn.dataset.dir);
  if (azione === 'elimina-foto') return eliminaFoto(sectionId, indiceFoto);
}

/* ---------- AZIONI STRUTTURALI ---------- */
async function aggiungiSezione(){
  const titoloIt = window.prompt('Titolo della nuova sezione (italiano):', '');
  if (titoloIt === null) return;
  if (!titoloIt.trim()){ window.alert('Il titolo non può essere vuoto.'); return; }
  const titoloEn = window.prompt('Titolo della nuova sezione (inglese):', '') || titoloIt;
  const sectionId = MenuData.idUnico(titoloIt, 'sez', idUsatiAttuali());
  const nuovaSezione = { titolo:{it:titoloIt, en:titoloEn}, ordine:[] };
  const nuovoOrdine = (grezzo.gruppi[gruppoAttivo].ordine || []).concat(sectionId);
  try {
    await MenuData.aggiornaPercorsi({
      ['sezioni/'+sectionId]: nuovaSezione,
      ['gruppi/'+gruppoAttivo+'/ordine']: nuovoOrdine
    });
    grezzo.sezioni[sectionId] = nuovaSezione;
    grezzo.gruppi[gruppoAttivo].ordine = nuovoOrdine;
    registraLog('Nuova sezione creata', titoloIt + ' (' + NOMI_GRUPPO[gruppoAttivo] + ')');
    disegnaGruppo(gruppoAttivo);
  } catch(e){ window.alert('Errore: ' + e.message); }
}

async function eliminaSezione(sectionId){
  const sez = grezzo.sezioni[sectionId];
  const nomeSez = (sez.titolo && sez.titolo.it) || sectionId;
  if (!window.confirm('Spostare la sezione "'+nomeSez+'" e tutte le sue voci nel cestino?\nPotrai ripristinarla dalla scheda "Manutenzione" finché non svuoti il cestino.')) return;

  // Copia completa (sezione + voci) da salvare nel cestino prima di rimuoverla
  const vociComplete = {};
  (sez.ordine || []).forEach(id => { vociComplete[id] = grezzo.voci[id]; });

  try {
    /* Prima la copia di sicurezza nel cestino, POI la rimozione dai dati
       live: se la scrittura nel cestino fallisse (rete assente, ecc.),
       ci fermiamo qui e la sezione resta intatta — invece di rischiare
       di cancellarla dal menu pubblico senza che sia mai arrivata nel
       cestino. */
    await spostaNelCestino({ tipo:'sezione', gruppo:gruppoAttivo, id:sectionId, nome:nomeSez, dati:{ sezione:sez, voci:vociComplete } });

    const patch = { ['sezioni/'+sectionId]: null };
    (sez.ordine || []).forEach(id => { patch['voci/'+id] = null; });
    const nuovoOrdine = grezzo.gruppi[gruppoAttivo].ordine.filter(id => id !== sectionId);
    patch['gruppi/'+gruppoAttivo+'/ordine'] = nuovoOrdine;
    await MenuData.aggiornaPercorsi(patch);

    delete grezzo.sezioni[sectionId];
    (sez.ordine || []).forEach(id => delete grezzo.voci[id]);
    grezzo.gruppi[gruppoAttivo].ordine = nuovoOrdine;
    registraLog('Sezione spostata nel cestino', nomeSez + ' (' + NOMI_GRUPPO[gruppoAttivo] + ')');
    disegnaGruppo(gruppoAttivo);
  } catch(e){ window.alert('Errore: ' + e.message); }
}

async function spostaSezione(sectionId, dir){
  const ordine = grezzo.gruppi[gruppoAttivo].ordine;
  const i = ordine.indexOf(sectionId);
  const j = dir === 'su' ? i-1 : i+1;
  if (j < 0 || j >= ordine.length) return;
  [ordine[i], ordine[j]] = [ordine[j], ordine[i]];
  try {
    await MenuData.scriviPercorso('gruppi/'+gruppoAttivo+'/ordine', ordine);
    disegnaGruppo(gruppoAttivo);
  } catch(e){ window.alert('Errore: ' + e.message); }
}

/* ---------- AZIONI: MENÙ A PREZZO FISSO ---------- */
function idMenuFissiUsati(){ return new Set(Object.keys(grezzo.menuFissi || {})); }

/* Dopo aver aggiunto una riga vuota (menù/portata/voce), porta lo sguardo
   e il focus della tastiera direttamente lì: niente finestre popup da
   compilare a parte, si scrive subito nel campo appena creato. */
function focusNuovoElemento(selettore){
  requestAnimationFrame(() => {
    const el = document.querySelector(selettore);
    if (el){ el.scrollIntoView({ behavior:'smooth', block:'center' }); el.focus(); }
  });
}

async function aggiungiMenuFisso(){
  const id = MenuData.idUnico('nuovo-menu', 'mf', idMenuFissiUsati());
  const nuovoMenu = { nome:{it:'',en:''}, prezzo:'', descrizione:{it:'',en:''}, note:{it:'',en:''}, attivo:true, portate:[] };
  const nuovoOrdine = (grezzo.menuFissiOrdine||[]).concat(id);
  try {
    await MenuData.aggiornaPercorsi({ ['menuFissi/'+id]: nuovoMenu, ['menuFissiOrdine']: nuovoOrdine });
    grezzo.menuFissi[id] = nuovoMenu;
    grezzo.menuFissiOrdine = nuovoOrdine;
    registraLog('Nuovo menù a prezzo fisso creato', '(da nominare)');
    disegnaGruppo('menufissi');
    focusNuovoElemento('[data-menufisso="'+id+'"] input[data-campo="mf-nome-it"]');
  } catch(e){ window.alert('Errore: ' + e.message); }
}

async function eliminaMenuFisso(mfId){
  const mf = grezzo.menuFissi[mfId];
  const nome = (mf.nome && mf.nome.it) || mfId;
  if (!window.confirm('Spostare il menù "'+nome+'" nel cestino?\nPotrai ripristinarlo dalla scheda "Manutenzione" finché non svuoti il cestino.')) return;
  try {
    // Copia di sicurezza nel cestino PRIMA di rimuovere dai dati live (vedi eliminaSezione)
    await spostaNelCestino({ tipo:'menufisso', gruppo:'menufissi', id:mfId, nome, dati:{ menuFisso: mf } });

    const nuovoOrdine = (grezzo.menuFissiOrdine||[]).filter(id => id !== mfId);
    await MenuData.aggiornaPercorsi({ ['menuFissi/'+mfId]: null, ['menuFissiOrdine']: nuovoOrdine });

    delete grezzo.menuFissi[mfId];
    grezzo.menuFissiOrdine = nuovoOrdine;
    registraLog('Menù a prezzo fisso spostato nel cestino', nome);
    disegnaGruppo('menufissi');
  } catch(e){ window.alert('Errore: ' + e.message); }
}

async function spostaMenuFisso(mfId, dir){
  const ordine = grezzo.menuFissiOrdine || [];
  const i = ordine.indexOf(mfId);
  const j = dir === 'su' ? i-1 : i+1;
  if (j < 0 || j >= ordine.length) return;
  [ordine[i], ordine[j]] = [ordine[j], ordine[i]];
  try {
    await MenuData.scriviPercorso('menuFissiOrdine', ordine);
    disegnaGruppo('menufissi');
  } catch(e){ window.alert('Errore: ' + e.message); }
}

async function aggiungiPortata(mfId){
  const mf = grezzo.menuFissi[mfId];
  const nuovePortate = (mf.portate || []).concat([{ titolo:{it:'',en:''}, voci:[] }]);
  const indice = nuovePortate.length - 1;
  try {
    await MenuData.scriviPercorso('menuFissi/'+mfId+'/portate', nuovePortate);
    mf.portate = nuovePortate;
    disegnaGruppo('menufissi');
    focusNuovoElemento('[data-menufisso="'+mfId+'"] [data-portata="'+indice+'"] input[data-campo="portata-titolo-it"]');
  } catch(e){ window.alert('Errore: ' + e.message); }
}

async function eliminaPortata(mfId, indice){
  const mf = grezzo.menuFissi[mfId];
  if (!window.confirm('Eliminare questa portata e le voci al suo interno?')) return;
  const sblocca = bloccaCard(document.querySelector('[data-menufisso="'+mfId+'"]'));
  const nuovePortate = mf.portate.slice();
  nuovePortate.splice(indice, 1);
  try {
    await MenuData.scriviPercorso('menuFissi/'+mfId+'/portate', nuovePortate);
    mf.portate = nuovePortate;
    disegnaGruppo('menufissi');
  } catch(e){ window.alert('Errore: ' + e.message); sblocca(); }
}

async function spostaPortata(mfId, indice, dir){
  const mf = grezzo.menuFissi[mfId];
  const j = dir === 'su' ? indice-1 : indice+1;
  if (j < 0 || j >= mf.portate.length) return;
  const nuovePortate = mf.portate.slice();
  [nuovePortate[indice], nuovePortate[j]] = [nuovePortate[j], nuovePortate[indice]];
  try {
    await MenuData.scriviPercorso('menuFissi/'+mfId+'/portate', nuovePortate);
    mf.portate = nuovePortate;
    disegnaGruppo('menufissi');
  } catch(e){ window.alert('Errore: ' + e.message); }
}

async function aggiungiVocePortata(mfId, indicePortata){
  const mf = grezzo.menuFissi[mfId];
  const portata = mf.portate[indicePortata];
  const nuovePortate = mf.portate.slice();
  const nuoveVoci = (portata.voci || []).concat([{ nome:{it:'',en:''} }]);
  nuovePortate[indicePortata] = Object.assign({}, portata, { voci: nuoveVoci });
  const indiceVoce = nuoveVoci.length - 1;
  try {
    await MenuData.scriviPercorso('menuFissi/'+mfId+'/portate', nuovePortate);
    mf.portate = nuovePortate;
    disegnaGruppo('menufissi');
    focusNuovoElemento('[data-menufisso="'+mfId+'"] [data-portata="'+indicePortata+'"] [data-voce-portata="'+indiceVoce+'"] input[data-campo="vp-nome-it"]');
  } catch(e){ window.alert('Errore: ' + e.message); }
}

async function eliminaVocePortata(mfId, indicePortata, indiceVoce){
  const mf = grezzo.menuFissi[mfId];
  const portata = mf.portate[indicePortata];
  if (!window.confirm('Rimuovere questa voce dalla portata?')) return;
  const sblocca = bloccaCard(document.querySelector('[data-menufisso="'+mfId+'"]'));
  const nuovePortate = mf.portate.slice();
  const nuoveVoci = portata.voci.slice();
  nuoveVoci.splice(indiceVoce, 1);
  nuovePortate[indicePortata] = Object.assign({}, portata, { voci: nuoveVoci });
  try {
    await MenuData.scriviPercorso('menuFissi/'+mfId+'/portate', nuovePortate);
    mf.portate = nuovePortate;
    disegnaGruppo('menufissi');
  } catch(e){ window.alert('Errore: ' + e.message); sblocca(); }
}

async function spostaVocePortata(mfId, indicePortata, indiceVoce, dir){
  const mf = grezzo.menuFissi[mfId];
  const portata = mf.portate[indicePortata];
  const j = dir === 'su' ? indiceVoce-1 : indiceVoce+1;
  if (j < 0 || j >= portata.voci.length) return;
  const nuovePortate = mf.portate.slice();
  const nuoveVoci = portata.voci.slice();
  [nuoveVoci[indiceVoce], nuoveVoci[j]] = [nuoveVoci[j], nuoveVoci[indiceVoce]];
  nuovePortate[indicePortata] = Object.assign({}, portata, { voci: nuoveVoci });
  try {
    await MenuData.scriviPercorso('menuFissi/'+mfId+'/portate', nuovePortate);
    mf.portate = nuovePortate;
    disegnaGruppo('menufissi');
  } catch(e){ window.alert('Errore: ' + e.message); }
}

async function aggiungiVoce(sectionId){
  const nomeIt = window.prompt('Nome della nuova voce (italiano):', '');
  if (nomeIt === null) return;
  if (!nomeIt.trim()){ window.alert('Il nome non può essere vuoto.'); return; }
  const nomeEn = window.prompt('Nome della nuova voce (inglese):', '') || nomeIt;
  const sez = grezzo.sezioni[sectionId];
  const itemId = MenuData.idUnico(nomeIt, 'voce', idUsatiAttuali());
  const nuovaVoce = { nome:{it:nomeIt, en:nomeEn} };
  if (sez.tabella) nuovaVoce.prezzi = (sez.colonne||[]).map(()=>'');
  else nuovaVoce.prezzo = '';
  if (gruppoAttivo === 'piatti'){ nuovaVoce.giorniNonDisponibiliPranzo = null; nuovaVoce.allergeni = []; }
  if (gruppoAttivo === 'vini' || gruppoAttivo === 'birre'){ nuovaVoce.scheda = { descrizione:{it:'',en:''} }; nuovaVoce.disponibile = true; }
  const nuovoOrdine = (sez.ordine || []).concat(itemId);
  try {
    await MenuData.aggiornaPercorsi({
      ['voci/'+itemId]: nuovaVoce,
      ['sezioni/'+sectionId+'/ordine']: nuovoOrdine
    });
    grezzo.voci[itemId] = nuovaVoce;
    sez.ordine = nuovoOrdine;
    registraLog('Nuova voce creata', nomeIt + ' (' + NOMI_GRUPPO[gruppoAttivo] + ')');
    disegnaGruppo(gruppoAttivo);
  } catch(e){ window.alert('Errore: ' + e.message); }
}

async function eliminaVoce(sectionId, itemId){
  const sez = grezzo.sezioni[sectionId];
  const voceOriginale = grezzo.voci[itemId];
  const nomeVoce = (voceOriginale.nome && voceOriginale.nome.it) || itemId;
  if (!window.confirm('Spostare "'+nomeVoce+'" nel cestino?\nPotrai ripristinarla dalla scheda "Manutenzione" finché non svuoti il cestino.')) return;
  const posizione = sez.ordine.indexOf(itemId);
  try {
    // Copia di sicurezza nel cestino PRIMA di rimuovere dai dati live (vedi eliminaSezione)
    await spostaNelCestino({ tipo:'voce', gruppo:gruppoAttivo, id:itemId, nome:nomeVoce, dati:{ voce:voceOriginale, sectionId, posizione } });

    const nuovoOrdine = sez.ordine.filter(id => id !== itemId);
    await MenuData.aggiornaPercorsi({
      ['voci/'+itemId]: null,
      ['sezioni/'+sectionId+'/ordine']: nuovoOrdine
    });

    delete grezzo.voci[itemId];
    sez.ordine = nuovoOrdine;
    registraLog('Voce spostata nel cestino', nomeVoce + ' (' + NOMI_GRUPPO[gruppoAttivo] + ')');
    disegnaGruppo(gruppoAttivo);
  } catch(e){ window.alert('Errore: ' + e.message); }
}

async function spostaVoce(sectionId, itemId, dir){
  const sez = grezzo.sezioni[sectionId];
  const i = sez.ordine.indexOf(itemId);
  const j = dir === 'su' ? i-1 : i+1;
  if (j < 0 || j >= sez.ordine.length) return;
  [sez.ordine[i], sez.ordine[j]] = [sez.ordine[j], sez.ordine[i]];
  try {
    await MenuData.scriviPercorso('sezioni/'+sectionId+'/ordine', sez.ordine);
    disegnaGruppo(gruppoAttivo);
  } catch(e){ window.alert('Errore: ' + e.message); }
}

/* ---------- FOTO SEZIONE (storytelling) ---------- */
async function caricaFotoSezione(sectionId, inputFile){
  const file = inputFile.files && inputFile.files[0];
  if (!file) return;
  const statoEl = inputFile.closest('.mg-foto-sezione').querySelector('.mg-stato-upload');
  statoEl.textContent = 'Caricamento in corso…';
  try {
    const percorso = 'menu-foto/sezioni/' + sectionId + '/' + Date.now() + '.jpg';
    const url = await caricaSuCloudinary(file, percorso);
    const sez = grezzo.sezioni[sectionId];
    sez.foto = sez.foto || { imgs:[], didascalie:[] };
    sez.foto.imgs.push(url);
    sez.foto.didascalie.push({ it:'', en:'' });
    await MenuData.scriviPercorso('sezioni/'+sectionId+'/foto', sez.foto);
    disegnaGruppo(gruppoAttivo);
  } catch(e){
    statoEl.textContent = '✗ ' + e.message;
  } finally {
    inputFile.value = '';
  }
}
/* Blocca temporaneamente tutti i pulsanti azione dentro una "card"
   (una sezione, o un menù a prezzo fisso) durante un'operazione che
   dipende da una POSIZIONE numerica nell'array (foto, portate, voci di
   portata) invece che da un id stabile: se un'altra eliminazione sulla
   stessa lista partisse nel frattempo, la posizione catturata al click
   diventerebbe sbagliata. Il ridisegno a operazione riuscita sostituisce
   comunque tutto; sbloccaCard() serve solo per il caso di errore o
   annullamento, quando il ridisegno non arriva. */
function bloccaCard(el){
  if (!el) return () => {};
  const bottoni = Array.from(el.querySelectorAll('[data-azione]'));
  bottoni.forEach(b => { b.disabled = true; });
  return () => bottoni.forEach(b => { b.disabled = false; });
}

async function spostaFoto(sectionId, indice, dir){
  const sez = grezzo.sezioni[sectionId];
  const j = dir === 'su' ? indice-1 : indice+1;
  if (j < 0 || j >= sez.foto.imgs.length) return;
  [sez.foto.imgs[indice], sez.foto.imgs[j]] = [sez.foto.imgs[j], sez.foto.imgs[indice]];
  const d = sez.foto.didascalie || [];
  [d[indice], d[j]] = [d[j], d[indice]];
  try {
    await MenuData.scriviPercorso('sezioni/'+sectionId+'/foto', sez.foto);
    disegnaGruppo(gruppoAttivo);
  } catch(e){ window.alert('Errore: ' + e.message); }
}
async function eliminaFoto(sectionId, indice){
  if (!window.confirm('Rimuovere questa foto dalla sezione? (il file resta su Cloudinary, va eliminato manualmente dalla Media Library se non serve più)')) return;
  const sblocca = bloccaCard(document.querySelector('[data-sezione="'+sectionId+'"]'));
  const sez = grezzo.sezioni[sectionId];
  sez.foto.imgs.splice(indice, 1);
  (sez.foto.didascalie||[]).splice(indice, 1);
  try {
    await MenuData.scriviPercorso('sezioni/'+sectionId+'/foto', sez.foto);
    disegnaGruppo(gruppoAttivo); // sostituisce il DOM: rende sblocca() superfluo, ma innocuo
  } catch(e){ window.alert('Errore: ' + e.message); sblocca(); }
}

/* ---------- FOTO SCHEDA TECNICA (vino/birra) ---------- */
async function caricaFotoScheda(itemId, inputFile){
  const file = inputFile.files && inputFile.files[0];
  if (!file) return;
  const statoEl = inputFile.closest('.mg-scheda-foto').querySelector('.mg-stato-upload');
  statoEl.textContent = 'Caricamento in corso…';
  try {
    const percorso = 'menu-foto/schede/' + itemId + '/' + Date.now() + '.jpg'; // ogni caricamento crea un file nuovo (gli unsigned preset Cloudinary non possono sovrascrivere)
    const url = await caricaSuCloudinary(file, percorso, 1200, 0.85);
    const voce = grezzo.voci[itemId];
    voce.scheda = voce.scheda || {};
    voce.scheda.foto = url;
    await MenuData.scriviPercorso('voci/'+itemId+'/scheda/foto', url);
    disegnaGruppo(gruppoAttivo);
  } catch(e){
    statoEl.textContent = '✗ ' + e.message;
  } finally {
    inputFile.value = '';
  }
}
async function eliminaFotoScheda(itemId){
  const voce = grezzo.voci[itemId];
  voce.scheda = voce.scheda || {};
  voce.scheda.foto = null;
  try {
    await MenuData.scriviPercorso('voci/'+itemId+'/scheda/foto', null);
    disegnaGruppo(gruppoAttivo);
  } catch(e){ window.alert('Errore: ' + e.message); }
}

/* ---------- MIGRAZIONE UNA TANTUM DAI DATI STATICI ---------- */
function costruisciAlberoDaStatico(){
  /* Legge sempre i dati statici ORIGINALI: menu-data.js li mette da
     parte in window._menuStaticoOriginale prima di eventualmente
     sovrascrivere piattiData/viniData/ecc. con quelli letti da
     Firebase, così questo pulsante funziona correttamente anche se
     lanciato dopo che il sito ha già letto un menu da Firebase. */
  const orig = window._menuStaticoOriginale || {
    piattiData: window.piattiData, viniData: window.viniData, birreData: window.birreData,
    schedeVini: window.schedeVini, schedeBirre: window.schedeBirre, immaginiSezioni: window.immaginiSezioni
  };
  const idUsati = new Set();
  const albero = alberoVuoto();
  albero.coperto = { it: orig.piattiData.it.coperto || '', en: orig.piattiData.en.coperto || '' };
  albero.nota = { it: orig.piattiData.it.nota || [], en: orig.piattiData.en.nota || [] };

  const IDS_PER_TIPO = { piatti:['antipasti','primi','secondi-brace','secondi','contorni','dessert'], vini:['vini'], birre:['birre'] };
  function trovaFoto(titoloIt, gruppo){
    const t = (titoloIt||'').toLowerCase();
    const permessi = IDS_PER_TIPO[gruppo];
    return (orig.immaginiSezioni||[]).find(m => permessi.includes(m.id) && m.chiavi.some(k=>t.includes(k)));
  }
  const fotoGiaUsate = {};

  ['piatti','vini','birre'].forEach(gruppo=>{
    const dataset = { piatti: orig.piattiData, vini: orig.viniData, birre: orig.birreData }[gruppo];
    const sezIt = dataset.it.sezioni || [];
    const sezEn = dataset.en.sezioni || [];

    sezIt.forEach((sezIT, iSez)=>{
      const sezEN = sezEn[iSez] || sezIT;
      const sectionId = MenuData.idUnico(sezIT.titolo, 'sez', idUsati);
      const sezioneAlbero = { titolo:{it:sezIT.titolo, en:sezEN.titolo}, ordine:[] };
      if (sezIT.tabella){ sezioneAlbero.tabella = true; sezioneAlbero.colonne = sezIT.colonne || []; }

      const mappaFoto = trovaFoto(sezIT.titolo, gruppo);
      if (mappaFoto && !fotoGiaUsate[mappaFoto.id]){
        fotoGiaUsate[mappaFoto.id] = true;
        sezioneAlbero.foto = {
          imgs: (mappaFoto.imgs||[]).slice(),
          didascalie: (mappaFoto.didascalie||[]).map(d=>({it:d.it||'', en:d.en||''}))
        };
      }

      (sezIT.items||[]).forEach((itIT, iVoce)=>{
        const itEN = (sezEN.items && sezEN.items[iVoce]) || itIT;
        const nomeIT = itIT[0], nomeEN = itEN[0];
        const itemId = MenuData.idUnico(nomeIT, 'voce', idUsati);
        const voce = { nome:{it:nomeIT, en:nomeEN} };
        if (sezIT.tabella){
          voce.prezzi = itIT[1] || [];
        } else if (gruppo === 'piatti'){
          voce.prezzo = itIT[1] || '';
          voce.giorniNonDisponibiliPranzo = (itIT[2] !== undefined ? itIT[2] : null);
          voce.allergeni = itIT[3] || [];
        } else {
          voce.prezzo = itIT[1] || '';
        }
        if (gruppo === 'vini' || gruppo === 'birre'){
          const archivio = gruppo === 'vini' ? orig.schedeVini : orig.schedeBirre;
          const scheda = archivio[nomeIT];
          if (scheda){
            const s = { descrizione: { it:(scheda.it&&scheda.it.descrizione)||'', en:(scheda.en&&scheda.en.descrizione)||'' } };
            if (scheda.foto) s.foto = scheda.foto;
            if (gruppo === 'vini'){
              s.zona = { it:(scheda.it&&scheda.it.zona)||'', en:(scheda.en&&scheda.en.zona)||'' };
              s.vitigno = { it:(scheda.it&&scheda.it.vitigno)||'', en:(scheda.en&&scheda.en.vitigno)||'' };
            } else {
              s.birrificio = { it:(scheda.it&&scheda.it.birrificio)||'', en:(scheda.en&&scheda.en.birrificio)||'' };
              s.stile = { it:(scheda.it&&scheda.it.stile)||'', en:(scheda.en&&scheda.en.stile)||'' };
            }
            voce.scheda = s;
          }
        }
        albero.voci[itemId] = voce;
        sezioneAlbero.ordine.push(itemId);
      });

      albero.sezioni[sectionId] = sezioneAlbero;
      albero.gruppi[gruppo].ordine.push(sectionId);
    });
  });

  return albero;
}

async function eseguiMigrazione(){
  const stato = document.getElementById('mg-stato-importazione');
  stato.textContent = '';
  let esistente = null;
  try { esistente = await MenuData.leggiMenuGrezzo(); }
  catch(e){ stato.textContent = '✗ Errore di lettura: ' + e.message; return; }

  const nonVuoto = esistente && ((Object.keys(esistente.sezioni||{}).length) || (Object.keys(esistente.voci||{}).length));
  if (nonVuoto){
    const conferma = window.prompt('Attenzione: su Firebase risultano già dati del menu (probabilmente già modificati dal pannello admin). Per SOVRASCRIVERLI con i dati statici del sito, scrivi qui sotto esattamente:\nSOVRASCRIVI');
    if (conferma !== 'SOVRASCRIVI'){ stato.textContent = 'Importazione annullata.'; return; }
  } else {
    if (!window.confirm('Importare i dati statici attuali del sito su Firebase? È un\'operazione da fare una sola volta, prima di iniziare a modificare il menu da qui.')) return;
  }

  stato.textContent = 'Importazione in corso…';
  try {
    const albero = costruisciAlberoDaStatico();
    await MenuData.scriviPercorso('', albero);
    grezzo = albero;
    stato.textContent = '✓ Importazione completata.';
    registraLog('Importazione dati statici completata', '');
    disegnaGruppo(gruppoAttivo);
  } catch(e){
    stato.textContent = '✗ Errore: ' + e.message;
  }
}

/* =========================================================
   PANNELLO MANUTENZIONE — backup manuale, cestino, registro modifiche
   ========================================================= */
function formattaData(ms){
  try { return new Date(ms).toLocaleString('it-IT', { dateStyle:'short', timeStyle:'short' }); }
  catch(e){ return String(ms); }
}

async function disegnaManutenzione(){
  const [cestino, log] = await Promise.all([leggiCestino(), leggiLog()]);
  const vociCestino = Object.entries(cestino).sort((a,b)=>(b[1].quando||0)-(a[1].quando||0));
  const vociLog = Object.entries(log).sort((a,b)=>(b[1].quando||0)-(a[1].quando||0)).slice(0,50);

  contenitoreManutenzione.innerHTML = `
    <div class="pannello">
      <h2>Backup manuale</h2>
      <p>Scarica una copia completa del menu attuale in un file: tienila da parte come sicurezza prima di modifiche importanti. Puoi ripristinarla in qualsiasi momento da qui, su questo o su un altro dispositivo.</p>
      <button type="button" class="mg-bottone-secondario" data-azione="scarica-backup">⬇️ Scarica backup (JSON)</button>
      <label class="mg-upload">⬆️ Ripristina da backup<input type="file" accept="application/json" data-azione="carica-backup" hidden></label>
      <p id="mnt-stato-backup" class="mg-stato"></p>
    </div>

    <div class="pannello">
      <h2>Cestino ${vociCestino.length ? '('+vociCestino.length+')' : ''}</h2>
      <p class="mg-nota-mini">Le sezioni e le voci eliminate finiscono qui invece di sparire subito per sempre: puoi ripristinarle finché non svuoti il cestino.</p>
      ${vociCestino.length ? '<button type="button" class="mg-elimina" data-azione="svuota-cestino">Svuota cestino definitivamente</button>' : ''}
      <div class="mnt-lista">
        ${vociCestino.length ? vociCestino.map(([id,v])=>htmlVoceCestino(id,v)).join('') : '<p class="vuoto-mini">Il cestino è vuoto.</p>'}
      </div>
    </div>

    <div class="pannello">
      <h2>Registro modifiche <span class="mg-nota-mini">(ultime 50)</span></h2>
      <ul class="mnt-log-lista">
        ${vociLog.length ? vociLog.map(([id,v])=>htmlRigaLog(v)).join('') : '<li class="vuoto-mini">Nessuna modifica registrata.</li>'}
      </ul>
    </div>
  `;
}

function htmlVoceCestino(id, v){
  const data = formattaData(v.quando);
  const tipoLabel = v.tipo === 'sezione' ? 'Sezione' : (v.tipo === 'menufisso' ? 'Menù fisso' : 'Voce');
  return `<div class="mnt-cestino-riga" data-cestino="${id}">
    <div class="mnt-cestino-info">
      <strong>${escHtml(v.nome)}</strong>
      <span class="mg-nota-mini">${tipoLabel} · ${escHtml(NOMI_GRUPPO[v.gruppo]||v.gruppo)} · eliminata il ${data} da ${escHtml(v.da||'sconosciuto')}</span>
    </div>
    <div class="mnt-cestino-azioni">
      <button type="button" class="mg-bottone-secondario" data-azione="ripristina-cestino">Ripristina</button>
      <button type="button" class="mg-elimina" data-azione="elimina-cestino-singolo">Elimina definitivamente</button>
    </div>
  </div>`;
}
function htmlRigaLog(v){
  const data = formattaData(v.quando);
  return `<li><span class="mnt-log-quando">${data}</span> — <strong>${escHtml(v.chi)}</strong>: ${escHtml(v.azione)}${v.dettaglio ? ' — '+escHtml(v.dettaglio) : ''}</li>`;
}

let _listenerManutenzioneAttaccati = false;
function attaccaListenerManutenzione(){
  if (_listenerManutenzioneAttaccati) return;
  _listenerManutenzioneAttaccati = true;
  contenitoreManutenzione.addEventListener('click', gestisciClickManutenzione);
  contenitoreManutenzione.addEventListener('change', gestisciChangeManutenzione);
}
async function gestisciClickManutenzione(e){
  const btn = e.target.closest('[data-azione]');
  if (!btn) return;
  const azione = btn.dataset.azione;

  if (azione === 'scarica-backup') return scaricaBackup();

  if (azione === 'svuota-cestino') return svuotaCestino();

  if (azione === 'ripristina-cestino'){
    const riga = btn.closest('[data-cestino]');
    const id = riga.dataset.cestino;
    btn.disabled = true;
    try {
      const cestino = await leggiCestino();
      const voce = cestino[id];
      if (voce) await ripristinaDalCestino(id, voce); // gestisce già da sé errori e ridisegno
      else { window.alert('Questo elemento non è più nel cestino (forse già ripristinato da un\'altra sessione).'); disegnaManutenzione(); }
    } finally { btn.disabled = false; }
    return;
  }
  if (azione === 'elimina-cestino-singolo'){
    if (!window.confirm('Eliminare definitivamente questo elemento dal cestino? Non si può annullare (eventuali foto associate restano comunque su Storage).')) return;
    const riga = btn.closest('[data-cestino]');
    btn.disabled = true;
    try {
      await rimuoviDalCestino(riga.dataset.cestino);
      disegnaManutenzione();
    } catch(e){
      window.alert('Errore nell\'eliminazione: ' + e.message);
      btn.disabled = false;
    }
  }
}
function gestisciChangeManutenzione(e){
  if (e.target.dataset.azione === 'carica-backup') caricaBackup(e.target);
}

/* ---- Ripristino dal cestino ---- */
async function ripristinaDalCestino(pushId, voce){
  try {
    if (voce.tipo === 'sezione'){
      const { sezione, voci } = voce.dati;
      const patch = { ['sezioni/'+voce.id]: sezione };
      Object.keys(voci||{}).forEach(id => { patch['voci/'+id] = voci[id]; });
      const gruppoEsiste = grezzo.gruppi[voce.gruppo] || (grezzo.gruppi[voce.gruppo] = { ordine:[] });
      const nuovoOrdine = (gruppoEsiste.ordine || []).concat(voce.id);
      patch['gruppi/'+voce.gruppo+'/ordine'] = nuovoOrdine;
      await MenuData.aggiornaPercorsi(patch);
      grezzo.sezioni[voce.id] = sezione;
      Object.keys(voci||{}).forEach(id => { grezzo.voci[id] = voci[id]; });
      grezzo.gruppi[voce.gruppo].ordine = nuovoOrdine;
      await rimuoviDalCestino(pushId);
      registraLog('Sezione ripristinata dal cestino', voce.nome + ' (' + NOMI_GRUPPO[voce.gruppo] + ')');
      window.alert('Sezione ripristinata in fondo all\'elenco "'+NOMI_GRUPPO[voce.gruppo]+'". Usa le frecce ▲▼ nella scheda "Gestisci menu" per riposizionarla.');
    } else if (voce.tipo === 'menufisso'){
      const { menuFisso } = voce.dati;
      const nuovoOrdine = (grezzo.menuFissiOrdine || []).concat(voce.id);
      await MenuData.aggiornaPercorsi({
        ['menuFissi/'+voce.id]: menuFisso,
        ['menuFissiOrdine']: nuovoOrdine
      });
      grezzo.menuFissi[voce.id] = menuFisso;
      grezzo.menuFissiOrdine = nuovoOrdine;
      await rimuoviDalCestino(pushId);
      registraLog('Menù a prezzo fisso ripristinato dal cestino', voce.nome);
      window.alert('Menù ripristinato in fondo all\'elenco. Usa le frecce ▲▼ nella scheda "Gestisci menu" → "Menù fissi" per riposizionarlo.');
    } else {
      const { voce: datiVoce, sectionId } = voce.dati;
      if (!grezzo.sezioni[sectionId]){
        window.alert('La sezione originale non esiste più (forse anch\'essa nel cestino): ripristina prima quella, poi riprova con questa voce.');
        return;
      }
      const sez = grezzo.sezioni[sectionId];
      const nuovoOrdine = (sez.ordine || []).concat(voce.id);
      await MenuData.aggiornaPercorsi({
        ['voci/'+voce.id]: datiVoce,
        ['sezioni/'+sectionId+'/ordine']: nuovoOrdine
      });
      grezzo.voci[voce.id] = datiVoce;
      sez.ordine = nuovoOrdine;
      await rimuoviDalCestino(pushId);
      registraLog('Voce ripristinata dal cestino', voce.nome + ' (' + NOMI_GRUPPO[voce.gruppo] + ')');
    }
    disegnaManutenzione();
  } catch(e){ window.alert('Errore nel ripristino: ' + e.message); }
}
async function svuotaCestino(){
  if (!window.confirm('Eliminare DEFINITIVAMENTE tutti gli elementi nel cestino? Non si può annullare (eventuali foto associate restano comunque su Cloudinary, da rimuovere manualmente se non servono più).')) return;
  try {
    await dbRemove(dbRef(MenuData.db(), 'cestino'));
    registraLog('Cestino svuotato', '');
    disegnaManutenzione();
  } catch(e){ window.alert('Errore: ' + e.message); }
}

/* ---- Backup: esportazione / importazione ---- */
function scaricaBackup(){
  const dati = JSON.stringify(grezzo, null, 2);
  const blob = new Blob([dati], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const oggi = new Date().toISOString().slice(0,10);
  a.href = url; a.download = 'backup-menu-'+oggi+'.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  registraLog('Backup scaricato', '');
}
async function caricaBackup(inputFile){
  const file = inputFile.files && inputFile.files[0];
  if (!file) return;
  const stato = document.getElementById('mnt-stato-backup');
  try {
    const testo = await file.text();
    const dati = JSON.parse(testo);
    if (!dati || typeof dati !== 'object' || !dati.sezioni || !dati.voci || !dati.gruppi){
      throw new Error('il file non sembra un backup valido di questo menu.');
    }
    const conferma = window.prompt('Questo SOSTITUIRÀ interamente il menu attuale su Firebase con il contenuto del file caricato.\nPer confermare, scrivi qui sotto esattamente:\nRIPRISTINA');
    if (conferma !== 'RIPRISTINA'){ stato.textContent = 'Ripristino annullato.'; return; }
    stato.textContent = 'Ripristino in corso…';
    await MenuData.scriviPercorso('', dati);
    grezzo = dati;
    stato.textContent = '✓ Backup ripristinato.';
    registraLog('Backup ripristinato da file', file.name);
  } catch(e){
    stato.textContent = '✗ Errore: ' + e.message;
  } finally {
    inputFile.value = '';
  }
}
