# SEO Phase 6E — Evidence and Rollback Closure Report

- **Data:** 2026-08-16
- **Repo:** /Users/radek/PROJECTS/daf-daz-site (Lord-Kedaar/daf-daz-site)
- **Task:** t_2d70c09c392eda92 — DaF/DaZ SEO Phase 6E: Evidence and Rollback Closure
- **Baza:** MORDAX_SEO_PHASE6_REREVIEW.md (werdykt CHANGES_REQUESTED; HIGH: rollback, MEDIUM: raw evidence, MEDIUM: claims QA, MEDIUM: dirty tree, LOW: README)
- **Zakres:** wyłącznie lokalna remediacja. **Zero push / zero deploy / zero publikacji / zero DNS / zero Cloudflare / zero GSC / zero GBP / zero Formspree. Zdalne repo nietknięte.**
- **Werdykt:** **PASS** (wszystkie 5 findingów re-review zamknięte; 0 nowych regresji)

---

## 1. FINDING → FIX → EVIDENCE

### R1 [HIGH] — Rollback: placeholder `<SHA-6C>` i błędna semantyka „Cofnij Phase 6C”

**FINDING (Mordax):** `SEO_PHASE6C_REMEDIATION_REPORT.md:40,89,96,129` używało `<SHA-6C>`; wiersz 96 nazywał `git reset --hard <SHA-6C>` „Cofnij Phase 6C”, chociaż reset do SHA Phase 6C **odtwarza** stan z remediacją, a nie ją cofa. Brak realnych SHA/refów i warunków bezpieczeństwa.

**FIX:**
1. Wszystkie `<SHA-6C>` usunięte z raportów i STATE_LOG-ów (repo + ZOLZOTRON_DELUXE).
2. Realne SHA wpisane: commit 6C = `0523456403ad2680e807d76ec68a7a5b181be049` (`0523456`), rodzic = `0d14ed3`, pre-SEO = `c957dda`.
3. Rozdzielono semantykę:
   - **Odtwórz stan PO remediacji 6C** → `git reset --hard 0523456` (przywraca stan z remediacją);
   - **Cofnij Phase 6C (usuń remediację)** → `git revert 0523456` (bezpieczny, historia nietknięta) ALBO `git reset --hard 0d14ed3` **wyłącznie po zabezpieczeniu dirty tree**; jawnie zaznaczone, że 0d14ed3 = stan PO Phase 5, PRZED 6C, a NIE powrót sprzed SEO;
   - **Stan sprzed SEO** → `git checkout c957dda -- .` (commity/origin nietknięte; NIE `reset --hard origin/main`).
4. Dodano twardy zakaz: żaden reset/push/force-push zdalnego `origin` bez jawnego approval Radosława/Zołzy.

**EVIDENCE:**
- `grep -rn "<SHA-6C>"` w repo → 0 trafień poza `MORDAX_SEO_PHASE6_REREVIEW.md` (werdykt audytu opisujący finding — dokument źródłowy, nie raport wykonawczy; nieedytowany).
- `grep -rn "<SHA-6C>"` w `/Users/radek/ZOLZOTRON_DELUXE` → 0 trafień.
- `SEO_PHASE6C_REMEDIATION_REPORT.md` sekcje 2/3/RESULT_CAPSULE: realne SHA + tabela rollback z 6 wierszami (w tym wiersz ZAKAZ zdalny).
- Projektowy STATE_LOG (`04-projects/active/daf-daz-site/00_control/STATE_LOG.md`) i globalny STATE_LOG (`ZOLZOTRON_DELUXE/STATE_LOG.md`): linia Rollback wpisu 6C poprawiona na realne SHA + warunki.

### R2 [MEDIUM] — Trwałe raw evidence dla E2E/QA

**FINDING (Mordax):** `evidence/phase6c/` zawierało tylko build logi i hashe; brak surowych logów E2E 34/34, sanity, phase3, phase6a, HTML sanity, links/meta. Kanban metadata = claim autora, nie niezależny evidence.

