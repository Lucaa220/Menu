/* =========================================================
   Trattoria da Franca — Menu digitale
   FILE 5/5: APP (logica) — funzionamento del sito.
   Qui c'è la parte "motore": lingua, navigazione, orari,
   carosello foto, popup allergeni, scheda tecnica vino.
   Non serve modificarlo per aggiornare il menu: per i testi
   vedi dati-menu.js, per le foto vedi dati-foto.js.

   Analytics: le chiamate a window.tracciaEvento(...) sono
   inviate a Firebase Realtime Database come incrementi
   atomici sotto stats/giornaliero/<oggi>. Se Firebase non è
   raggiungibile o non è configurato, tracciaEvento è un no-op
   (definito in firebase-init.js) e il menu funziona normalmente.
   ========================================================= */

'use strict';

let linguaCorrente = 'it';

/* ---------- CRONOLOGIA / TASTO INDIETRO ----------
   Ogni cambio di schermata (lingua → categoria → contenuto) viene
   registrato con history.pushState, così il tasto "indietro" del
   telefono/browser torna alla schermata precedente del sito invece
   di uscire dalla pagina. Anche l'apertura di un popup (allergeni,
   scheda tecnica) registra un piccolo passo di cronologia: il tasto
   indietro chiude prima il popup, poi torna indietro nelle schermate. */
let statoCorrente = { schermata: 'lingua' };
function pushStato(nuovo, opzioni){
  const replace = opzioni && opzioni.replace;
  try { history[replace ? 'replaceState' : 'pushState'](nuovo, ''); }
  catch(e){ /* ambienti senza History API: il sito funziona comunque */ }
  statoCorrente = nuovo;
}
function _chiudiModaliSenzaStorico(){
  document.getElementById('overlay-allergeni').classList.remove('attiva');
  document.removeEventListener('keydown', chiudiAllergeniEsc);
  rilasciaFocus(document.getElementById('overlay-allergeni'));
  document.getElementById('overlay-scheda-vino').classList.remove('attiva');
  document.removeEventListener('keydown', chiudiSchedaVinoEsc);
  rilasciaFocus(document.getElementById('overlay-scheda-vino'));
}
window.addEventListener('popstate', (e) => {
  const precedente = statoCorrente;
  const nuovo = e.state || { schermata: 'lingua' };
  const soloChiusuraModale = precedente && precedente.modale && !nuovo.modale &&
    precedente.schermata === nuovo.schermata && precedente.tipo === nuovo.tipo;
  statoCorrente = nuovo;
  if (soloChiusuraModale){ _chiudiModaliSenzaStorico(); return; }
  _chiudiModaliSenzaStorico();
  if (nuovo.schermata === 'categoria') mostraCategoria(true);
  else if (nuovo.schermata === 'contenuto') mostraContenuto(nuovo.tipo, true);
  else mostraLingua(true);
});

/* Alcune sezioni del menu piatti contengono nel titolo parole come "vino"
   o "wine" (es. "Vino della Casa" / "House Wine"), che altrimenti
   corrisponderebbero per errore alla foto della cantina vini. Per questo
   la ricerca dell'immagine storytelling è ristretta, per ogni tipo di
   contenuto, solo alle sezioni realmente pertinenti a quel tipo. */
const IDS_FOTO_PER_TIPO = {
  piatti: ['antipasti','primi','secondi-brace','secondi','contorni','dessert'],
  vini:   ['vini'],
  birre:  ['birre']
};
function immaginePer(titolo, tipo, sezId){
  /* Quando i dati arrivano da Firebase, ogni sezione porta con sé un id
     stabile (vedi menu-data.js): l'abbinamento con la sua eventuale foto
     può quindi essere ESATTO, per id, invece che "indovinato" dal testo
     del titolo. Questo evita un problema reale: un titolo può contenere
     per intero quello di un'altra sezione (es. "Secondi" è contenuto in
     "Secondi alla brace"), e la corrispondenza per parola chiave può
     quindi assegnare per errore la foto della sezione sbagliata — con
     l'effetto che la foto caricata per la sezione giusta non compare
     mai. Per i dati statici di dati-foto.js, che non hanno un id di
     sezione, resta necessaria la corrispondenza per parola chiave. */
  if (window.MENU_ORIGINE_FIREBASE && sezId){
    return immaginiSezioni.find(m => m.id === sezId) || null;
  }
  const t = (titolo||"").toLowerCase();
  const permessi = (tipo && !window.MENU_ORIGINE_FIREBASE) ? IDS_FOTO_PER_TIPO[tipo] : null;
  return immaginiSezioni.find(m =>
    (!permessi || permessi.includes(m.id)) && m.chiavi.some(k => t.includes(k))
  );
}

