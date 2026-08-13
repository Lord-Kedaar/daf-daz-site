# SEO_PHASE2_CONTENT_ARCHITECTURE

DaF/DaZ SEO — Phase 2: Information Architecture + Priority Landings
Repo: Lord-Kedaar/daf-daz-site (workspace /Users/radek/PROJECTS/daf-daz-site)
Data: 2026-08-13 · Commit: `7399a47` (lokalny, NIEpushowany)

---

## 1. Mapa URL → intent → język → title → H1 → główne CTA

| URL | Search intent | Język | Title | H1 | Główne CTA |
|---|---|---|---|---|---|
| `/deutsch-privatunterricht-wien/` | „Privatunterricht Deutsch Wien" — osoba szuka indywidualnych lekcji, chce wiedzieć czy/jak/za ile | de | Privatunterricht Deutsch in Wien \| Radosław Pleskot | Privatunterricht Deutsch in Wien | Kostenloses Erstgespräch vereinbaren |
| `/deutsch-fuer-polnischsprachige-wien/` | „Deutsch für Polen Wien" / „Deutschkurs für Polnischsprachige" — osoba polskojęzyczna szuka lekcji z wyjaśnieniami po polsku | de | Deutsch für Polnischsprachige in Wien \| Radosław Pleskot | Deutsch für Polnischsprachige in Wien | Kostenloses Erstgespräch vereinbaren |
| `/pl/niemiecki-dla-polakow-wieden/` | „niemiecki dla Polaków Wiedeń" — Polak w Wiedniu szuka nauki z polskim wsparciem | pl | Niemiecki dla Polaków w Wiedniu \| Radosław Pleskot | Niemiecki dla Polaków w Wiedniu | Umów bezpłatną konsultację |
| `/pl/przygotowanie-oeif-oesd-wieden/` | „przygotowanie do ÖIF Wiedeń" / „ÖSD przygotowanie" — kandydat do egzaminu szuka rzetelnego przygotowania | pl | Przygotowanie do egzaminów ÖIF i ÖSD w Wiedniu \| Radosław Pleskot | Przygotowanie do egzaminów ÖIF i ÖSD w Wiedniu | Umów bezpłatną konsultację |

Klucz znaczeniowy (North Star PL): „Uczę niemieckiego w Wiedniu. Polski służy jako język objaśnień wtedy, gdy przyspiesza zrozumienie." — zaimplementowany w hero obu stron PL oraz w sekcji „Dlaczego polski jako pomost?".

Każda strona ma unikalną strukturę:
- **privatunterricht**: hero answer-first → 3 karty (co czeka) → „So läuft es ab" (3 kroki) → ceny → FAQ (5 pytań) → CTA.
- **deutsch-fuer-polnischsprachige**: hero answer-first (polski jako pomost) → sekcja „Warum Polnisch als Brücke?" → 3 karty dla kogo → 3 kroki → ceny → FAQ (5 pytań) → CTA.
- **niemiecki-dla-polakow**: hero answer-first → „Dlaczego polski jako pomost?" → 3 karty dla kogo → 3 kroki → ceny → FAQ (5 pytań) → CTA.
- **przygotowanie-oeif-oesd**: hero answer-first (bez gwarancji egzaminacyjnych) → 3 kroki przygotowania → sekcja „Mówię uczciwie" (explicit no-guarantee) → 3 karty dla kogo → ceny → FAQ (5 pytań, w tym różnica ÖIF vs ÖSD) → CTA.

## 2. Mapa internal linking

```
index DE (/) ──► /deutsch-privatunterricht-wien/          (karta „Erwachsene")
index DE (/) ──► /deutsch-fuer-polnischsprachige-wien/    (karta „Erwachsene")
index PL (/pl/) ──► /pl/niemiecki-dla-polakow-wieden/     (karta „Dorośli")
index PL (/pl/) ──► /pl/przygotowanie-oeif-oesd-wieden/   (sekcja „Jak pracuję")

/deutsch-privatunterricht-wien/ ──► /deutsch-fuer-polnischsprachige-wien/  (sekcja CTA)
/deutsch-fuer-polnischsprachige-wien/ ──► /pl/niemiecki-dla-polakow-wieden/  (hreflang pair + link w CTA)
/pl/niemiecki-dla-polakow-wieden/ ──► /pl/przygotowanie-oeif-oesd-wieden/  (sekcja CTA)
/pl/przygotowanie-oeif-oesd-wieden/ ──► /pl/niemiecki-dla-polakow-wieden/  (sekcja CTA)

Wszystkie landingi ──► index (logo, nav, footer) ──► /#kontakt (formularz)
Wszystkie landingi ──► legal (footer: /legal/*.html lub /pl/legal/*.html)
```

hreflang: **tylko** para DE↔PL `/deutsch-fuer-polnischsprachige-wien/` ↔ `/pl/niemiecki-dla-polakow-wieden/` (rzeczywiste odpowiedniki). Pozostałe landingi nie mają hreflang — nie udajemy translacji, których nie ma. x-default tylko na stronach 3-języcznych (index/legal), bez zmian.

