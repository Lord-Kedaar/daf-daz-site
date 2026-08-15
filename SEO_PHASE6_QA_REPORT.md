# SEO Phase 6A — Full Local QA Report

- **Data:** 2026-08-16
- **Repo:** /Users/radek/PROJECTS/daf-daz-site
- **Zakres:** pełne lokalne QA po Fazach 1–5 (build, crawl, HTML, sitemap/robots, canonical/hreflang, JSON-LD, render, a11y, Lighthouse, regresja faz 1–3)
- **Publikacja:** NIE — zero zmian w GSC/GBP/Formspree, zero push/deploy, zero DNS/Cloudflare
- **Środowisko:** Python 3.9.6, Node v22.22.3, Chrome 151 headless (CDP 9222), serwer statyczny 127.0.0.1:8899, Lighthouse 13.4.1

## Wynik: PASS

| # | Kontrola | Evidence | Wynik | Naprawa |
|---|----------|----------|-------|---------|
| 1 | Production build | `python3 build.py` exit=0 (2×); 13 plików HTML wygenerowanych przez build.py (9 index/legal + 4 landingi) + `404.html` jako osobny publiczny plik (nie output builda) = 14 publicznych plików HTML; hashe SHA-1 identyczne po 2. buildzie (`diff evidence/phase6c/hash1.txt evidence/phase6c/hash2.txt` → brak różnic) | PASS | brak |
| 2 | Idempotencja buildu | jw. — build 2 nie zmienił żadnego pliku | PASS | brak |
| 3 | Crawl lokalnego buildu + link checker | `scripts/sanity_check.py`: SANITY OK — 13 stron + sitemap + robots; `scripts/check_links_phase2.py`: 0 broken w plikach publicznych (jedyne zgłoszenia dotyczą `_src/index.html` — szablon źródłowy z relatywnymi ścieżkami, które build.py przepisuje na `/assets/...`; sanity potwierdza istnienie wszystkich assetów publicznych) | PASS | brak |
| 4 | HTML sanity | `scripts/phase6a_html_sanity.py` (nowy): 14/14 publicznych plików — tagi zbalansowane (stack parser), doctype, viewport, charset, html lang obecne | PASS | brak |
| 5 | Sitemap | 13 `<loc>` pod `https://daf-daz.radoslaw-pleskot.com`, wszystkie w kanonicznym zbiorze, targety istnieją na dysku, lastmod 2026-08-13 (nie stale 2026-01-01) | PASS | brak |
| 6 | Robots | `Sitemap: https://daf-daz.radoslaw-pleskot.com/sitemap.xml` — zgodny z BASE | PASS | brak |
| 7 | Canonicale | 13/13 stron indexowalnych: canonical self-referencing, absolutny, pod BASE; `404.html` ma `noindex` (canonical nie wymagany) | PASS | brak |
| 8 | Hreflang | index/legal (3 języki): 4 wpisy (de/pl/en/x-default); para DE↔PL landings: 2 wpisy wzajemne; single-lang landings: 0 (brak fałszywych tłumaczeń); wszystkie href absolutne pod BASE | PASS | brak |
| 9 | Walidacja JSON-LD | `scripts/phase6a_html_sanity.py`: wszystkie bloki `application/ld+json` parsują jako JSON, mają `@context`, `@graph` z @type (Person/WebSite/Service/WebPage), @id refs resolve; sanity_check: brak `unitCode H` (30 EUR = 45 min) | PASS | brak |
| 10 | Viewport/render mobile | `scripts/phase6a_qa.mjs` (nowy): 14 stron × 390×844 — scrollW == vw (390) na każdej, zero overflow | PASS | brak |
| 11 | Viewport/render desktop | jw. × 1440×900 — scrollW ≤ vw (1425–1440) na każdej, zero overflow | PASS | brak |
| 12 | Dostępność CTA | hero CTA focusable (tabIndex=0), focus-visible outline 3px + box-shadow (phase3_verify #7) | PASS | brak |
| 13 | Form controls (klawiatura/focus) | `scripts/phase6a_qa.mjs`: 14 kontrolek na formularzu (de/pl/en) — wszystkie widoczne, nie-disabled, tabIndex ≥ 0; wyjątki zamierzone: `website` (honeypot antyspam: tabindex=-1, autocomplete=off, zero-size) i `form-status-close` (w kontenerze `display:none`, pokazywany po submit) | PASS | brak |
| 14 | Lighthouse mobile (laboratoryjny) | Lighthouse 13.4.1 na `http://127.0.0.1:8899/`: **Performance 90, Accessibility 100, Best Practices 100, SEO 100**; FCP 1.2 s, LCP 3.7 s, TBT 0 ms, CLS 0, SI 1.5 s. **Uwaga:** LCP 3.7 s mieści się w „Needs Improvement” (2,5–4,0 s), NIE w „Good” (≤2,5 s) — kandydat do optymalizacji w przyszłej fazie | PASS (z concernem LCP) | brak |
| 15 | Konsola przeglądarki | CDP Runtime: 0 błędów / 0 warningów / 0 wyjątków na 4 kluczowych stronach (/, /pl/, landing DE, landing PL) | PASS | brak |
| 16 | Regresja faz 1–3 — 4 landingi | `scripts/check_phase2_meta.py`: 4/4 landingi — title zgodny z LANDING_PAGES, H1 count=1, brak forbidden patterns (A1-C1, unitCode, example.com, localhost, keyword stuffing); słowa: 608–739 | PASS | brak |
| 17 | Regresja faz 1–3 — formularz bez wysyłki | `scripts/phase3_verify.mjs` #3: pola wypełnialne (name/email/message/consent/level/goal), action=Formspree `https://formspree.io/f/xqeeogvv`, method=POST — nietknięte | PASS | brak |
| 18 | Regresja faz 1–3 — UTM hidden fields | phase3_verify #4: bez UTM w URL → pola puste (fail-safe); z `?utm_source=google&utm_medium=cpc&utm_campaign=test` → capture działa; landing_page poprawny | PASS | brak |
| 19 | Regresja faz 1–3 — page titles/H1 | sanity_check: title/description/canonical/H1 unikalne na 13 stronach; check_phase2_meta: 4 landingi OK | PASS | brak |
| 20 | Regresja faz 1–3 — wezwania do kontaktu | phase3_verify #1/#2/#5/#6: hero CTA above the fold (top=541px, vh=844), CTA po cenach na index + 2 landingach (DE: „Kostenloses Erstgespräch vereinbaren", PL: „Umów bezpłatną konsultację"), quick-answer 5 items, form-hint nad formularzem | PASS | brak |

## Artefakty QA dodane (tylko skrypty weryfikacyjne — zero zmian w stronie)

- `scripts/phase6a_qa.mjs` — overflow mobile/desktop + form controls focusability + CTA focus (36 kontroli)
- `scripts/phase6a_html_sanity.py` — HTML tag-balance + doctype/viewport/charset/lang + JSON-LD deep validation (14 plików)

## RESULT_CAPSULE

- task_id: t_43faa35f7a63f6df
- status: **PASS**
- baseline: build.py (600 linii, LANDING_PAGES 4, META 3 języki), sanity_check.py 13 stron, phase3_verify.mjs 12 kontroli
- actions_taken: build 2× + hash diff (idempotencja); sanity_check; check_links_phase2; check_phase2_meta; phase3_verify (12/12); nowe phase6a_qa.mjs (36/36) + phase6a_html_sanity.py (14/14); weryfikacja canonical/hreflang per plik; Lighthouse 13.4.1; CDP console check
- files_changed: scripts/phase6a_qa.mjs (nowy), scripts/phase6a_html_sanity.py (nowy), SEO_PHASE6_QA_REPORT.md (nowy) — brak zmian w kodzie strony
- verification: 20/20 kontroli PASS; Lighthouse 90/100/100/100 (LCP 3.7 s = Needs Improvement, nie Good); 0 błędów konsoli
- evidence: `evidence/phase6c/build1.log`, `evidence/phase6c/build2.log`, `evidence/phase6c/hash1.txt`, `evidence/phase6c/hash2.txt` (trwałe w repo — patrz też SEO_PHASE6C_REMEDIATION_REPORT.md); wcześniejsze /tmp/build*.log, /tmp/hash*.txt, /tmp/lh_index.json były nietrwałe i zostały zastąpione trwałymi artefaktami
- rollback_path: n/d — zero zmian w produkcji; skrypty QA można usunąć bez wpływu na build
- risks: LCP 3.7 s (performance 90) — „Needs Improvement” (2,5–4,0 s), kandydat do optymalizacji w przyszłej fazie; brak hreflang na single-lang landings to decyzja projektowa (brak realnych odpowiedników)
- next_action: brak — Phase 6A zamknięta PASS; kolejna faza wg planu SEO (np. optymalizacja LCP lub publikacja)
