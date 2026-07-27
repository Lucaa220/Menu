/* =========================================================
   Trattoria da Franca — Menu digitale
   FIREBASE INIT — inizializza Firebase e espone helper globali:
     window.tracciaEvento(paths)  → incrementa contatori giornalieri
     window.firebaseAuth          → istanza auth (per admin.js)
     window.firebaseDb            → istanza database (per admin.js)
   Tutto è protetto da try/catch: se Firebase non è raggiungibile,
   il menu funziona comunque normalmente per i clienti.
   ========================================================= */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, update, increment }
  from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAuth }
  from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

try {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith("INSERISCI_")) {
    console.warn("[Firebase] Configurazione non compilata: tracking disattivato.");
  } else {
    /* Riusa l'app di default se un altro script (es. admin.js) l'ha già
       inizializzata: initializeApp() una seconda volta con lo stesso
       nome genera un errore "app/duplicate-app". */
    const app = getApps().length ? getApp() : initializeApp(cfg);
    const db  = getDatabase(app);
    const auth = getAuth(app);

    window.firebaseDb = db;
    window.firebaseAuth = auth;
    window._fbHelpers = { ref, update, increment };

    /* Chiave giorno corrente in formato YYYY-MM-DD (fuso locale) */
    function chiaveGiorno(){
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,'0');
      const g = String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${g}`;
    }

    /* Sanitizza un segmento di path per Firebase (rimuove . # $ [ ] /) */
    function sanitizza(s){
      return String(s).replace(/[.#$\[\]\/]/g,'_').slice(0,120);
    }

    /* Incrementa in modo atomico più contatori sotto stats/giornaliero/<oggi> */
    window.tracciaEvento = function(paths){
      try {
        if (!paths || typeof paths !== 'object') return;
        const base = `stats/giornaliero/${chiaveGiorno()}`;
        const patch = {};
        for (const k of Object.keys(paths)) {
          const parti = k.split('/').map(sanitizza).join('/');
          patch[`${base}/${parti}`] = increment(paths[k] || 1);
        }
        update(ref(db), patch).catch(err => {
          console.warn("[Firebase] scrittura fallita:", err.message);
        });
      } catch(e){
        console.warn("[Firebase] tracciaEvento errore:", e.message);
      }
    };
  }
} catch(e){
  console.warn("[Firebase] init errore:", e.message);
}

/* Fallback no-op se init è fallito, così app.js non deve controllare */
if (typeof window.tracciaEvento !== 'function') {
  window.tracciaEvento = function(){};
}
