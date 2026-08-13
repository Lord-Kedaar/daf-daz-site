# SEO_PHASE1_TECHNICAL_REPORT — DaF/DaZ technical SEO foundation

- **Data:** 2026-08-13
- **Task:** t_0d3df6888b5163ba (MCP request `daf-daz-seo-phase1-technical-foundation-2026-08-13`)
- **Wykonawca:** Metricus
- **Repo:** `Lord-Kedaar/daf-daz-site` (GitHub Pages, CNAME daf-daz.radoslaw-pleskot.com)
- **Workspace:** /Users/radek/PROJECTS/daf-daz-site (świeży clone — katalog istniał, ale był pusty; nie był repo git)
- **Branch:** main @ d929a75 (commit lokalny, NIE pushowany)

---

## 0. Workspace / source of truth

- `/Users/radek/PROJECTS/daf-daz-site` istniał, ale był **pusty** (preflight: `workspace_path_missing` / `workspace_is_empty`). Utworzono świeży clone `https://github.com/Lord-Kedaar/daf-daz-site.git`.
- Zweryfikowano: remote = `Lord-Kedaar/daf-daz-site`, branch `main`, HEAD `c957dda` (czysty).
- Repo to **generator statyczny**: `_src/index.html` + `build.py` → 9 stron (DE/PL/EN × index/legal). Wszystkie zmiany HTML wprowadzane przez źródło + rebuild; strony generowane nie są edytowane ręcznie.
- Baseline determinizmu: `python3 build.py` przed zmianami → **zero diff** (committed pages == wygenerowane).

## 1. Zmienione pliki i uzasadnienie

| Plik | Zmiana | Uzasadnienie |
|---|---|---|
| `assets/img/favicon.svg` | 562 651 B (SVG wrapper + 421 KB base64 PNG) → **810 B** czysty wektor | Finding #2 Phase 0: favicon = główny sprawca LCP 4.9 s / 5.2 s. Wektor odtwarza oryginalny monogram (dymek + „D", kolor #513C34, przezroczyste tło) — spójność wizualna zachowana, zero payloadu rastrowego. |
| `assets/css/styles.css` | light accent `hsl(10,80%,55%)` → `40%`; hover `45%` → `35%`; nowy token `--color-accent-contrast` (light: `#ffffff`, dark: `#1a1206`); 3 selektory CTA używają tokenu | Finding #5 Phase 0: 4× color-contrast fail. Light: biały na nowym akcencie = **6.05:1** (było 3.76:1). Dark (Lighthouse audytuje `prefers-color-scheme: dark`): złoto `#F5A83D` nie osiąga 4.5:1 z bielą przy żadnej rozsądnej jasności → ciemny tekst `#1a1206` na złocie = **9.3:1**. Estetyka złota w dark mode zachowana. |
| `build.py` | `make_switcher_links()`: `aria-label` = widoczny tekst (`DE`/`PL`/`EN` zamiast `Deutsch`/`Polski`/`English`) | Finding #6 Phase 0: label-content-name-mismatch. Accessible name musi zawierać widoczny tekst. |
| `index.html`, `pl/index.html`, `en/index.html`, `legal/*.html` ×6 | Regeneracja po zmianie build.py (tylko linia lang-switcher) | Artefakty builda — zmiana wyłącznie w źródle. |

## 2. Favicon — before/after

| Metryka | Before | After |
|---|---|---|
| Rozmiar pliku | 562 651 B | **810 B** (−99.86%) |
| Transfer (Lighthouse) | 417 KB | **1 000 B** |
| Payload rastrowy | 421 KB base64 PNG (data URI) | brak (`data:` nieobecne, 0× `<image>`/`<use>`) |
| Walidacja XML | — | `xml.dom.minidom` parse OK |
| Render | — | qlmanage → wizualna weryfikacja: dymek + „D", spójny z oryginałem |

## 3. Testy / walidacja

- **Build:** `python3 build.py` → 9 stron, OK.
- **Sanity (repo):** `python3 scripts/sanity_check.py` → `SANITY OK — 9 pages + sitemap + robots passed.` (title/description/canonical/H1 unikalne, html lang, hreflang wzajemny + x-default, linki/assety wewnętrzne, JSON-LD parsuje, zakazane patterny nieobecne).
- **Link check:** sanity_check pokrywa wszystkie wewnętrzne href/src (0 broken); sitemap 9/9 celów istnieje na dysku.
- **JSON-LD:** parsowany przez sanity_check (json.loads + @context + zakaz unitCode H) — bez zmian w schema, składnia zachowana.
- **Canonical/hreflang:** sanity_check weryfikuje self-canonical + pełną wzajemność DE/PL/EN + x-default na wszystkich 9 stronach — bez zmian, PASS.
- **Lighthouse (lokalny serwer 127.0.0.1:8899, Chrome headless):**

