/* =========================================================
   Trattoria da Franca — Dashboard admin (statistiche)
   Login con Firebase Auth (email/password).
   Legge stats/giornaliero/{YYYY-MM-DD} e aggrega lato client.
   ========================================================= */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getDatabase, ref, get, query, orderByKey, startAt, endAt }
  from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const cfg = window.FIREBASE_CONFIG;
if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith("INSERISCI_")) {
  document.body.innerHTML =
    '<div style="padding:40px;color:#faf5ec;font-family:Georgia,serif;text-align:center">' +
    '<h1>Firebase non configurato</h1>' +
    '<p>Compila <code>firebase-config.js</code> con i dati del progetto.</p></div>';
  throw new Error("Firebase non configurato");
}

/* Riusa l'app di default se già inizializzata da firebase-init.js,
   invece di richiamare initializeApp() una seconda volta (altrimenti
   Firebase genera l'errore "app/duplicate-app"). */
const app  = getApps().length ? getApp() : initializeApp(cfg);
const auth = getAuth(app);
const db   = getDatabase(app);

/* ---------- ELEMENTI ---------- */
const loginView = document.getElementById('login-view');
const dashView  = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const loginErr  = document.getElementById('login-err');
const btnLogout = document.getElementById('btn-logout');

/* ---------- SCHEDE (Statistiche / Gestisci menu / Manutenzione) ---------- */
const tabBtnStat = document.getElementById('dash-tab-stat');
const tabBtnMenu = document.getElementById('dash-tab-menu');
const tabBtnManutenzione = document.getElementById('dash-tab-manutenzione');
const tabStat = document.getElementById('tab-statistiche');
const tabMenu = document.getElementById('tab-gestisci-menu');
const tabManutenzione = document.getElementById('tab-manutenzione');
let menuAdminAvviato = false;
let manutenzioneAvviata = false;
function mostraScheda(nome){
  if (tabBtnStat) tabBtnStat.classList.toggle('attivo', nome==='stat');
  if (tabBtnMenu) tabBtnMenu.classList.toggle('attivo', nome==='menu');
  if (tabBtnManutenzione) tabBtnManutenzione.classList.toggle('attivo', nome==='manutenzione');
  if (tabStat) tabStat.style.display = nome==='stat' ? '' : 'none';
  if (tabMenu) tabMenu.style.display = nome==='menu' ? '' : 'none';
  if (tabManutenzione) tabManutenzione.style.display = nome==='manutenzione' ? '' : 'none';

  if (nome==='menu' && !menuAdminAvviato){
    menuAdminAvviato = true;
    /* admin-menu.js espone questa funzione globale quando il suo modulo
       viene eseguito: costruisce l'interfaccia "Gestisci menu" al primo
       utilizzo, per non appesantire il caricamento della dashboard
       statistiche quando non serve. Nel caso (raro) in cui il modulo
       non abbia ancora finito di caricarsi, riprova per un paio di
       secondi invece di fallire silenziosamente. */
    let tentativi = 0;
    (function avviaQuandoPronto(){
      if (typeof window.avviaAdminMenu === 'function') { window.avviaAdminMenu(db, auth); return; }
      if (tentativi++ > 40) { tabMenu.innerHTML = '<p class="vuoto">Impossibile caricare il pannello di gestione menu (admin-menu.js). Ricarica la pagina.</p>'; return; }
      setTimeout(avviaQuandoPronto, 100);
    })();
  }
  if (nome==='manutenzione' && !manutenzioneAvviata){
    manutenzioneAvviata = true;
    let tentativi = 0;
    (function avviaQuandoPronto(){
      if (typeof window.avviaAdminManutenzione === 'function') { window.avviaAdminManutenzione(); return; }
      if (tentativi++ > 40) { tabManutenzione.innerHTML = '<p class="vuoto">Impossibile caricare il pannello di manutenzione (admin-menu.js). Ricarica la pagina.</p>'; return; }
      setTimeout(avviaQuandoPronto, 100);
    })();
  }
}
if (tabBtnStat) tabBtnStat.addEventListener('click', () => mostraScheda('stat'));
if (tabBtnMenu) tabBtnMenu.addEventListener('click', () => mostraScheda('menu'));
if (tabBtnManutenzione) tabBtnManutenzione.addEventListener('click', () => mostraScheda('manutenzione'));

/* ---------- AUTH ---------- */
onAuthStateChanged(auth, user => {
  if (user) { mostraDashboard(); } else { mostraLogin(); }
});
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginErr.textContent = '';
  const email = document.getElementById('email').value.trim();
  const pass  = document.getElementById('password').value;
  try { await signInWithEmailAndPassword(auth, email, pass); }
  catch(err){ loginErr.textContent = 'Accesso fallito: ' + (err.code || err.message); }
});
btnLogout.addEventListener('click', () => signOut(auth));