**FIX:**
1. Nowy trwały runner `scripts/run_phase6e_evidence.sh` — uruchamia wszystkie 10 suites i zapisuje do `evidence/phase6e/` per-suite: **komendę, wersje środowiska (node/python3/Chrome), cwd, datę, pełny raw stdout+stderr, exit code**.
2. Uruchomiono pełny przebieg (2026-08-16 01:05 +0200): **10/10 suites exit 0**.

**EVIDENCE (raw logi w repo, `evidence/phase6e/`):**
| Suite | Log | Wynik (z logu) |
|-------|-----|----------------|
| build 1 | `build1.log` | exit 0 |
| build 2 | `build2.log` | exit 0 |
| idempotencja | `hash1.txt`, `hash2.txt`, `hash_diff.txt` | diff exit 0 (identyczne) |
| sanity | `sanity.log` | SANITY OK — 13 pages + sitemap + robots, exit 0 |
| meta | `meta.log` | 4/4 landingi: title==oczekiwany, H1 count==1, exit 0 |
| links | `links.log` | 9 pages, 282 links, broken: 0, exit 0 |
| HTML sanity | `html_sanity.log` | 14 public HTML OK, exit 0 |
| UTM logic | `utm_logic.log` | 5/5, exit 0 |
| phase3 | `phase3.log` | 12/12, exit 0 |
| phase6a | `phase6a.log` | 36/36, exit 0 |
| UTM E2E | `phase6c_utm_e2e.log` | **34/34**, exit 0 |

Środowisko (z logów): node v22.22.3, Python 3.9.6, Chrome/151.0.7922.138, serwer 127.0.0.1:8899, CDP 9222.

### R3 [MEDIUM] — Claims QA szersze niż asercje

**FINDING (Mordax):** `check_phase2_meta.py` nie porównywał title z oczekiwaniami i nie failował przy H1 count != 1; `sanity_check.py` wymagał tylko canonical zaczynającego się od BASE (nie exact self) i nie wymuszał kompletności/unikalności sitemap.

**FIX (wzmocnione asercje — claims teraz egzekwowane):**
1. `scripts/check_phase2_meta.py`: `pages` to teraz lista `(ścieżka, oczekiwany title)`; **FAIL przy title mismatch** (4 oczekiwane title wpisane z aktualnych outputów) i **FAIL przy H1 count != 1**.
2. `scripts/sanity_check.py`: canonical musi być **exact self-referencing** (`canonical == BASE + path`); sitemap: **unikalność** (duplikaty → error) + **kompletność** (zbiór `<loc>` == zbiór INDEXABLE; brakujące i nadmiarowe URL-e → error).
3. `scripts/check_links_phase2.py`: wykluczono `_src/` z link checka (szablon źródłowy z relatywnymi ścieżkami, które build.py przepisuje na `/assets/...`; sanity_check potwierdza istnienie wszystkich assetów publicznych) — claim „0 broken (publiczne)” jest teraz dosłownie prawdziwy.

**EVIDENCE:** `meta.log` (4/4 z nowymi asercjami), `sanity.log` (13 stron z exact self-canonical + sitemap kompletność/unikalność), `links.log` (0 broken, 282 linki). Wszystkie exit 0.

### R4 [MEDIUM] — Końcowy stan git po commicie

**FINDING (Mordax):** raport 6C pokazywał stan sprzed commita; snapshot wejściowy: 6 modified + 15 untracked.

**FIX:** sekcja 2 poniżej podaje **aktualny** stan po wszystkich zmianach 6E (przed commitem 6E): 8 modified + 19 untracked, z klasyfikacją. Po commicie 6E stan zostanie zaktualizowany w RESULT_CAPSULE.

### R5 [LOW] — Brak README

**FINDING (Mordax):** brak minimalnego README z build/QA/source-output/rollback.

**FIX:** `README.md` (nowy): struktura `_src` → generated output, komendy build + pełny zestaw QA (statyczne i browser E2E), preview, tabela rollback z realnymi SHA, lista raportów faz SEO.