/* ---------- HELPER ANALYTICS ---------- */
function _rilevaDispositivo(){
  try {
    const w = window.innerWidth || document.documentElement.clientWidth || 0;
    return w > 0 && w < 900 ? 'mobile' : 'desktop';
  } catch(e){ return 'desktop'; }
}
function _oraCorrente(){
  try { return new Date().getHours(); } catch(e){ return 0; }
}
/* Mappa il titolo di una sezione piatti nella chiave canonica
   (antipasti|primi|secondi|contorni|dessert). "brace/griglia" ricade in "secondi". */
function _sezionePiattiCanonica(titolo, sezId){
  const m = immaginePer(titolo, 'piatti', sezId);
  if (!m) return null;
  const id = m.id;
  if (id === 'secondi-brace') return 'secondi';
  if (window.MENU_ORIGINE_FIREBASE) return id; // sezioni personalizzate: l'id stesso è la chiave
  if (['antipasti','primi','secondi','contorni','dessert'].includes(id)) return id;
  return null;
}
function _traccia(paths){
  try { if (typeof window.tracciaEvento === 'function') window.tracciaEvento(paths); }
  catch(e){ /* silenzioso */ }
}

/* ---------- CAROSELLO FOTO (scorrimento manuale + automatico) ---------- */
let caroselliAttivi = [];
function fermaCaroselli(){
  caroselliAttivi.forEach(id=>clearInterval(id));
  caroselliAttivi = [];
}
function creaCarosello(imgs, altTesto, didascalie){
  const wrap=document.createElement('div');wrap.className='carosello-wrap';

  const track=document.createElement('div');track.className='carosello-track';
  imgs.forEach(src=>{
    const slide=document.createElement('div');slide.className='carosello-slide';
    const img=document.createElement('img');
    img.src=src;img.alt=altTesto;img.loading='lazy';img.decoding='async';
    slide.appendChild(img);
    track.appendChild(slide);
  });
  wrap.appendChild(track);

  let indice=0,pausato=false,timeoutRipresa=null,scrollTimer=null;
  const multi = imgs.length>1;

  const cap=document.createElement('p');cap.className='didascalia';
  wrap.appendChild(cap);

  function aggiornaDidascalia(){
    const testo=(didascalie&&didascalie[indice])?didascalie[indice]:'';
    if(cap.textContent===testo)return;
    cap.classList.add('cambio');
    setTimeout(()=>{ cap.textContent=testo; cap.classList.remove('cambio'); },180);
  }
  cap.textContent=(didascalie&&didascalie[0])?didascalie[0]:'';

  function aggiornaDots(){
    wrap.querySelectorAll('.carosello-dot').forEach((d,i)=>d.classList.toggle('attivo', i===indice));
  }
  function segnaInterazione(){
    pausato=true;
    clearTimeout(timeoutRipresa);
    timeoutRipresa=setTimeout(()=>{pausato=false;},6000);
  }
  function vaiA(i){
    indice=(i+imgs.length)%imgs.length;
    track.scrollTo({left:indice*track.clientWidth,behavior:'smooth'});
    aggiornaDots();
    aggiornaDidascalia();
  }

  if(multi){
    const dots=document.createElement('div');dots.className='carosello-dots';
    imgs.forEach((_,i)=>{
      const d=document.createElement('button');d.type='button';
      d.className='carosello-dot'+(i===0?' attivo':'');
      d.setAttribute('aria-label','Foto '+(i+1));
      d.onclick=()=>{segnaInterazione();vaiA(i);};
      dots.appendChild(d);
    });
    wrap.appendChild(dots);

    const frSx=document.createElement('button');frSx.type='button';frSx.className='carosello-freccia sinistra';
    frSx.innerHTML='&#8249;';frSx.setAttribute('aria-label','Foto precedente');
    frSx.onclick=()=>{segnaInterazione();vaiA(indice-1);};
    const frDx=document.createElement('button');frDx.type='button';frDx.className='carosello-freccia destra';
    frDx.innerHTML='&#8250;';frDx.setAttribute('aria-label','Foto successiva');
    frDx.onclick=()=>{segnaInterazione();vaiA(indice+1);};
    wrap.appendChild(frSx);wrap.appendChild(frDx);

    track.addEventListener('scroll',()=>{
      segnaInterazione();
      clearTimeout(scrollTimer);
      scrollTimer=setTimeout(()=>{
        indice=Math.round(track.scrollLeft/Math.max(track.clientWidth,1));
        aggiornaDots();
        aggiornaDidascalia();
      },120);
    },{passive:true});

    /* Chi ha attivato "riduci movimento" nel sistema operativo non vede
       l'avanzamento automatico del carosello, ma può comunque scorrere
       manualmente con le frecce, i pallini o lo swipe. */
    const preferisceMenoMovimento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!preferisceMenoMovimento){
      const intervalId=setInterval(()=>{ if(!pausato) vaiA(indice+1); },4500);
      caroselliAttivi.push(intervalId);
    }
  }

  return wrap;
}

