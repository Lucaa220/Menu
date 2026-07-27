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

import { getStorage, ref as storageRef, uploadBytes, getDownloadURL }
  from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { MenuData } from "./menu-data.js";

const GIORNI = [
  { c:'lun', l:'Lun' }, { c:'mar', l:'Mar' }, { c:'mer', l:'Mer' },
  { c:'gio', l:'Gio' }, { c:'ven', l:'Ven' }, { c:'sab', l:'Sab' }, { c:'dom', l:'Dom' }
];
const NOMI_GRUPPO = { piatti:'Piatti', vini:'Vini', birre:'Birre' };

let contenitore = null;
let grezzo = null;          // albero grezzo in memoria (cache locale, rispecchia Firebase)
let gruppoAttivo = 'piatti';

/* ---------- ALBERO VUOTO (prima di ogni migrazione) ---------- */
function alberoVuoto(){
  return {
    coperto: { it:'', en:'' },
    nota: { it:[], en:[] },
    gruppi: { piatti:{ordine:[]}, vini:{ordine:[]}, birre:{ordine:[]} },
    sezioni: {},
    voci: {}
  };
}

/* ---------- AVVIO (chiamato da admin.js al primo click sulla scheda) ---------- */
window.avviaAdminMenu = async function avviaAdminMenu(){
  contenitore = document.getElementById('tab-gestisci-menu');
  if (!contenitore) return;
  contenitore.innerHTML = '<p class="loading">Caricamento menu…</p>';
  try {
    grezzo = (await MenuData.leggiMenuGrezzo()) || alberoVuoto();
  } catch(e){
    contenitore.innerHTML = '<p class="vuoto">Errore di lettura da Firebase: ' + escHtml(e.message) + '</p>';
    return;
  }
  disegna();
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

/* ---------- STORAGE: compressione lato client + upload ---------- */
let _storage = null;
function storage(){
  if (_storage) return _storage;
  const app = MenuData.app();
  if (!app) return null;
  try { _storage = getStorage(app); } catch(e){ console.warn('[admin-menu] Storage non disponibile:', e.message); }
  return _storage;
}
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
async function caricaSuStorage(file, percorso, latoMax, qualita){
  const blob = await comprimiImmagine(file, latoMax, qualita);
  const st = storage();
  if (!st) throw new Error('Firebase Storage non disponibile (vedi ISTRUZIONI-FIREBASE.md).');
  const rif = storageRef(st, percorso);
  await uploadBytes(rif, blob, { contentType:'image/jpeg' });
  return await getDownloadURL(rif);
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

  return `<div class="mg-voce" data-voce="${itemId}">
    <div class="mg-voce-testa">
      <div class="mg-frecce">
        <button type="button" data-azione="sposta-voce" data-dir="su" ${i===0?'disabled':''}>▲</button>
        <button type="button" data-azione="sposta-voce" data-dir="giu" ${i===totale-1?'disabled':''}>▼</button>
      </div>
      <input type="text" data-campo="nome-it" placeholder="Nome (italiano)" value="${escHtml(nome.it)}">
      <input type="text" data-campo="nome-en" placeholder="Nome (inglese)" value="${escHtml(nome.en)}">
      ${prezziHtml}
      <button type="button" class="mg-elimina" data-azione="elimina-voce">Elimina</button>
    </div>
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

async function gestisciClick(e){
  const btn = e.target.closest('[data-azione]');
  if (!btn) return;
  const azione = btn.dataset.azione;
  if (azione === 'carica-foto' || azione === 'carica-foto-scheda') return; // gestiti da 'change' sull'input file

  if (azione === 'cambia-gruppo'){ disegnaGruppo(btn.dataset.gruppo); return; }
  if (azione === 'importa'){ return eseguiMigrazione(); }

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
    disegnaGruppo(gruppoAttivo);
  } catch(e){ window.alert('Errore: ' + e.message); }
}

async function eliminaSezione(sectionId){
  if (!window.confirm('Eliminare questa sezione e tutte le voci al suo interno? Non si può annullare.')) return;
  const sez = grezzo.sezioni[sectionId];
  const patch = { ['sezioni/'+sectionId]: null };
  (sez.ordine || []).forEach(id => { patch['voci/'+id] = null; });
  const nuovoOrdine = grezzo.gruppi[gruppoAttivo].ordine.filter(id => id !== sectionId);
  patch['gruppi/'+gruppoAttivo+'/ordine'] = nuovoOrdine;
  try {
    await MenuData.aggiornaPercorsi(patch);
    delete grezzo.sezioni[sectionId];
    (sez.ordine || []).forEach(id => delete grezzo.voci[id]);
    grezzo.gruppi[gruppoAttivo].ordine = nuovoOrdine;
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
  if (gruppoAttivo === 'vini' || gruppoAttivo === 'birre') nuovaVoce.scheda = { descrizione:{it:'',en:''} };
  const nuovoOrdine = (sez.ordine || []).concat(itemId);
  try {
    await MenuData.aggiornaPercorsi({
      ['voci/'+itemId]: nuovaVoce,
      ['sezioni/'+sectionId+'/ordine']: nuovoOrdine
    });
    grezzo.voci[itemId] = nuovaVoce;
    sez.ordine = nuovoOrdine;
    disegnaGruppo(gruppoAttivo);
  } catch(e){ window.alert('Errore: ' + e.message); }
}

async function eliminaVoce(sectionId, itemId){
  if (!window.confirm('Eliminare questa voce? Non si può annullare.')) return;
  const sez = grezzo.sezioni[sectionId];
  const nuovoOrdine = sez.ordine.filter(id => id !== itemId);
  try {
    await MenuData.aggiornaPercorsi({
      ['voci/'+itemId]: null,
      ['sezioni/'+sectionId+'/ordine']: nuovoOrdine
    });
    delete grezzo.voci[itemId];
    sez.ordine = nuovoOrdine;
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
    const url = await caricaSuStorage(file, percorso);
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
  if (!window.confirm('Rimuovere questa foto dalla sezione? (il file resta su Firebase Storage, va eliminato manualmente dalla console se non serve più)')) return;
  const sez = grezzo.sezioni[sectionId];
  sez.foto.imgs.splice(indice, 1);
  (sez.foto.didascalie||[]).splice(indice, 1);
  try {
    await MenuData.scriviPercorso('sezioni/'+sectionId+'/foto', sez.foto);
    disegnaGruppo(gruppoAttivo);
  } catch(e){ window.alert('Errore: ' + e.message); }
}

/* ---------- FOTO SCHEDA TECNICA (vino/birra) ---------- */
async function caricaFotoScheda(itemId, inputFile){
  const file = inputFile.files && inputFile.files[0];
  if (!file) return;
  const statoEl = inputFile.closest('.mg-scheda-foto').querySelector('.mg-stato-upload');
  statoEl.textContent = 'Caricamento in corso…';
  try {
    const percorso = 'menu-foto/schede/' + itemId + '.jpg'; // percorso fisso: sostituisce l'eventuale foto precedente
    const url = await caricaSuStorage(file, percorso, 1200, 0.85);
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
    disegnaGruppo(gruppoAttivo);
  } catch(e){
    stato.textContent = '✗ Errore: ' + e.message;
  }
}