**EVIDENCE:** `/Users/radek/PROJECTS/daf-daz-site/README.md` (w repo, untracked → commit 6E).

---

## 2. Git refs / status (audyt 2026-08-16, przed commitem 6E)

- **HEAD (local main):** `0523456403ad2680e807d76ec68a7a5b181be049` (`0523456`, SEO Phase 6C, 2026-08-16 00:55:02 +0200)
- **origin/main (local remote-tracking):** `0d14ed374ec0408019ad8bc303edc0a6041b2e2a` (`0d14ed3`, SEO Phase 5) — local main ahead 1, behind 0
- **Pre-SEO:** `c957dda` („Use hero image for link preview", 2026-08-13 20:27:43 +0200)
- **Remote reflog:** `c957dda → 0d14ed3` `update by push`, 2026-08-15 23:45:57 CEST — push spoza procesu 6C/6E (timestamp przed utworzeniem taska 6C); czy GitHub Pages wykonał deployment — **NEEDS_HUMAN** (nie wykonano żadnego działania zdalnego)
- **Working tree (przed commitem 6E):** 8 modified + 19 untracked = 27 pozycji:
  - **Zmiany 6E (ta remediacja):** `SEO_PHASE6C_REMEDIATION_REPORT.md` (M), `scripts/sanity_check.py` (M), `scripts/check_phase2_meta.py` (M), `scripts/check_links_phase2.py` (M), `README.md` (nowy), `scripts/run_phase6e_evidence.sh` (nowy), `evidence/phase6e/` (nowe, 11 plików)
  - **Zmiany z faz 1–6A (poprzednie taski, niezacommitowane):** `GSC_MEASUREMENT_PREP.md`, `SEO_PHASE1_TECHNICAL_REPORT.md`, `SEO_PHASE2_CONTENT_ARCHITECTURE.md`, `_src/index.html`, `_src/landings/deutsch-privatunterricht-wien.html`, `assets/css/styles.css` (M); `MORDAX_SEO_PHASE6_REVIEW.md`, `MORDAX_SEO_PHASE6_REREVIEW.md`, `SEO_PHASE3_CONVERSION_REPORT.md`, `SEO_PHASE3_RECOVERY_REPORT.md`, `SEO_PHASE6_MORDAX_REVIEW.md`, `SEO_PRE_DEPLOY_GATE.md`, `scripts/cdp_*.mjs` (5), `scripts/check_links_phase2.py`, `scripts/check_phase2_meta.py`, `scripts/phase3_verify.mjs`, `scripts/phase6a_html_sanity.py`, `scripts/phase6a_qa.mjs` (untracked)
- **Commit 6E:** wykonany lokalnie — **`6083ad4`** („SEO Phase 6E: evidence and rollback closure — real SHAs, raw QA logs, strengthened assertions, README", 20 plików, +645/−6) — **bez push**. Zdalne repo: **0 zmian**.
- **Working tree (PO commicie 6E):** 6 modified + 14 untracked = 20 pozycji — wyłącznie zmiany z faz 1–6A (poprzednie taski, niezacommitowane): `GSC_MEASUREMENT_PREP.md`, `SEO_PHASE1_TECHNICAL_REPORT.md`, `SEO_PHASE2_CONTENT_ARCHITECTURE.md`, `_src/index.html`, `_src/landings/deutsch-privatunterricht-wien.html`, `assets/css/styles.css` (M); `MORDAX_SEO_PHASE6_REVIEW.md`, `MORDAX_SEO_PHASE6_REREVIEW.md`, `SEO_PHASE3_CONVERSION_REPORT.md`, `SEO_PHASE3_RECOVERY_REPORT.md`, `SEO_PHASE6_MORDAX_REVIEW.md`, `SEO_PRE_DEPLOY_GATE.md`, `scripts/cdp_*.mjs` (5), `scripts/phase3_verify.mjs`, `scripts/phase6a_html_sanity.py`, `scripts/phase6a_qa.mjs` (untracked). Wszystkie pliki 6E są w commicie `6083ad4`.

## 3. Claims QA — CONFIRMED / NOT_CONFIRMED / NEEDS_HUMAN

| Claim | Status | Podstawa |
|-------|--------|----------|
| Build idempotentny (2×, hash diff 0) | **CONFIRMED** | `evidence/phase6e/hash_diff.txt` (exit 0) + `build1.log`/`build2.log` |
| Sanity 13 stron + sitemap + robots | **CONFIRMED** | `evidence/phase6e/sanity.log` (SANITY OK, exit 0) — z nowymi asercjami exact self-canonical + sitemap kompletność/unikalność |
| Meta 4/4 (title == oczekiwany, H1 == 1) | **CONFIRMED** | `evidence/phase6e/meta.log` (exit 0) — asercje wzmocnione w `check_phase2_meta.py` |
| Links 0 broken (publiczne) | **CONFIRMED** | `evidence/phase6e/links.log` (282 linki, 0 broken, exit 0) — `_src` wykluczone jawnie |
| HTML sanity 14/14 | **CONFIRMED** | `evidence/phase6e/html_sanity.log` (exit 0) |
| UTM logic 5/5 | **CONFIRMED** | `evidence/phase6e/utm_logic.log` (exit 0) |
| Phase3 12/12 | **CONFIRMED** | `evidence/phase6e/phase3.log` (exit 0) |
| Phase6a 36/36 | **CONFIRMED** | `evidence/phase6e/phase6a.log` (exit 0) |
| UTM E2E 34/34 (landing→CTA→form, privacy) | **CONFIRMED** | `evidence/phase6e/phase6c_utm_e2e.log` (34/34, exit 0) |
| Preview HTTP 200 | **CONFIRMED** | `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8899/` → 200 (sesja 6E) |
| 0 cookies / 0 UTM w localStorage | **CONFIRMED** | asercje w `phase6c_utm_e2e.mjs` (privacy checks w logu E2E) |
| Lighthouse 90/100/100/100, LCP 3.7 s | **NOT_CONFIRMED (6E)** | wynik z Phase 6A (raport 6A); nie rerunowano w 6E — LCP 3.7 s = Needs Improvement, nieblokujący concern |
| Push `c957dda → 0d14ed3` autoryzowany przez Radosława | **NEEDS_HUMAN** | reflog pokazuje `update by push` 2026-08-15 23:45:57 CEST, spoza procesów 6C/6E |
| GitHub Pages deployment po pushu | **NEEDS_HUMAN** | brak dostępu do zdalnego statusu; zero działań zdalnych z tego taska |
| Klasyfikacja daf-daz-site (projekt vs produkt) + owner lane → registry | **NEEDS_HUMAN** | decyzja Zołzy/Radosława; brak wpisu w `project-registry.md` jawnie oznaczony |
| Akceptacja prawna privacy copy (localNoticeSeen) | **NEEDS_HUMAN** | copy ujawnione (F4 6C); zgodność prawna po stronie człowieka |
| Fakty ÖIF/ÖSD | **NEEDS_HUMAN** | ręczna weryfikacja merytoryczna |

## 4. Rollback policy (dokładna)

Wszystkie operacje **lokalne**. Zdalne reset/push/force-push `origin` — **ZAKAZ bez jawnego approval Radosława/Zołzy**.

| Cel | Komenda | Warunki bezpieczeństwa |
|-----|---------|------------------------|
| Odtwórz stan PO remediacji 6C | `git reset --hard 0523456` | stan z remediacją; NIE cofa 6C |
| Cofnij Phase 6C (usuń remediację) | `git revert 0523456` | bezpieczny, historia nietknięta; preferowany |
| Cofnij Phase 6C (alternatywa) | `git reset --hard 0d14ed3` | **wyłącznie po zabezpieczeniu dirty tree** (commit/stash zmian 6E i faz 1–6A); 0d14ed3 = PO Phase 5, PRZED 6C |
| Cofnij working tree do HEAD | `git checkout -- .` + `python3 build.py` | traci zmiany w tree; najpierw commit/stash |
| Stan sprzed SEO | `git checkout c957dda -- .` | commity/origin nietknięte; NIE `reset --hard origin/main` (0d14ed3 = PO SEO) |
| Selektywnie | `git revert d929a75..0d14ed3` (odwrotnie) | per-faza |
| Zdalne repo | — | **ZAKAZ bez jawnego approval** |

## 5. HUMAN_REQUIRED (dla Zołzy / Radosława — bez zmian względem 6C)

1. Registry/klasyfikacja: projekt vs produkt + owner lane → wpis w `project-registry.md`.
2. Potwierdzenie autoryzacji pushu `c957dda → 0d14ed3` (2026-08-15 23:45:57 CEST) i czy GitHub Pages wykonał deployment.
3. Akceptacja prawna privacy copy + ręczna weryfikacja faktów ÖIF/ÖSD.
4. Jakikolwiek przyszły push/deploy, realny test Formspree, GSC lub GBP — osobna jawna decyzja.

---

## RESULT_CAPSULE

- **task_id:** t_2d70c09c392eda92
- **status:** **PASS** (R1–R5 zamknięte; 10/10 suites exit 0; 0 nowych regresji; HUMAN_REQUIRED bez zmian)
- **baseline:** MORDAX_SEO_PHASE6_REREVIEW.md (CHANGES_REQUESTED, R1–R5); HEAD 0523456, origin/main 0d14ed3, pre-SEO c957dda
- **actions_taken:** (1) rollback: `<SHA-6C>` usunięte z raportów + obu STATE_LOG-ów, realne SHA (0523456/0d14ed3/c957dda), rozdzielenie „odtwórz stan po 6C” vs „cofnij 6C”, warunki bezpieczeństwa, zakaz zdalnego reset/push bez approval; (2) evidence: `scripts/run_phase6e_evidence.sh` + `evidence/phase6e/` (11 plików: raw stdout/stderr + exit codes + env dla 10 suites); (3) claims: wzmocnione asercje w `check_phase2_meta.py` (title==oczekiwany, H1==1), `sanity_check.py` (exact self-canonical, sitemap kompletność+unikalność), `check_links_phase2.py` (jawny exclude `_src`); (4) `README.md` (build/QA/source-output/rollback); (5) STATE_LOG projektowy + globalny zaktualizowane (wpis 6E + poprawka rollbacku 6C); commit lokalny **`6083ad4`** (20 plików) bez push
- **files_changed:** SEO_PHASE6C_REMEDIATION_REPORT.md (M), scripts/sanity_check.py (M), scripts/check_phase2_meta.py (M), scripts/check_links_phase2.py (M), README.md (nowy), scripts/run_phase6e_evidence.sh (nowy), evidence/phase6e/* (nowe, 11), STATE_LOG projektowy (M), globalny STATE_LOG (M)
- **verification:** build idempotentny (hash diff 0); sanity 13/13; meta 4/4 (nowe asercje); links 0 broken (282); HTML sanity 14/14; UTM logic 5/5; phase3 12/12; phase6a 36/36; UTM E2E 34/34; preview HTTP 200; 0 cookies / 0 UTM w localStorage — wszystkie exit 0, raw logi w evidence/phase6e/
- **evidence:** evidence/phase6e/{build1,build2,hash1,hash2,hash_diff,sanity,meta,links,html_sanity,utm_logic,phase3,phase6a,phase6c_utm_e2e}.log/.txt; grep `<SHA-6C>` → 0 poza werdyktem Mordax
- **rollback_path:** patrz sekcja 4 (lokalny; zdalny ZAKAZ bez approval)
- **risks:** LCP 3.7 s (Needs Improvement, nieblokujący); deployment po pushu 23:45 niepotwierdzony (NEEDS_HUMAN); privacy copy czeka na akceptację prawną; dirty tree zawiera zmiany faz 1–6A (niezacommitowane, poza 6E)
- **next_action:** końcowy re-review Mordaxa (Phase 6F) przed jakimkolwiek push/deploy; decyzje HUMAN_REQUIRED #1–4 przez Zołzę/Radosława
