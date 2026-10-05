# PAUSE — PRD (Product Requirements Document)

## Original Problem Statement
L'utente ha chiesto di estrarre la sua app dal repository GitHub `https://github.com/micheleiannello7-cyber/PAUSE-5.31.git` e fornire una preview pronta e completa.

## App Overview
PAUSE è un'app mobile (Expo/React Native + FastAPI + MongoDB) di micro-apprendimento in italiano/inglese: curiosità ("storie") e mini-lezioni organizzate in 12 categorie (Scienza, Spazio, Tecnologia, Natura, Animali, Storia, Psicologia, Corpo Umano, Cultura, Economia, Arte & Design, Geografia & Viaggi).

## Architecture
- **Frontend**: Expo Router (SDK 57), React Native 0.86, react-query, reanimated. Schermate: onboarding, discover/explore (tabs), bookmarks, profile, deep-dive storia, playlist, stats, history, premium, unlock.
- **Backend**: FastAPI (`/api/*`), MongoDB con seed idempotente all'avvio. Contenuti caricati da `seed_data.py`, `seed_pack_*`, `seed_lessons_*`, `v8_content.json`, `v9_content.json`.
- **Object Storage**: Emergent Managed Object Storage per copertine/illustrazioni (usa `EMERGENT_LLM_KEY`).

## Schermata finale lettura — ridisegno su mockup (2026-10-02)
- `reader-ending.tsx` ridisegnato: card "Da ricordare" in vetro centrata (icona `brain` MDI, occhiello, frase grande centrata, "Storia completata" con check), poi riga minimale Mi piace/Salva/Condividi (nessuna seconda card), sezione "Continua con" (nuova stringa i18n, più grande) con card consigliata orizzontale (copertina a sinistra, le TRE icone del badge Tipo·Categoria·Durata senza testo separate da linee verticali, titolo, freccia) e pulsante "Scopri" a pillola con bordo luminoso. Tutti gli accenti usano `colors.brand` → seguono il tema scelto (il blu del mockup è solo esempio).
- Transizione lettura→fine: `reader-header.tsx` riceve `endReveal` (da `deep-dive/[id].tsx`, stessa finestra della comparsa del contenuto finale): la barra (titolo + progresso + vetro) sale e sfuma, compare il logo PΛUSE centrato. Nuove stringhe i18n: `story_completed`, `continue_with`, `discover_cta` (IT/EN).
- Nessuna modifica a backend/DB/TTS/salvataggi/condivisione/sistema badge/altre schermate; riusati componenti e icone esistenti. Verificato in preview end-to-end fino alla schermata finale.

## Current State (re-extraction — 2026-10-02, repo PAUSE-5.33) [Fase 1]
- App ri-estratta dal repo `PAUSE-5.33` in questo container; backend + frontend Expo web rimessi in piedi.
- `backend/.env`: MONGO_URL/DB_NAME preservati, `EMERGENT_LLM_KEY` impostato, `TTS_ENABLED="false"`. Seed automatico all'avvio: **12 categorie, 493 storie**. `/api/health` = ok (db: true).
- `frontend/.env`: `EXPO_PUBLIC_BACKEND_URL` allineato all'URL ingress del pod. Supervisor `frontend` avvia `expo start --web --port 3000` (script "start" aggiornato in package.json). Dipendenze reinstallate (pip + yarn, cache react-native ripulita).
- **Completata rinomina "Mini lezioni" → "Impara"**: ultima stringa `read_lesson` aggiornata in `src/i18n.tsx` → "Leggi e Impara" (IT) / "Read & Learn" (EN). Nessun residuo "mini-lezione"/"mini lesson".
- Verifica E2E (testing agent, iteration_1): onboarding (ospite) → scelta 12 categorie con illustrazioni → home → apertura e lettura capitolo per schermate → salvataggi → profilo con statistiche. Frontend 100%, nessun errore.
- Audio/TTS e Stripe/premium restano DISATTIVATI per scelta (preview sola lettura). Fase 2: audio + compattazione capitoli (richiede ricarica credito).