/* ---------- ORARI PRANZO ---------- */
function isOrarioPranzo(){
  const ora=new Date();const min=ora.getHours()*60+ora.getMinutes();
  return min>=(11*60+30)&&min<(15*60);
}
function giornoCorrente(){return ['dom','lun','mar','mer','gio','ven','sab'][new Date().getDay()];}
function vaNascostoAPranzo(g){
  if(!g)return false;
  if(g===true)return isOrarioPranzo();
  if(!isOrarioPranzo())return false;
  return g.includes(giornoCorrente());
}

/* ---------- NAVIGAZIONE ---------- */
function nascondiTutte(){document.querySelectorAll('.schermata').forEach(s=>s.classList.remove('attiva'));}
function aggiornaBodyClass(stato){
  document.body.classList.remove('mostra-hero','mostra-categoria','mostra-contenuto');
  document.body.classList.add('mostra-'+stato);
}
function selezionaLingua(l, daPopState){
  fermaCaroselli();
  linguaCorrente=l;aggiornaTestiCategoria();
  nascondiTutte();document.getElementById('schermata-categoria').classList.add('attiva');
  aggiornaBodyClass('categoria');window.scrollTo(0,0);
  if(!daPopState) pushStato({schermata:'categoria'});

  /* ANALYTICS: visita totale + lingua + dispositivo + ora del giorno */
  _traccia({
    'visite': 1,
    ['lingua/'+l]: 1,
    ['dispositivo/'+_rilevaDispositivo()]: 1,
    ['ora/'+_oraCorrente()]: 1
  });
}
function mostraLingua(daPopState){
  fermaCaroselli();
  nascondiTutte();document.getElementById('schermata-lingua').classList.add('attiva');
  aggiornaBodyClass('hero');window.scrollTo(0,0);
  if(!daPopState) pushStato({schermata:'lingua'});
}
function mostraCategoria(daPopState){
  fermaCaroselli();
  aggiornaTestiCategoria();
  nascondiTutte();document.getElementById('schermata-categoria').classList.add('attiva');
  aggiornaBodyClass('categoria');window.scrollTo(0,0);
  if(!daPopState) pushStato({schermata:'categoria'});
}
function aggiornaTestiCategoria(){
  /* Questa funzione tocca elementi/dati che dipendono dall'allineamento
     tra index.html, dati-menu.js e app.js. Non deve MAI, per nessun
     motivo, impedire il cambio di schermata (che dipende da lei essendo
     chiamata come primo passo di selezionaLingua/mostraCategoria):
     qualsiasi errore qui dentro viene isolato e solo segnalato in console. */
  try {
    const t=ui[linguaCorrente];
    document.getElementById('cat-titolo').textContent=t.catTitolo;
    document.getElementById('cat-piatti').textContent=t.piatti;
    document.getElementById('cat-vini').textContent=t.vini;
    document.getElementById('cat-birre').textContent=t.birre;
    document.getElementById('cat-cambia-lingua').textContent=t.cambiaLingua;
    document.documentElement.lang=linguaCorrente;

    /* Il bottone "Menù a prezzo fisso" compare solo se l'admin ne ha
       creato almeno uno attivo: chi non usa questa funzione non vede
       una categoria vuota e inutile. */
    const btnMenuFissi=document.getElementById('cat-btn-menufissi');
    if (btnMenuFissi){
      const elenco = menuFissiData && menuFissiData[linguaCorrente] && menuFissiData[linguaCorrente].menu;
      btnMenuFissi.style.display = (elenco && elenco.length) ? '' : 'none';
      document.getElementById('cat-menufissi').textContent = t.menuFissi;
    }
  } catch(e){ console.warn('[aggiornaTestiCategoria]', e); }
}