function mostraLogin(){ loginView.style.display=''; dashView.style.display='none'; fermaTimerInattivita(); }
async function mostraDashboard(){
  loginView.style.display='none'; dashView.style.display='';
  mostraScheda('stat');
  inizializzaPeriodi();
  resettaTimerInattivita();
  try { await caricaChartJS(); } catch(e){ console.warn('[admin] Chart.js non caricato:', e.message); }
  aggiornaTutto();
}

/* ---------- TIMEOUT DI SESSIONE PER INATTIVITÀ ----------
   Se l'admin dimentica una sessione aperta su un dispositivo condiviso
   (es. tablet in sala), dopo un lungo periodo di inattività la
   sessione si chiude da sola invece di restare accessibile a chiunque
   passi di lì. Un avviso compare 2 minuti prima, con la possibilità
   di restare connessi con un click. */
const INATTIVITA_LIMITE_MS = 30 * 60 * 1000; // 30 minuti
const INATTIVITA_AVVISO_MS = 2 * 60 * 1000;  // avviso 2 minuti prima della scadenza
let _timerAvviso = null, _timerScadenza = null, _elAvvisoInattivita = null;

function elAvvisoInattivita(){
  if (_elAvvisoInattivita) return _elAvvisoInattivita;
  const el = document.createElement('div');
  el.className = 'avviso-inattivita';
  el.innerHTML = `<p>Sessione in scadenza per inattività tra 2 minuti.</p>
    <button type="button" id="btn-resta-connesso">Resta connesso</button>`;
  document.body.appendChild(el);
  el.querySelector('#btn-resta-connesso').addEventListener('click', resettaTimerInattivita);
  _elAvvisoInattivita = el;
  return el;
}
function resettaTimerInattivita(){
  clearTimeout(_timerAvviso); clearTimeout(_timerScadenza);
  elAvvisoInattivita().classList.remove('attivo');
  _timerAvviso = setTimeout(() => elAvvisoInattivita().classList.add('attivo'), INATTIVITA_LIMITE_MS - INATTIVITA_AVVISO_MS);
  _timerScadenza = setTimeout(() => signOut(auth), INATTIVITA_LIMITE_MS);
}
function fermaTimerInattivita(){
  clearTimeout(_timerAvviso); clearTimeout(_timerScadenza);
  if (_elAvvisoInattivita) _elAvvisoInattivita.classList.remove('attivo');
}
/* Qualunque interazione mentre si è nella dashboard rimanda la scadenza */
['mousedown','keydown','touchstart','scroll'].forEach(ev => {
  document.addEventListener(ev, () => {
    if (dashView.style.display !== 'none') resettaTimerInattivita();
  }, { passive:true });
});

/* ---------- CHART.JS: caricato solo qui, non nella pagina pubblica ----------
   Il menu che vedono i clienti non deve scaricare Chart.js (~200 KB):
   serve solo a questa dashboard, quindi lo richiediamo dinamicamente
   al primo accesso autenticato invece di includerlo staticamente in
   index.html per ogni visita. */
let _chartJsPromise = null;
function caricaChartJS(){
  if (window.Chart) return Promise.resolve();
  if (_chartJsPromise) return _chartJsPromise;
  _chartJsPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js';
    s.onload = () => {
      Chart.defaults.color = 'rgba(250,245,236,.75)';
      Chart.defaults.font.family = "'Georgia', serif";
      Chart.defaults.borderColor = 'rgba(200,164,100,.18)';
      resolve();
    };
    s.onerror = () => reject(new Error('impossibile scaricare Chart.js dal CDN'));
    document.head.appendChild(s);
  });
  return _chartJsPromise;
}