## 3. Zmienione pliki i commit

Commit: `7399a47` — „SEO Phase 2: 4 priority landings (DE/PL) + IA, internal links, sitemap" (16 plików, +3344/-13)

| Plik | Zmiana |
|---|---|
| `_src/landings/deutsch-privatunterricht-wien.html` | NOWY — źródło landinga DE |
| `_src/landings/deutsch-fuer-polnischsprachige-wien.html` | NOWY — źródło landinga DE |
| `_src/landings/niemiecki-dla-polakow-wieden.html` | NOWY — źródło landinga PL |
| `_src/landings/przygotowanie-oeif-oesd-wieden.html` | NOWY — źródło landinga PL |
| `build.py` | LANDING_PAGES (meta/canonical/hreflang), landing_json_ld, make_landing_head, generate_landing, generacja w main() |
| `_src/index.html` | 3 kontekstowe linki wewnętrzne (DE: privatunterricht + polnischsprachige; PL: niemiecki-dla-polakow + oeif-oesd) |
| `scripts/sanity_check.py` | INDEXABLE +4, HREFLANG_GROUPS para DE↔PL, uogólniony check hreflang (2- i 3-językowy) |
| `scripts/make_sitemap.py` | URLS +4 |
| `sitemap.xml` | 13 URLi (regeneracja) |
| `index.html`, `pl/index.html`, `en/index.html` | regeneracja builda (en: tylko puste linie po pominiętych elementach DE/PL — treść bez zmian) |
| `deutsch-privatunterricht-wien/index.html` itd. (4) | NOWE — wygenerowane strony |

## 4. Wyniki walidacji

| Check | Wynik | Dowód |
|---|---|---|
| git diff zakres | PASS | tylko zamierzone pliki; en/index.html = whitespace-only |
| build lokalny | PASS | `python3 build.py` — 13 stron wygenerowanych |
| sanity_check | PASS | `SANITY OK — 13 pages + sitemap + robots passed` |
| link check (nowe+zmienione) | PASS | wszystkie href/src istnieją na dysku (skrypt walidacyjny, 0 błędów) |
| sitemap/robots | PASS | 13 loc pod subdomeną, robots → sitemap.xml |
| canonical graph | PASS | canonical self per URL (13/13) |
| hreflang graph | PASS | para DE↔PL reciprocal; brak hreflang na stronach bez odpowiednika |
| JSON-LD syntax | PASS | każdy blok parsuje, @context obecny, brak unitCode H |
| health check (HTTP) | PASS | `python3 -m http.server 8899` — 8/8 endpointów HTTP 200 (w tym 4 landingi) |
| forbidden patterns | PASS | brak A1-C1, unitCode, example.com, localhost |

## 5. RESULT_CAPSULE

- **task_id:** t_4ba117977a8cec85
- **status:** DONE_VERIFIED
- **baseline:** b7e2457 (Phase 1, zachowany) → 7399a47 (Phase 2)
- **actions_taken:** 4 landingi (2 DE, 2 PL) jako źródła `_src/landings/`; rozszerzenie build.py (canonical self, hreflang tylko dla realnej pary, JSON-LD WebPage, OG/Twitter, preload); sanity_check + sitemap +4 URL; 3 kontekstowe linki w index; build + pełna walidacja + health check
- **files_changed:** 16 (4 nowe źródła, 4 nowe strony, build.py, sanity_check.py, make_sitemap.py, sitemap.xml, _src/index.html, 3 regenerowane indexy)
- **verification:** build PASS, sanity PASS (13 stron), link check PASS, canonical+hreflang graph PASS, JSON-LD PASS, HTTP 200 na 8/8 endpointów
- **evidence:** `git log -1 7399a47`; `SANITY OK — 13 pages`; curl 200 × 8
- **rollback_path:** `git revert 7399a47` (lokalny commit, bez pusha — zero ryzyka produkcyjnego)
- **risks:** (1) en/index.html ma whitespace-only diff — kosmetyka builda, treść EN nietknięta; (2) landingi nie mają wersji EN — celowe (brak odpowiedników), do rozważenia w Phase 3; (3) brak mobilnego sanity w przeglądarce — użyte klasy istniejące (hero/cards/offer-grid/price-details), responsywne z CSS
- **next_action:** Phase 3 — rozważyć: (a) wersje EN landingów jeśli realne zapotrzebowanie, (b) GSC submission po deployu, (c) rozszerzenie linkowania z legal/404

**Zero-deploy attestation:** NIE pushowano, NIE deployowano, NIE dotykano DNS/Cloudflare/GSC/GBP/Formspree, NIE modyfikowano /Users/radek/Documents/moja-strona. Wszystkie zmiany lokalne w workspace.

**Verdict: PASS**