## Current State (re-extraction — 2026-10-01, repo PAUSE-5.32)
- App ri-estratta dal repo `PAUSE-5.32` in questo container e preview rimessa online.
- `frontend/.env` allineato all'URL ingress corretto del pod corrente (EXPO_PUBLIC_BACKEND_URL / proxy / hostname).
- `backend/.env`: `EMERGENT_LLM_KEY` e `TTS_ENABLED="false"` reimpostati.
- Dipendenze reinstallate (pip + yarn). Backend `/api/health` = ok (db: true), seed: **12 categorie, 493 storie**. Covers sync su object storage attivo.
- Preview verificata end-to-end: onboarding (Google / ospite) + selezione categorie con illustrazioni 3D funzionanti.

## Current State (extraction — 2026-09-30)
- App estratta dal repo in `/app`, preservando `.env` di preview (URL/Mongo).
- Dipendenze installate: pip (backend) + yarn (frontend). Nessun errore.
- Backend avviato: `/api/health` = ok (db: true). Seed automatico: **12 categorie, 493 storie**.
- `EMERGENT_LLM_KEY` aggiunto a `backend/.env` per il sync delle copertine su object storage.
- Preview verificata: onboarding + selezione categorie con illustrazioni 3D funzionanti end-to-end.

## Integrations Status (per scelta utente — 2026-09-30)
- Narrazione audio TTS: **DISATTIVATA** (`TTS_ENABLED="false"`).
- Generazione immagini AI copertine: **non necessaria** (immagini già presenti su object storage).
- Pagamenti/abbonamenti Stripe: **DISATTIVATI**.

## Core Requirements (static)
- Contenuti multilingua (it/en) con categorie, storie a capitoli, mini-lezioni.
- Onboarding personalizzato, bookmark, cronologia, statistiche, profilo con preferenze (tema/accent/lingua).

## Backlog / Remaining (P1/P2)
- P1: Attivazione opzionale TTS (OpenAI o ElevenLabs) su richiesta con chiave utente.
- P1: Attivazione opzionale Stripe per premium/abbonamenti su richiesta con chiave utente.
- P2: Generazione nuove copertine/contenuti via pipeline esistente (richiede credito Universal Key).

## Tipografia (2026-10-01)
- Unico font: **Plus Jakarta Sans** (TTF in `frontend/assets/fonts`, 5 pesi) via `src/utils/fonts.ts` + `theme.ts/typography`
  (displayHero=ExtraBold titoli schermata, displayBold=Bold sezioni/capitoli, display=SemiBold, body=Regular, bodyMedium, bodyBold=SemiBold).

## Lettore: un capitolo = una schermata (2026-10-01)
- `reader-section.tsx`: compatto → riduzione automatica del corpo (min 85% di 16,5pt) → se il testo sta ma collide con l'anticipazione,
  l'anticipazione viene nascosta (`ChapterTrack.teaserHidden`) → solo altrimenti 2 pagine.
- Backend: `fit_chapters.py` (GPT-5.4) snellisce i capitoli > 500 caratteri (IT+EN); salva in `chapter_fit_overrides.json`,
  riapplicato da `ensure_seed` (`chapter_fit.apply_fit_overrides`). Backup in `stories_backup_pre_fit`.

## Home (2026-10-01)
- Schermata finale (2026-10-02): Mi piace / Salva / Condividi non sono più una pillola a sé ma il piede della card "Da ricordare" (filo di luce + riga icone), meno blocchi a schermo.
- Rimosso l'indicatore di avanzamento del mazzo (deck-progress.tsx eliminato); la card si allunga dello spazio liberato.