/* ---------- DATE HELPERS ---------- */
function fmt(d){
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), g=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${g}`;
}
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function inizioSettimana(d){ // lunedì
  const x=new Date(d); const g=(x.getDay()+6)%7; x.setDate(x.getDate()-g); x.setHours(0,0,0,0); return x;
}
function inizioMese(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function fineMese(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0); }
function elencoGiorni(dDa, dA){
  const out=[]; let d=new Date(dDa); d.setHours(0,0,0,0);
  const fine=new Date(dA); fine.setHours(0,0,0,0);
  while(d<=fine){ out.push(fmt(d)); d=addDays(d,1); }
  return out;
}

/* ---------- INPUT PERIODI ---------- */
const inp = {
  bDa: document.getElementById('b-da'),
  bA:  document.getElementById('b-a'),
  aDa: document.getElementById('a-da'),
  aA:  document.getElementById('a-a')
};
function inizializzaPeriodi(){
  applicaPreset('7g');
  ['change','input'].forEach(ev=>{
    [inp.bDa,inp.bA,inp.aDa,inp.aA].forEach(el=>el.addEventListener(ev, () => {
      segnaPresetAttivo('custom'); aggiornaTutto();
    }));
  });
  document.querySelectorAll('#preset-btns button').forEach(b=>{
    b.addEventListener('click', ()=>{ applicaPreset(b.dataset.preset); aggiornaTutto(); });
  });
}
function segnaPresetAttivo(nome){
  document.querySelectorAll('#preset-btns button').forEach(b=>{
    b.classList.toggle('attivo', b.dataset.preset===nome);
  });
}
function applicaPreset(nome){
  const oggi = new Date(); oggi.setHours(0,0,0,0);
  let bDa,bA,aDa,aA;
  if (nome==='settimana'){
    bDa=inizioSettimana(oggi); bA=oggi;
    aDa=addDays(bDa,-7); aA=addDays(bDa,-1);
  } else if (nome==='mese'){
    bDa=inizioMese(oggi); bA=oggi;
    const mp=addDays(bDa,-1);
    aDa=inizioMese(mp); aA=fineMese(mp);
  } else if (nome==='30g'){
    bA=oggi; bDa=addDays(oggi,-29);
    aA=addDays(bDa,-1); aDa=addDays(aA,-29);
  } else if (nome==='custom'){
    segnaPresetAttivo('custom'); return;
  } else { // 7g default
    nome='7g';
    bA=oggi; bDa=addDays(oggi,-6);
    aA=addDays(bDa,-1); aDa=addDays(aA,-6);
  }
  inp.bDa.value=fmt(bDa); inp.bA.value=fmt(bA);
  inp.aDa.value=fmt(aDa); inp.aA.value=fmt(aA);
  segnaPresetAttivo(nome);
}

/* ---------- LETTURA DATI ---------- */
async function leggiIntervallo(dDa, dA){
  const q = query(ref(db, 'stats/giornaliero'), orderByKey(), startAt(dDa), endAt(dA));
  const snap = await get(q);
  return snap.exists() ? snap.val() : {};
}
/* somma tutti i giorni dell'intervallo in un oggetto aggregato con la stessa
   struttura degli oggetti giornalieri (visite, lingua/*, categoria/*, ecc.) */
function aggrega(daysObj, giorniAttesi){
  const out = { visite:0, lingua:{}, categoria:{}, sezioni_piatti:{},
                schede_vino_aperte:{}, schede_birra_aperte:{}, allergeni_aperti:0, dispositivo:{}, ora:{} };
  for (const g of giorniAttesi) {
    const d = daysObj[g]; if (!d) continue;
    out.visite += Number(d.visite||0);
    out.allergeni_aperti += Number(d.allergeni_aperti||0);
    for (const k of ['lingua','categoria','sezioni_piatti','schede_vino_aperte','schede_birra_aperte','dispositivo','ora']) {
      const src = d[k] || {};
      for (const chiave of Object.keys(src)) {
        out[k][chiave] = (out[k][chiave]||0) + Number(src[chiave]||0);
      }
    }
  }
  return out;
}

/* ---------- RENDERING ---------- */
const grafici = {};
function distruggiGrafici(){ Object.values(grafici).forEach(c=>c&&c.destroy()); }
const COL = {
  oro:'#c8a464', panna:'#faf5ec', vino:'#7a1f2b', verde:'#4d8f5a',
  ciano:'#4a8a99', ambra:'#dcbe86', prugna:'#8b3a62', beige:'#e8dcc4'
};
const PALETTE = [COL.oro, COL.vino, COL.verde, COL.ciano, COL.prugna, COL.ambra, COL.beige, COL.panna];

function somma(o){ return Object.values(o||{}).reduce((s,v)=>s+Number(v||0),0); }
function delta(b,a){
  const diff = b - a;
  const pct = a===0 ? (b===0?0:100) : (diff/a)*100;
  return { diff, pct };
}
function segnoDelta({diff}){
  if (diff>0) return {cls:'su', freccia:'▲'};
  if (diff<0) return {cls:'giu', freccia:'▼'};
  return {cls:'pari', freccia:'='};
}
function kpi(label, b, a){
  const d = delta(b,a); const sd = segnoDelta(d);
  const pctStr = (d.pct>=0?'+':'') + d.pct.toFixed(1) + '%';
  const diffStr = (d.diff>=0?'+':'') + d.diff;
  return `<div class="kpi">
    <div class="label">${label}</div>
    <div class="totale">${b}</div>
    <div class="row"><span>vs precedente: ${a}</span>
      <span class="delta ${sd.cls}">${sd.freccia} ${diffStr} (${pctStr})</span></div>
  </div>`;
}
function classifica(elId, oggetto, formatNome){
  const el = document.getElementById(elId);
  const entries = Object.entries(oggetto||{}).sort((x,y)=>y[1]-x[1]).slice(0,10);
  if (!entries.length){ el.innerHTML = '<li class="vuoto">Nessun dato nel periodo</li>'; return; }
  el.innerHTML = entries.map(([k,v])=>
    `<li><span class="nome">${formatNome?formatNome(k):k}</span><span class="val">${v}</span></li>`
  ).join('');
}
function graficoTorta(id, dati){
  const labels = Object.keys(dati);
  const values = labels.map(k=>dati[k]);
  if (!labels.length){
    if (grafici[id]) grafici[id].destroy();
    const ctx = document.getElementById(id); const p=ctx.parentElement;
    p.innerHTML = '<p class="vuoto">Nessun dato</p>'; return;
  }
  if (grafici[id]) grafici[id].destroy();
  grafici[id] = new Chart(document.getElementById(id), {
    type:'doughnut',
    data:{ labels, datasets:[{ data:values, backgroundColor:PALETTE, borderColor:'rgba(20,10,6,.6)' }]},
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'bottom' } } }
  });
}
function graficoOre(id, dati){
  const labels = Array.from({length:24}, (_,i)=>String(i));
  const values = labels.map(h=>Number(dati[h]||0));
  if (grafici[id]) grafici[id].destroy();
  grafici[id] = new Chart(document.getElementById(id), {
    type:'bar',
    data:{ labels, datasets:[{ label:'Visite/eventi per ora',
      data:values, backgroundColor:COL.oro, borderRadius:4 }]},
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:false } },
      scales:{ x:{ grid:{display:false} }, y:{ beginAtZero:true, ticks:{ precision:0 } } } }
  });
}

async function aggiornaTutto(){
  if (!inp.bDa.value || !inp.bA.value || !inp.aDa.value || !inp.aA.value) return;
  const kpisEl = document.getElementById('kpis');
  kpisEl.innerHTML = '<p class="loading">Caricamento…</p>';
  try {
    const giorniB = elencoGiorni(new Date(inp.bDa.value), new Date(inp.bA.value));
    const giorniA = elencoGiorni(new Date(inp.aDa.value), new Date(inp.aA.value));
    /* Query con range esteso per coprire entrambi gli intervalli in una sola get */
    const dMin = giorniA[0]<giorniB[0] ? giorniA[0] : giorniB[0];
    const dMax = giorniA[giorniA.length-1]>giorniB[giorniB.length-1]
                    ? giorniA[giorniA.length-1] : giorniB[giorniB.length-1];
    const raw = await leggiIntervallo(dMin, dMax);
    const B = aggrega(raw, giorniB);
    const A = aggrega(raw, giorniA);

    /* KPI */
    kpisEl.innerHTML = [
      kpi('Visite totali', B.visite, A.visite),
      kpi('Italiano',      B.lingua.it||0, A.lingua.it||0),
      kpi('English',       B.lingua.en||0, A.lingua.en||0),
      kpi('Piatti',        B.categoria.piatti||0, A.categoria.piatti||0),
      kpi('Vini',          B.categoria.vini||0,   A.categoria.vini||0),
      kpi('Birre',         B.categoria.birre||0,  A.categoria.birre||0),
      kpi('Mobile',        B.dispositivo.mobile||0,  A.dispositivo.mobile||0),
      kpi('Desktop',       B.dispositivo.desktop||0, A.dispositivo.desktop||0),
      kpi('Allergeni aperti', B.allergeni_aperti, A.allergeni_aperti),
      kpi('Schede vino aperte', somma(B.schede_vino_aperte), somma(A.schede_vino_aperte)),
      kpi('Schede birra aperte', somma(B.schede_birra_aperte), somma(A.schede_birra_aperte))
    ].join('');

    /* Grafici (periodo B) */
    graficoTorta('chart-lingua', B.lingua);
    graficoTorta('chart-categoria', B.categoria);
    graficoTorta('chart-dispositivo', B.dispositivo);
    graficoOre('chart-ora', B.ora);

    /* Classifiche (periodo B) */
    classifica('lista-sezioni', B.sezioni_piatti);
    classifica('lista-vini',    B.schede_vino_aperte);
    classifica('lista-birre',   B.schede_birra_aperte);
  } catch(err){
    kpisEl.innerHTML = '<p class="vuoto">Errore lettura dati: '+(err.code||err.message)+'</p>';
    console.error(err);
  }
}