/* ---------- ACCESSIBILITÀ: trappola del focus nei popup =========
   Quando un popup è aperto, il tasto Tab deve restare "dentro" di
   esso (senza scappare dietro, invisibile) e alla chiusura il focus
   torna al bottone che lo aveva aperto — comportamento atteso da chi
   naviga a tastiera o con uno screen reader. */
let _elementoFocusPrimaDelModale = null;
function intrappolaFocus(overlayEl){
  _elementoFocusPrimaDelModale = document.activeElement;
  const focusabili = overlayEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusabili.length) focusabili[0].focus();
  function gestisciTab(e){
    if (e.key !== 'Tab' || !focusabili.length) return;
    const primo = focusabili[0], ultimo = focusabili[focusabili.length-1];
    if (e.shiftKey && document.activeElement === primo){ e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo){ e.preventDefault(); primo.focus(); }
  }
  overlayEl.addEventListener('keydown', gestisciTab);
  overlayEl._gestisciTab = gestisciTab;
}
function rilasciaFocus(overlayEl){
  if (overlayEl._gestisciTab){ overlayEl.removeEventListener('keydown', overlayEl._gestisciTab); overlayEl._gestisciTab = null; }
  if (_elementoFocusPrimaDelModale && document.body.contains(_elementoFocusPrimaDelModale)) _elementoFocusPrimaDelModale.focus();
  _elementoFocusPrimaDelModale = null;
}

/* ---------- POPUP ALLERGENI ---------- */
function mostraAllergeni(){
  const t=ui[linguaCorrente];
  document.getElementById('allergeni-titolo').textContent=t.allergeniTitolo;
  document.getElementById('allergeni-nota').textContent=t.allergeniNota;

  const lista=document.getElementById('lista-allergeni');
  lista.innerHTML='';
  allergeniData.forEach((a,i)=>{
    const li=document.createElement('li');

    const num=document.createElement('span');num.className='num';num.textContent=(i+1)+'.';
    const ic=document.createElement('span');ic.className='ic';ic.setAttribute('aria-hidden','true');ic.textContent=a.ic;
    const nome=document.createElement('span');nome.className='nome';nome.textContent=a[linguaCorrente];

    li.appendChild(num);li.appendChild(ic);li.appendChild(nome);
    lista.appendChild(li);
  });

  document.getElementById('overlay-allergeni').classList.add('attiva');
  document.addEventListener('keydown',chiudiAllergeniEsc);
  intrappolaFocus(document.getElementById('overlay-allergeni'));
  pushStato(Object.assign({},statoCorrente,{modale:'allergeni'}));

  /* ANALYTICS: apertura popup allergeni */
  _traccia({ 'allergeni_aperti': 1 });
}
function chiudiAllergeni(){
  document.getElementById('overlay-allergeni').classList.remove('attiva');
  document.removeEventListener('keydown',chiudiAllergeniEsc);
  rilasciaFocus(document.getElementById('overlay-allergeni'));
  if (statoCorrente && statoCorrente.modale==='allergeni') history.back();
}
function chiudiAllergeniEsc(e){ if(e.key==='Escape') chiudiAllergeni(); }

/* tipo: 'vino' oppure 'birra' — determina quale archivio dati e quali
   etichette usare per la scheda tecnica (funziona per entrambe le
   categorie riusando lo stesso popup/markup). */