## Identità sonora UI (2026-10-01)
- `frontend/src/sounds.ts` (expo-audio, un player per suono, volume basso uniforme, throttle sul tick) + interruttore "Effetti sonori" in Profilo (AsyncStorage `pause.sounds.v1`). Non tocca la narrazione TTS.
- **Pacchetto definitivo: Zen** (2026-10-01, scelto dall'utente): file in `assets/sounds/zen/*.mp3` (ElevenLabs via `scripts/make_sounds_eleven.py`, pack `v1`). Il selettore temporaneo "Stile effetti" e i pacchetti Cristallo/Legno sono stati rimossi.
- **Volume effetti**: slider in Profilo (`VolumeSlider`, PanResponder) → `volumeMul` persistito in `pause.sounds.volume.v1`. Volumi base alzati (enter/return/complete 0.95, tick 0.5, favorite 0.7): gli effetti ora si sentono bene senza slider al massimo.
- **Zen (v1) rifinito (2026-10-01)**: `enter` rigenerato come specchio ascendente di `return` (stesso timbro, in salita); `complete` nuovo (bloom di chime shimmer/arpa); `tick` nuovo (goccia d'acqua con shimmer). `return` invariato (piace all'utente).
- **Suono preferiti**: nuovo effetto `favorite` per tutti e 3 i pacchetti; suona in `reader-ending.tsx` quando si salva una storia (willSave).
- **Vibrazione abbinata**: `play()` chiama un haptic per ogni effetto (enter/return=Light, complete=Success, tick=selection) tramite `haptics.ts`, quindi si disattiva dall'interruttore "Vibrazione". Rimosso l'haptic manuale duplicato in `home-story-deck.tsx`.

## Zoom intelligente della copertina nei capitoli (2026-10-01)
- Richiesta: passando al capitolo 1 la copertina-sfondo deve zoomare sulla parte "bella o utile" (es. il buco nero), non su un angolo.
- Backend `cover_focus.py`: mappa di salienza (colore raro vs mediana, bordi, saturazione, lieve prior centrale, sfocatura forte) → regione connessa al picco → `hero_focal {x,y,r,aspect,src}` salvato nella storia (493/493). Idempotente, girato all'avvio in `sync_assets_in_background` (ricalcola solo se `src` ≠ copertina attuale). CLI: `python cover_focus.py [--force] [id…]`.
- Frontend `reader-cover-backdrop.tsx`: `coverZoom(frame, focal, bandTop)` → scala (1.35–1.9, più forte per soggetti piccoli) e spostamento che portano il soggetto al centro della fascia visibile sotto la barra, senza scoprire i bordi; interpolato con lo scroll (0 → altezza copertina), stesso passo della parallasse. Nessuna modifica a morph/intro.


## Audit copertine 2026 (in corso)
- Catalogo: 493 contenuti (Scienza 53, altre 11 categorie 40 ciascuna → obiettivo v9 "40 per categoria" raggiunto).
- `backend/audit_covers_2026.py` (--step download/review/report): scarica le copertine in `/app/cover_audit_2026/images`, phash per i doppioni, revisione visiva Gemini (coerenza, persone/volti, qualità, testo) in `review.json`; 418/493 revisionate (75 bloccate da budget esaurito).
- Risultati: 5 gruppi di copertine identiche (12 storie), 34 foto stock orizzontali/chiare (vecchie Unsplash), 3 incoerenti (jpeg, mancini, app gratuita), ~5 deboli con persone. 112 copertine con volto in evidenza, 84 con persone.
- `backend/cover_decisions_2026.json`: 41 copertine da rigenerare con prompt specifici **senza persone/volti**; si usa `replace_reviewed_covers.py cover_decisions_2026.json` (stage → revisione visiva → `--publish id,id`).
- **Bloccato: budget Universal Key esaurito** (anche la prima generazione è fallita). Dopo la ricarica: 1) `audit_covers_2026.py --step review` per le 75 mancanti, 2) stage + publish delle 41, 3) opzionale: rigenerare le 112 con volti.

## Next Tasks
- `fit_chapters.py` eseguito parzialmente (2026-10-01): 281/726 capitoli snelliti (104 storie) con ~1 $ di credito; la chiave si è esaurita.
  Restano 445 capitoli in 105 narrazioni (~1,2 $). Rilanciare `python fit_chapters.py` (idempotente) dopo la ricarica.

## Paywall Premium v4 (giugno 2026)
- `app/premium.tsx`: parte superiore invariata (hero ventaglio, claim €2,49/mese, selettore piani). Sotto: titolo "Scopri tutto ciò che offre Premium", griglia 2×2 di card glass con foto (assets/images/premium-{stories,learn,audio,personal}.jpg, generate con Nano Banana via `backend/gen_premium_art.py`), pulsante "Scopri tutte le funzioni →" che espande sul posto la lista completa, "Confronto rapido" a 5 righe con colonna Premium in glow cyan, CTA inline con note "7 giorni gratis · Nessun addebito oggi" / "Poi €29,99/anno…".
- Sfondo (solo tema scuro): blu notte `#010914` + scie cyan a destra (`premium-bg-streak.jpg`) + orizzonte di montagne in fondo (`premium-bg-horizon.jpg`), componente `PaywallBackdrop`.
- Chiave Emergent LLM funzionante di nuovo (budget ripristinato): `fit_chapters.py` può essere rilanciato su richiesta.