| Kategoria | Before (Phase 0, live) | After (lokalnie) |
|---|---|---|
| perf desktop | 0.80 | **0.90** |
| perf mobile | 0.78 | **0.90** |
| LCP desktop | 4.9 s | **3.7 s** |
| LCP mobile | 5.2 s | **3.7 s** |
| a11y (dark, domyślny headless) | 0.96 | **1.0** |
| a11y (light, wymuszony) | 0.96 | **1.0** |
| color-contrast | 4 fail | **0 fail (oba motywy)** |
| label-content-name-mismatch | 1 fail | **0 fail** |
| CLS / TBT | 0 / 30 ms | 0 / 0 ms |

Uwaga: LCP lokalny (3.7 s) nie jest wprost porównywalny z live (4.9 s) — inny host, brak Cloudflare, throttling LH. Poprawa transferu favicon 417 KB → 1 KB jest jednak twardym dowodem usunięcia głównego sprawcy.

## 4. Zakres świadomie NIEdotknięty (zgodnie z taskiem)

- Canonical/hreflang/x-default: zachowane 1:1 (zakaz spłaszczania języków / kanonikalizacji PL→DE).
- Title/meta/OG/Twitter/JSON-LD: bez zmian — Phase 0 potwierdziła poprawność (seo 1.0, OG kompletny, JSON-LD bogaty).
- H1–H3: bez zmian — brak dowodu defektu.
- portrait.webp: **już usunięty upstream** (commit `afc4f80` „Remove unused portrait.webp"); w wygenerowanych stronach 0 referencji. W `_src/index.html` pozostała martwa referencja JSON-LD (`"image": ".../portrait.webp"`) — nie trafia do outputu (build.py generuje head), ale wymaga sprzątnięcia źródła (patrz HUMAN_REQUIRED).
- Redirecty legacy, Google Business Profile, GSC, Formspree POST, portfolio: **nie ruszane** (zakaz taska).

## 5. Deferred — HUMAN_REQUIRED / external

1. **GSC (Search Console):** dane o starych URL-ach DaF/DaZ i ruchu → decyzja o 301. Phase 0: stare ścieżki na radoslaw-pleskot.com → 404 (NEEDS_GSC_ACCESS).
2. **Cross-link portfolio → subdomena:** repo portfolio (inny, nieznany repo) — zewnętrzny follow-up, nie w tym repo.
3. **Sprzątnięcie `_src/index.html`:** martwa referencja `portrait.webp` w JSON-LD źródła (linia 66) — kosmetyka źródła, brak wpływu na output; do usunięcia przy najbliższej edycji źródła.
4. **Deploy:** commit lokalny `d929a75` NIE jest pushowany — wymaga zgody Radosława (zero-deploy attestation poniżej).
5. **Formspree:** test wysyłki w środowisku testowym (nie z produkcji) — poza zakresem.
6. **Dark-mode gold:** świadomie zachowany (9.3:1 z ciemnym tekstem). Jeśli preferowany biały tekst na złocie — wymaga zmiany koloru akcentu dark (decyzja wizualna).

## 6. RESULT_CAPSULE

- **task_id:** t_0d3df6888b5163ba
- **status:** DONE_VERIFIED
- **baseline:** świeży clone Lord-Kedaar/daf-daz-site @ c957dda (workspace był pusty); build deterministyczny (zero diff przed zmianami)
- **actions_taken:** (1) favicon.svg 562 651 B → 810 B czysty wektor (monogram zachowany); (2) light accent 55%→40% + token `--color-accent-contrast` (dark: #1a1206 na złocie) — 4× kontrast naprawione w obu motywach; (3) aria-label lang-switcher = widoczny tekst (build.py) + regeneracja 9 stron; (4) canonical/hreflang/OG/JSON-LD nietknięte
- **files_changed:** assets/img/favicon.svg, assets/css/styles.css, build.py, index.html, pl/index.html, en/index.html, legal/{imprint,privacy}.html ×3 (regeneracja)
- **local_commit:** `d929a75` (main, czysty tree)
- **zero-deploy attestation:** NIE pushowano, NIE deployowano, NIE dotykano DNS/Cloudflare/GSC/Formspree/portfolio. Zmiany wyłącznie lokalne w repo.
- **tests:** build.py OK; sanity_check.py SANITY OK (9 stron + sitemap + robots); XML favicon OK; Lighthouse: perf 0.80→0.90 (desktop) / 0.78→0.90 (mobile), LCP 4.9→3.7 s / 5.2→3.7 s, a11y 0.96→1.0 (dark i light), contrast 4→0 fail, label-mismatch 1→0 fail; favicon transfer 417 KB→1 KB
- **acceptance verdict:** **PASS**
- **next safe action:** po akceptacji Radosława — `git push origin main` (deploy GitHub Pages automatyczny); równolegle: dane GSC → decyzja o 301; cross-link z portfolio (osobne repo).
