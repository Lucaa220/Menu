'use strict';
/* =========================================================
   Trattoria da Franca — Menu digitale
   CLOUDINARY CONFIG — dati del tuo account Cloudinary, usato per
   caricare le foto dal pannello admin. È un servizio GRATUITO che
   NON richiede una carta di credito (a differenza di Firebase
   Storage, che dal 2026 richiede il piano a pagamento Blaze anche
   solo per attivarlo). Tutto il resto del sito — login admin, testi,
   prezzi, statistiche — continua a usare Firebase come prima: questo
   file riguarda SOLO l'upload delle foto.

   Come ottenere questi due valori (una tantum, gratis, senza carta):

   1) Vai su https://cloudinary.com/users/register/free e registrati
      (basta email, oppure account Google/GitHub: nessuna carta viene
      mai richiesta per il piano Free).

   2) Nella Dashboard che si apre dopo la registrazione, in alto trovi
      il "Cloud name": copialo qui sotto in cloudName.

   3) Vai su Impostazioni (icona ingranaggio, in alto a destra) →
      scheda "Upload" → scorri fino a "Upload presets" → "Add upload
      preset", e imposta:
        - "Signing Mode" → "Unsigned"
          (fondamentale: è ciò che permette al browser di caricare le
          foto direttamente, senza bisogno di un server/backend).
      Salva così com'è (lascia il resto ai valori proposti — in
      particolare NON si può attivare "Overwrite": Cloudinary lo
      impedisce nei preset "Unsigned" per motivi di sicurezza, altrimenti
      chiunque potrebbe rimpiazzare un file esistente indovinandone il
      nome). Poi copia il nome del preset (mostrato in cima alla lista
      "Upload presets") qui sotto in uploadPreset.

      Conseguenza pratica: ogni foto caricata (anche una "sostituzione")
      crea sempre un file nuovo su Cloudinary; il sito mostra sempre
      l'ultima caricata, ma quella precedente resta nella Media Library
      finché non la cancelli tu manualmente — stessa logica già in uso
      per le foto di sezione quando vengono rimosse dal pannello. Con
      25 GB/mese compresi nel piano gratuito, per un menu di ristorante
      non è un problema, ma ogni tanto vale la pena fare un giro nella
      Media Library (cloudinary.com → Media Library) per eliminare le
      foto vecchie non più usate.

   Questi due valori (cloudName e uploadPreset) sono pensati per stare
   nel codice del sito: NON sono segreti, sono gli stessi che Cloudinary
   fa comparire in chiaro in qualsiasi upload fatto da browser.
   ========================================================= */

window.CLOUDINARY_CONFIG = {
  cloudName: "drlgp40f0",
  uploadPreset: "menu_im"
};