function creaBottoneScheda(nome, tipo){
  const b=document.createElement('button');
  b.type='button';b.className='bottone-scheda';b.textContent='i';
  b.setAttribute('aria-label', linguaCorrente==='it' ? 'Scheda tecnica' : 'Technical sheet');
  b.onclick=(e)=>{ e.stopPropagation(); mostraSchedaVino(nome, tipo); };
  return b;
}
function mostraSchedaVino(nome, tipo){
  tipo = tipo || 'vino';
  const archivio = tipo==='birra' ? schedeBirre : schedeVini;
  const etichette = tipo==='birra' ? ui[linguaCorrente].schedaBirra : ui[linguaCorrente].schedaVino;
  /* campi mostrati e relative etichette, nell'ordine di visualizzazione */
  const campi = tipo==='birra'
    ? [['birrificio',etichette.birrificio], ['stile',etichette.stile], ['descrizione',etichette.descrizione]]
    : [['zona',etichette.zona], ['vitigno',etichette.vitigno], ['descrizione',etichette.descrizione]];

  document.getElementById('scheda-vino-titolo').textContent=nome;

  const voce=archivio[nome]||{};
  /* i testi (zona/vitigno/descrizione oppure birrificio/stile/descrizione)
     sono annidati per lingua sotto "it"/"en" */
  const dati=voce[linguaCorrente]||{};

  const fotoWrap=document.getElementById('scheda-vino-foto-wrap');
  const foto=document.getElementById('scheda-vino-foto');
  if(voce.foto){
    foto.onerror=()=>{ fotoWrap.style.display='none'; };
    foto.src=voce.foto;
    foto.alt=nome;
    fotoWrap.style.display='';
  } else {
    foto.removeAttribute('src');
    fotoWrap.style.display='none';
  }

  const corpo=document.getElementById('scheda-vino-corpo');
  corpo.innerHTML='';
  campi.forEach(([chiave,etichetta])=>{
    const div=document.createElement('div');
    const dt=document.createElement('dt');dt.textContent=etichetta;
    const dd=document.createElement('dd');dd.textContent=dati[chiave]||etichette.daScrivere;
    div.appendChild(dt);div.appendChild(dd);
    corpo.appendChild(div);
  });

  document.getElementById('overlay-scheda-vino').classList.add('attiva');
  document.addEventListener('keydown',chiudiSchedaVinoEsc);
  intrappolaFocus(document.getElementById('overlay-scheda-vino'));
  pushStato(Object.assign({},statoCorrente,{modale:'scheda'}));

  /* ANALYTICS: apertura scheda tecnica (per nome, distinta tra vino e birra) */
  _traccia({ [(tipo==='birra' ? 'schede_birra_aperte/' : 'schede_vino_aperte/')+nome]: 1 });
}
function chiudiSchedaVino(){
  document.getElementById('overlay-scheda-vino').classList.remove('attiva');
  document.removeEventListener('keydown',chiudiSchedaVinoEsc);
  rilasciaFocus(document.getElementById('overlay-scheda-vino'));
  if (statoCorrente && statoCorrente.modale==='scheda') history.back();
}
function chiudiSchedaVinoEsc(e){ if(e.key==='Escape') chiudiSchedaVino(); }

/* ---------- OSSERVATORE STORYTELLING ---------- */
let osservatoreFoto=null;
function creaOsservatore(){
  if(osservatoreFoto)osservatoreFoto.disconnect();
  if(!('IntersectionObserver' in window))return null;
  osservatoreFoto=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('visibile');}
      else{e.target.classList.remove('visibile');}
    });
  },{root:null,rootMargin:'-10% 0px -10% 0px',threshold:.15});
  return osservatoreFoto;
}

