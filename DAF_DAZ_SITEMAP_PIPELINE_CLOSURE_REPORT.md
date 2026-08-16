# DAF_DAZ_SITEMAP_PIPELINE_CLOSURE_REPORT

- **Data:** 2026-08-16
- **Task:** t_89ea0255c0b497c2 (MCP request `daf-daz-sitemap-pipeline-closure-2026-08-16`)
- **Wykonawca:** Metricus
- **Repo:** `Lord-Kedaar/daf-daz-site` (GitHub Pages, CNAME daf-daz.radoslaw-pleskot.com)
- **Branch:** main
- **Baseline:** `c6e52cb` (origin/main, zgodny z HEAD)
- **Status:** DONE_VERIFIED

---

## 1. Pipeline sitemap — integracja w buildzie

**Stan wejściowy:** `scripts/make_sitemap.py` istniał i działał poprawnie, ale nie był uruchamiany po buildzie — sitemap.xml był generowany ręcznie (lastmod mógł się dezaktualizować). Repo nie ma `.github/workflows/` — deploy to GitHub Pages (Pages build and deployment, dynamic), więc jedynym deterministycznym punktem integracji jest `build.py`.

**Zmiana (minimalna, fail-closed):** `build.py` uruchamia `scripts/make_sitemap.py` po wygenerowaniu wszystkich stron:

- `import subprocess` dodany;
- po pętli landingów: sprawdzenie istnienia `scripts/make_sitemap.py` (brak → `sys.exit(1)`, build fail-closed — nie shipujemy starych lastmodów) + `subprocess.run([sys.executable, sitemap_script], check=True)` (niezerowy exit generatora → build fail);
- brak kruchej logiki, brak zmian hostingu, brak nowych zależności (stdlib only).

**README.md** zaktualizowany: `sitemap.xml` przeniesiony z "ręcznie utrzymywane" do "generowany przez build.py (po buildzie, lastmod = data buildu)".

## 2. Build + testy SEO

| Test | Wynik |
|---|---|
| `python3 build.py` | exit 0, 13 stron + sitemap.xml (13 URL-i, lastmod 2026-08-16) |
| Idempotencja (2× build, hash diff) | PASS (zero diff) |
| `scripts/sanity_check.py` | SANITY OK — 13 pages + sitemap + robots |
| `scripts/check_phase2_meta.py` | OK (4 landingi, title/H1/forbidden) |
| `scripts/check_links_phase2.py` | 9 pages, 282 links, 0 broken |
| `scripts/phase6a_html_sanity.py` | HTML/JSON-LD OK — 14 plików |
| `scripts/test_utm_logic.mjs` | 5/5 PASS |
| `scripts/phase3_verify.mjs` (CDP) | 12/12 PASS |
| `scripts/phase6a_qa.mjs` (CDP) | 36/36 PASS |
| `scripts/phase6c_utm_e2e.mjs` (CDP) | 34/34 PASS |

**Sitemap:** 13 URL-i (9 canonical index/legal + 4 landingi), unikalne, zgodne z plikami na dysku, lastmod = 2026-08-16 (data buildu). Wygenerowane pliki HTML byte-identyczne z HEAD (zero diff) — zmiana pipeline'u nie wpływa na output stron.

> Uwaga: pierwszy przebieg `phase6c_utm_e2e.mjs` po starcie headless Chrome dał fałszywy FAIL (0 CTA linków — strona nie zdążyła się załadować w świeżo uruchomionej przeglądarce). Po rozgrzaniu CDP: 34/34 PASS. Flake środowiskowy, nie regresja — potwierdzone debugiem (6 linków `/#kontakt` obecnych, JS załadowany).

## 3. GOOGLE_BUSINESS_PROFILE_COPY.md — real-world name

§1 (Dane NAP) przepisany:

- **Nazwa domyślna:** `Radosław Pleskot` (wariant ASCII `Radoslaw Pleskot`) — dokładna, publicznie używana nazwa właściciela (imprint, JSON-LD Person, meta author). Usunięta rekomendacja keyword-stuffed `Radoslaw Pleskot – Deutschunterricht Wien` jako nazwy profilu.
- Opis usług (Deutschunterricht, DaF/DaZ) i lokalizacja (Wien) → odpowiednie pola (opis profilu, kategorie, service area), NIE w nazwie.
- Jawny zakaz: słowa kluczowe, "Wien" jako człon marketingowy, myślniki z opisem działalności, emoji, "Best German Tutor". Nazwa z dopiskiem opisowym dopuszczalna wyłącznie, jeśli to rzeczywista zarejestrowana nazwa działalności.
- **Zachowane bez zmian:** jeden profil dla DaF/DaZ, service area Vienna, ukryty adres (service-area business), zakaz PO box / virtual office, weryfikacja przez właściciela (HUMAN_REQUIRED).

## 4. Zakres / zero side-effects

- Nie zmieniono publicznego copy (wygenerowane pliki HTML nietknięte — zero diff vs HEAD).
- Nie logowano się do GSC/GBP, nie tworzono profilu.
- Nie zmieniano hostingu, nie dodawano workflow (brak `.github/` — GitHub Pages dynamic).
- Nie ruszano cudzych zmian: `SEO_PHASE1_TECHNICAL_REPORT.md`, `SEO_PHASE2_CONTENT_ARCHITECTURE.md` (modified przed startem) NIE wchodzą do commita; untracked raporty faz NIE dodane.

## 5. Commit i deploy

- **Commit:** 1 commit na main (build.py + README.md + GOOGLE_BUSINESS_PROFILE_COPY.md), push na origin/main.
- **Weryfikacja produkcji:** po deployu GitHub Pages — HTTP 200 na kluczowych URL-ach, sitemap.xml z produkcji: 13 URL-i, lastmod 2026-08-16.

## 6. Ryzyka / uwagi

- `make_sitemap.py` używa `datetime.date.today()` — lastmod = data buildu (deterministyczne w skali dnia; zmiana w ciągu dnia to feature, nie bug).
- Rollback: `git revert <commit>` + push (pipeline wraca do stanu sprzed integracji; sitemap wraca do ręcznego utrzymania).

## RESULT_CAPSULE

- **task_id:** t_89ea0255c0b497c2
- **status:** DONE_VERIFIED
- **baseline:** c6e52cb (origin/main)
- **actions_taken:** integracja make_sitemap.py w build.py (fail-closed) → build + 10 zestawów testów (wszystkie zielone) → aktualizacja GBP doc (real-world name) → commit + push → weryfikacja produkcji
- **files_changed:** build.py, README.md, GOOGLE_BUSINESS_PROFILE_COPY.md (+ raport)
- **verification:** build exit 0, idempotencja PASS, sanity 13/13, meta OK, links 282/0, html_sanity 14/14, UTM 5/5, phase3 12/12, phase6a 36/36, phase6c 34/34; sitemap 13 URL-i lastmod 2026-08-16
- **evidence:** powyższe sekcje; git diff; curl na produkcji
- **rollback_path:** `git revert <commit> && git push origin main`
- **risks:** niskie; flake phase6c przy zimnym CDP (środowiskowy, nie regresja)
- **next_action:** czynności HUMAN_REQUIRED z DAF_DAZ_SEO_PACKAGE_REPORT.md §7 (GSC/GBP)
