# DaF/DaZ — Deutschunterricht in Wien (daf-daz-site)

Statyczna strona usługowa (DE/PL/EN) dla lekcji niemieckiego w Wiedniu.
Repo: `Lord-Kedaar/daf-daz-site` — **bez push/deploy z tego workspace bez jawnej zgody.**

## Struktura: source → generated output

| Ścieżka | Rola |
|---------|------|
| `_src/` | źródła: `index.html` (DE), `landings/*.html` (4 landingi), `legal/*.html` (imprint/privacy DE) |
| `build.py` | generator: 3 języki (DE/PL/EN) + 4 landingi → 13 plików HTML w katalogu głównym; centralizuje META, THEME_LABEL, OG_ALT_TEXT, hreflang, canonical |
| `assets/` | współdzielone assety (css/js/img/icons) — NIE są kopiowane przez build, linkowane bezpośrednio |
| `index.html`, `pl/`, `en/`, `legal/`, `deutsch-*/`, `pl/niemiecki-*/` | **generated output** — nie edytować ręcznie, tylko przez `build.py` |
| `404.html` | osobny publiczny plik (nie output builda), `noindex` |
| `sitemap.xml` | generowany przez `build.py` (po buildzie, lastmod = data buildu); `robots.txt` ręcznie utrzymywany, oba weryfikowane przez sanity_check |

## Build

```bash
python3 build.py          # generuje 13 plików HTML z _src/ + sitemap.xml (exit 0)
```

Idempotencja: dwa kolejne buildy muszą dać identyczne hashe
(`evidence/phase6e/hash1.txt` vs `hash2.txt`, diff = 0).

## QA (pełny zestaw)

```bash
# statyczne (bez przeglądarki)
python3 scripts/sanity_check.py          # 13 stron: title/desc/canonical(exact self)/H1, lang,
                                         #   hreflang, linki/assety, JSON-LD, sitemap (kompletność+unikalność), robots
python3 scripts/check_phase2_meta.py     # 4 landingi: title == oczekiwany, H1 count == 1, forbidden patterns
python3 scripts/check_links_phase2.py    # 0 broken (publiczne, bez _src)
python3 scripts/phase6a_html_sanity.py   # 14 publicznych HTML: tagi zbalansowane, doctype/viewport/charset/lang, JSON-LD
node scripts/test_utm_logic.mjs          # 5/5 logika UTM (pure logic)

# browser E2E (wymaga: serwer 127.0.0.1:8899 + headless Chrome CDP 9222)
node scripts/phase3_verify.mjs           # 12/12 CTA/form/UTM/a11y/overflow
node scripts/phase6a_qa.mjs              # 36/36 overflow mobile+desktop, form controls, focus
node scripts/phase6c_utm_e2e.mjs        # 34/34 UTM/landing_page landing→CTA→form, privacy (0 cookies/storage)

# wszystko naraz z trwałym raw evidence (stdout+stderr+exit code+env):
bash scripts/run_phase6e_evidence.sh    # logi w evidence/phase6e/*.log
```

Preview: `python3 -m http.server 8899 --bind 127.0.0.1` → http://127.0.0.1:8899/

## Rollback (wszystko lokalne; zdalne reset/push ZAKAZANE bez jawnego approval)

**Krok 0 — ochrona dirty tree (OBOWIĄZKOWY przed każdą operacją nadpisującą working tree):**

```bash
git status --porcelain          # sprawdź stan: modified + untracked
git stash push -u -m "backup-$(date +%Y%m%d-%H%M%S)"   # wersja A: stash (z untracked)
# ALBO
git add -A && git commit -m "backup: dirty tree przed rollbackiem $(date +%Y%m%d-%H%M%S)"  # wersja B: commit backup
# ALBO
git branch backup-$(date +%Y%m%d-%H%M%S)   # wersja C: branch backup (nie przenosi zmian — wymaga A lub B)
```

Bez zabezpieczonego dirty tree: **STOP** — `git reset --hard`, `git checkout -- .` i
`git checkout <ref> -- .` nadpisują tracked working tree bezpowrotnie.

| Cel | Komenda | Warunki bezpieczeństwa |
|-----|---------|------------------------|
| Cofnij Phase 6E (2 commity) | `git revert --no-edit b495551 6083ad4` (odwrotnie) | bezpieczny, historia nietknięta; preferowany |
| Cofnij Phase 6E (alternatywa) | `git reset --hard 0523456` | **wyłącznie po kroku 0**; 0523456 = stan PO 6C, PRZED 6E |
| Cofnij Phase 6C (usuń remediację) | `git revert --no-edit 0523456` | bezpieczny, historia nietknięta; preferowany |
| Cofnij Phase 6C (alternatywa) | `git reset --hard 0d14ed3` | **wyłącznie po kroku 0**; 0d14ed3 = stan PO Phase 5, PRZED 6C |
| Cofnij Phase 1–5 (selektywnie, włącznie z d929a75) | `git revert --no-edit d929a75 b7e2457 7399a47 1680630 267f42b 54eef98 4a7fafb 0d14ed3` (odwrotnie) | per-faza; zakres jawnie obejmuje pierwszy commit SEO `d929a75` |
| Cofnij working tree do HEAD | `git checkout -- .` + `python3 build.py` | **wyłącznie po kroku 0**; traci zmiany w tree |
| Stan sprzed SEO (pełny pakiet) | `git checkout c957dda -- .` + `python3 build.py` | **wyłącznie po kroku 0**; commity/origin nietknięte; NIE `reset --hard origin/main` |
| Zdalne repo | — | **ZAKAZ bez jawnego approval** — żaden reset/push/force-push `origin` |

Uwaga: `origin/main` (0d14ed3) to stan PO Phase 5, NIE punkt sprzed SEO.
Ostatni commit sprzed faz SEO: `c957dda`. Pełny zakres SEO: `d929a75..b495551` (11 commitów).

## Raporty faz SEO

- `SEO_PHASE1_TECHNICAL_REPORT.md` … `SEO_PHASE6C_REMEDIATION_REPORT.md`,
  `SEO_PHASE6_QA_REPORT.md`, `SEO_PHASE6E_CLOSURE_REPORT.md`,
  `MORDAX_SEO_PHASE6_REVIEW.md`, `MORDAX_SEO_PHASE6_REREVIEW.md`,
  `SEO_PRE_DEPLOY_GATE.md`, `GSC_MEASUREMENT_PREP.md`
- Evidence: `evidence/phase6c/` (build idempotency 6C), `evidence/phase6e/` (raw logi 6E)