/* ---------- RENDER CONTENUTO ---------- */
function mostraContenuto(tipo, daPopState){
  fermaCaroselli();
  if (tipo === 'menufissi'){ renderizzaMenuFissi(daPopState); return; }
  const t=ui[linguaCorrente];
  const dataset={piatti:piattiData,vini:viniData,birre:birreData}[tipo];
  if(!dataset)return;
  const dati=dataset[linguaCorrente];

  /* ANALYTICS: categoria consultata */
  _traccia({ ['categoria/'+tipo]: 1 });

  document.getElementById('nav-indietro').textContent=t.indietro;
  document.getElementById('nav-lingua').textContent=t.cambiaLingua;
  document.getElementById('cont-torna').textContent=t.tornaCategorie;
  document.getElementById('cont-titolo').textContent=dati.titolo;

  const notaEl=document.getElementById('cont-nota');notaEl.innerHTML='';
  if(dati.nota){dati.nota.forEach(p=>{const el=document.createElement('p');el.textContent=p;notaEl.appendChild(el);});}

  const corpo=document.getElementById('cont-corpo');corpo.innerHTML='';

  if(tipo==='piatti'&&isOrarioPranzo()){
    const qualcosaNascosto=dati.sezioni.some(sez=>!sez.tabella&&sez.items.some(it=>vaNascostoAPranzo(it[2])));
    if(qualcosaNascosto){
      const av=document.createElement('div');av.className='avviso-pranzo';av.textContent=t.avvisoPranzo;
      corpo.appendChild(av);
    }
  }

  if(tipo==='piatti'){
    const wrap=document.createElement('div');wrap.className='wrap-bottone-allergeni';
    const btn=document.createElement('button');
    btn.type='button';btn.className='bottone allergeni';
    btn.onclick=mostraAllergeni;
    btn.innerHTML='<span class="icona" aria-hidden="true">⚠️</span> <span>'+t.allergeni+'</span>';
    wrap.appendChild(btn);
    corpo.appendChild(wrap);
  }

  /* ---------- Ricerca piatti (solo schermata piatti) ---------- */
  let ricercaInput=null, applicaFiltri=()=>{};
  if(tipo==='piatti'){
    const toolbar=document.createElement('div');toolbar.className='toolbar-piatti';

    ricercaInput=document.createElement('input');
    ricercaInput.type='search';ricercaInput.className='ricerca-piatti';
    ricercaInput.placeholder=t.cercaPiatti;
    ricercaInput.setAttribute('aria-label',t.cercaPiatti);
    ricercaInput.addEventListener('input',()=>applicaFiltri());
    toolbar.appendChild(ricercaInput);
    corpo.appendChild(toolbar);
  }

  const osservatore=creaOsservatore();
  const immaginiUsate=new Set();
  const sezioniPiattiTracciate=new Set();
  let visibiliCategoria=0; // conta le voci mostrate in tutta la categoria (usato per vini/birre: vedi sotto)

  dati.sezioni.forEach(sez=>{
    // Inserisce la fotografia/carosello storytelling PRIMA della sezione (una volta per tipologia)
    const map=immaginePer(sez.titolo, tipo, sez.id);
    if(map && !immaginiUsate.has(map.id)){
      immaginiUsate.add(map.id);
      const didascalieLingua=(map.didascalie||[]).map(d=>d[linguaCorrente]||'');
      const carosello=creaCarosello(map.imgs, sez.titolo, didascalieLingua);
      corpo.appendChild(carosello);
      if(osservatore)osservatore.observe(carosello);
    }

    /* ANALYTICS: sezione piatti renderizzata (una sola volta per tipo) */
    if (tipo==='piatti') {
      const canon = _sezionePiattiCanonica(sez.titolo, sez.id);
      if (canon && !sezioniPiattiTracciate.has(canon)) {
        sezioniPiattiTracciate.add(canon);
        _traccia({ ['sezioni_piatti/'+canon]: 1 });
      }
    }

    const sezDiv=document.createElement('section');sezDiv.className='sezione';
    const h3=document.createElement('h3');h3.textContent=sez.titolo;

    if(!sez.tabella){
      const setAll=new Set();
      sez.items.forEach(([,,g,all])=>{ if(all&&all.length) all.forEach(a=>setAll.add(a)); });
      if(setAll.size){
        const sup=document.createElement('sup');sup.className='rif-allergeni';
        sup.textContent=Array.from(setAll).sort((a,b)=>a-b).join(',');
        sup.title=(ui[linguaCorrente].allergeniTitolo||'Allergeni');
        sup.tabIndex=0;sup.setAttribute('role','button');
        sup.onclick=mostraAllergeni;
        sup.onkeydown=(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();mostraAllergeni();}};
        h3.appendChild(sup);
      }
    }
    sezDiv.appendChild(h3);

    if(sez.tabella){
      const tab=document.createElement('div');tab.className='tabella-vino';
      const intest=document.createElement('div');intest.className='intestazione';
      sez.colonne.forEach(c=>{const s=document.createElement('span');s.textContent=c;intest.appendChild(s);});
      tab.appendChild(intest);
      let visTab=0;
      sez.items.forEach(([nome,prezzi,,disponibile])=>{
        /* "disponibile" (4° elemento) arriva solo dal menu gestito da Firebase
           (vedi menu-data.js): quando è esplicitamente false, il vino/birra è
           stato segnato come non disponibile dal pannello admin e va
           nascosto dal menu pubblico, senza toccare i dati salvati. */
        if((tipo==='vini'||tipo==='birre')&&disponibile===false)return;
        visTab++;
        const riga=document.createElement('div');riga.className='voce-vino';
        const n=document.createElement('span');n.className='nome';n.textContent=nome;
        if(tipo==='vini') n.appendChild(creaBottoneScheda(nome,'vino'));
        if(tipo==='birre') n.appendChild(creaBottoneScheda(nome,'birra'));
        const p=document.createElement('div');p.className='prezzi';
        prezzi.forEach(pp=>{const s=document.createElement('span');s.textContent=pp;p.appendChild(s);});
        riga.appendChild(n);riga.appendChild(p);tab.appendChild(riga);
      });
      if(visTab>0){ sezDiv.appendChild(tab);corpo.appendChild(sezDiv); }
      visibiliCategoria+=visTab;
    } else {
      let vis=0;
      sez.items.forEach(([nome,prezzo,terzo,quarto])=>{
        if(tipo==='piatti'&&vaNascostoAPranzo(terzo))return;
        if((tipo==='vini'||tipo==='birre')&&quarto===false)return;
        vis++;
        const riga=document.createElement('div');riga.className='voce';
        if(tipo==='piatti'){
          riga.dataset.nome=nome.toLowerCase();
        }
        const n=document.createElement('span');n.className='nome';n.textContent=nome;
        if(tipo==='vini') n.appendChild(creaBottoneScheda(nome,'vino'));
        if(tipo==='birre') n.appendChild(creaBottoneScheda(nome,'birra'));
        const p=document.createElement('span');p.className='prezzo';p.textContent=prezzo;
        riga.appendChild(n);riga.appendChild(p);sezDiv.appendChild(riga);
      });
      if(vis>0)corpo.appendChild(sezDiv);
      visibiliCategoria+=vis;
    }
  });

  /* Se un'intera categoria vini/birre risulta senza voci visibili (es. tutte
     segnate come "non disponibile" dal pannello admin), mostra un messaggio
     invece di lasciare la schermata vuota. Per i piatti questo caso è già
     coperto dal messaggio "nessun risultato" della ricerca. */
  if((tipo==='vini'||tipo==='birre') && visibiliCategoria===0){
    const msg=document.createElement('p');
    msg.className='vuoto-ricerca';
    msg.textContent = tipo==='vini' ? (t.vinoVuoto||'Nessun vino disponibile al momento.') : (t.birraVuoto||'Nessuna birra disponibile al momento.');
    corpo.appendChild(msg);
  }

  if(dati.coperto){
    const c=document.createElement('div');c.className='coperto';c.textContent=dati.coperto;
    corpo.appendChild(c);
  }

  if(tipo==='piatti'){
    const messaggioVuoto=document.createElement('p');
    messaggioVuoto.className='vuoto-ricerca';messaggioVuoto.textContent=t.nessunRisultato;messaggioVuoto.hidden=true;
    corpo.appendChild(messaggioVuoto);

    applicaFiltri=function(){
      const query=(ricercaInput.value||'').trim().toLowerCase();
      let visibiliTotali=0;
      corpo.querySelectorAll('.sezione').forEach(sezDiv=>{
        let visibiliSezione=0;
        sezDiv.querySelectorAll('.voce').forEach(riga=>{
          const nome=riga.dataset.nome||'';
          const visibile=!query||nome.includes(query);
          riga.style.display=visibile?'':'none';
          if(visibile)visibiliSezione++;
        });
        sezDiv.style.display=visibiliSezione>0?'':'none';
        visibiliTotali+=visibiliSezione;
      });
      /* Durante la ricerca (query non vuota) nascondi le foto/caroselli
         storytelling, per lasciare più spazio ai risultati filtrati */
      corpo.querySelectorAll('.carosello-wrap').forEach(car=>{
        car.style.display=query?'none':'';
      });
      messaggioVuoto.hidden=visibiliTotali>0;
    };
  }

  nascondiTutte();
  document.getElementById('schermata-contenuto').classList.add('attiva');
  aggiornaBodyClass('contenuto');
  window.scrollTo(0,0);
  if(!daPopState) pushStato({schermata:'contenuto', tipo});
}

