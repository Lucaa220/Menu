/* =========================================================
   Trattoria da Franca — Menu digitale
   FILE 5/5: APP (logica) — funzionamento del sito.
   Qui c'è la parte "motore": lingua, navigazione, orari,
   carosello foto, popup allergeni, scheda tecnica vino.
   Non serve modificarlo per aggiornare il menu: per i testi
   vedi dati-menu.js, per le foto vedi dati-foto.js.
   ========================================================= */

'use strict';

let linguaCorrente = 'it';

function immaginePer(titolo){
  const t = (titolo||"").toLowerCase();
  return immaginiSezioni.find(m => m.chiavi.some(k => t.includes(k)));
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

    const intervalId=setInterval(()=>{ if(!pausato) vaiA(indice+1); },4500);
    caroselliAttivi.push(intervalId);
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
function selezionaLingua(l){
  fermaCaroselli();
  linguaCorrente=l;aggiornaTestiCategoria();
  nascondiTutte();document.getElementById('schermata-categoria').classList.add('attiva');
  aggiornaBodyClass('categoria');window.scrollTo(0,0);
}
function mostraLingua(){
  fermaCaroselli();
  nascondiTutte();document.getElementById('schermata-lingua').classList.add('attiva');
  aggiornaBodyClass('hero');window.scrollTo(0,0);
}
function mostraCategoria(){
  fermaCaroselli();
  aggiornaTestiCategoria();
  nascondiTutte();document.getElementById('schermata-categoria').classList.add('attiva');
  aggiornaBodyClass('categoria');window.scrollTo(0,0);
}
function aggiornaTestiCategoria(){
  const t=ui[linguaCorrente];
  document.getElementById('cat-titolo').textContent=t.catTitolo;
  document.getElementById('cat-piatti').textContent=t.piatti;
  document.getElementById('cat-vini').textContent=t.vini;
  document.getElementById('cat-birre').textContent=t.birre;
  document.getElementById('cat-cambia-lingua').textContent=t.cambiaLingua;
  document.documentElement.lang=linguaCorrente;
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
}
function chiudiAllergeni(){
  document.getElementById('overlay-allergeni').classList.remove('attiva');
  document.removeEventListener('keydown',chiudiAllergeniEsc);
}
function chiudiAllergeniEsc(e){ if(e.key==='Escape') chiudiAllergeni(); }

function creaBottoneScheda(nomeVino){
  const b=document.createElement('button');
  b.type='button';b.className='bottone-scheda';b.textContent='i';
  b.setAttribute('aria-label', linguaCorrente==='it' ? 'Scheda tecnica' : 'Technical sheet');
  b.onclick=(e)=>{ e.stopPropagation(); mostraSchedaVino(nomeVino); };
  return b;
}
function mostraSchedaVino(nomeVino){
  const t=ui[linguaCorrente].schedaVino;
  document.getElementById('scheda-vino-titolo').textContent=nomeVino;

  const dati=schedeVini[nomeVino]||{};

  const fotoWrap=document.getElementById('scheda-vino-foto-wrap');
  const foto=document.getElementById('scheda-vino-foto');
  if(dati.foto){
    foto.onerror=()=>{ fotoWrap.style.display='none'; };
    foto.src=dati.foto;
    foto.alt=nomeVino;
    fotoWrap.style.display='';
  } else {
    foto.removeAttribute('src');
    fotoWrap.style.display='none';
  }

  const campi=[
    ['zona',t.zona], ['vitigno',t.vitigno], ['descrizione',t.descrizione]
  ];
  const corpo=document.getElementById('scheda-vino-corpo');
  corpo.innerHTML='';
  campi.forEach(([chiave,etichetta])=>{
    const div=document.createElement('div');
    const dt=document.createElement('dt');dt.textContent=etichetta;
    const dd=document.createElement('dd');dd.textContent=dati[chiave]||t.daScrivere;
    div.appendChild(dt);div.appendChild(dd);
    corpo.appendChild(div);
  });

  document.getElementById('overlay-scheda-vino').classList.add('attiva');
  document.addEventListener('keydown',chiudiSchedaVinoEsc);
}
function chiudiSchedaVino(){
  document.getElementById('overlay-scheda-vino').classList.remove('attiva');
  document.removeEventListener('keydown',chiudiSchedaVinoEsc);
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
function mostraContenuto(tipo){
  fermaCaroselli();
  const t=ui[linguaCorrente];
  const dataset={piatti:piattiData,vini:viniData,birre:birreData}[tipo];
  if(!dataset)return;
  const dati=dataset[linguaCorrente];

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

  const osservatore=creaOsservatore();
  const immaginiUsate=new Set();

  dati.sezioni.forEach(sez=>{
    // Inserisce la fotografia/carosello storytelling PRIMA della sezione (una volta per tipologia)
    const map=immaginePer(sez.titolo);
    if(map && !immaginiUsate.has(map.id)){
      immaginiUsate.add(map.id);
      const didascalieLingua=(map.didascalie||[]).map(d=>d[linguaCorrente]||'');
      const carosello=creaCarosello(map.imgs, sez.titolo, didascalieLingua);
      corpo.appendChild(carosello);
      if(osservatore)osservatore.observe(carosello);
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
      sez.items.forEach(([nome,prezzi])=>{
        const riga=document.createElement('div');riga.className='voce-vino';
        const n=document.createElement('span');n.className='nome';n.textContent=nome;
        if(tipo==='vini') n.appendChild(creaBottoneScheda(nome));
        const p=document.createElement('div');p.className='prezzi';
        prezzi.forEach(pp=>{const s=document.createElement('span');s.textContent=pp;p.appendChild(s);});
        riga.appendChild(n);riga.appendChild(p);tab.appendChild(riga);
      });
      sezDiv.appendChild(tab);corpo.appendChild(sezDiv);
    } else {
      let vis=0;
      sez.items.forEach(([nome,prezzo,g])=>{
        if(tipo==='piatti'&&vaNascostoAPranzo(g))return;
        vis++;
        const riga=document.createElement('div');riga.className='voce';
        const n=document.createElement('span');n.className='nome';n.textContent=nome;
        if(tipo==='vini') n.appendChild(creaBottoneScheda(nome));
        const p=document.createElement('span');p.className='prezzo';p.textContent=prezzo;
        riga.appendChild(n);riga.appendChild(p);sezDiv.appendChild(riga);
      });
      if(vis>0)corpo.appendChild(sezDiv);
    }
  });

  if(dati.coperto){
    const c=document.createElement('div');c.className='coperto';c.textContent=dati.coperto;
    corpo.appendChild(c);
  }

  nascondiTutte();
  document.getElementById('schermata-contenuto').classList.add('attiva');
  aggiornaBodyClass('contenuto');
  window.scrollTo(0,0);
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