/* ---------- RENDER "MENÙ A PREZZO FISSO" ----------
   Categoria strutturalmente diversa dalle altre (piatti/vini/birre
   sono liste di sezioni con voci a sé; qui invece ogni "menù" è una
   scheda a prezzo unico con più portate incluse), quindi ha il suo
   renderer dedicato invece di passare dal ciclo generico sopra. */
function renderizzaMenuFissi(daPopState){
  const t=ui[linguaCorrente];
  const dati=(menuFissiData && menuFissiData[linguaCorrente]) || {titolo:'',menu:[]};

  /* ANALYTICS: categoria consultata */
  _traccia({ 'categoria/menufissi': 1 });

  document.getElementById('nav-indietro').textContent=t.indietro;
  document.getElementById('nav-lingua').textContent=t.cambiaLingua;
  document.getElementById('cont-torna').textContent=t.tornaCategorie;
  document.getElementById('cont-titolo').textContent=dati.titolo;

  document.getElementById('cont-nota').innerHTML='';

  const corpo=document.getElementById('cont-corpo');corpo.innerHTML='';
  const elenco=dati.menu||[];

  if(!elenco.length){
    const msg=document.createElement('p');msg.className='vuoto-ricerca';
    msg.textContent=t.menuFissiVuoto;
    corpo.appendChild(msg);
  } else {
    elenco.forEach(mf=>{
      const card=document.createElement('article');card.className='menu-fisso-card';

      const testa=document.createElement('div');testa.className='menu-fisso-testa';
      const h3=document.createElement('h3');h3.textContent=mf.nome;
      testa.appendChild(h3);
      if(mf.prezzo){
        const prezzo=document.createElement('span');prezzo.className='menu-fisso-prezzo';prezzo.textContent=mf.prezzo;
        testa.appendChild(prezzo);
      }
      card.appendChild(testa);

      if(mf.descrizione){
        const p=document.createElement('p');p.className='menu-fisso-descrizione';p.textContent=mf.descrizione;
        card.appendChild(p);
      }

      (mf.portate||[]).forEach(portata=>{
        if(!portata.titolo && !portata.voci.length) return;
        const blocco=document.createElement('div');blocco.className='menu-fisso-portata';
        if(portata.titolo){
          const h4=document.createElement('h4');h4.textContent=portata.titolo;
          blocco.appendChild(h4);
        }
        if(portata.voci.length){
          const ul=document.createElement('ul');
          portata.voci.forEach(v=>{const li=document.createElement('li');li.textContent=v;ul.appendChild(li);});
          blocco.appendChild(ul);
        }
        card.appendChild(blocco);
      });

      if(mf.note){
        const nota=document.createElement('p');nota.className='menu-fisso-note';nota.textContent=mf.note;
        card.appendChild(nota);
      }

      corpo.appendChild(card);
    });
  }

  nascondiTutte();
  document.getElementById('schermata-contenuto').classList.add('attiva');
  aggiornaBodyClass('contenuto');
  window.scrollTo(0,0);
  if(!daPopState) pushStato({schermata:'contenuto', tipo:'menufissi'});
}

/* Espone le funzioni chiamate dagli onclick */
window.selezionaLingua=selezionaLingua;
window.mostraLingua=mostraLingua;
window.mostraCategoria=mostraCategoria;
window.mostraContenuto=mostraContenuto;
window.mostraAllergeni=mostraAllergeni;
window.chiudiAllergeni=chiudiAllergeni;
window.mostraSchedaVino=mostraSchedaVino;
window.chiudiSchedaVino=chiudiSchedaVino;

/* ---------- AVVIO ----------
   Il sito non si avvia più da solo al caricamento dello script: i dati
   del menu possono arrivare da Firebase (asincrono) prima di poter
   disegnare qualsiasi schermata. È menu-data.js a chiamare
   window.avviaApp() non appena i dati (da Firebase, o in mancanza
   il fallback statico di dati-menu.js/dati-foto.js) sono pronti. */
window.avviaApp = function avviaApp(){
  /* Stato iniziale di cronologia (sostituisce, non aggiunge, la voce corrente) */
  pushStato({schermata:'lingua'}, {replace:true});
  aggiornaTestiCategoria();
};
