# GSC_MEASUREMENT_PREP — DaF/DaZ SEO Phase 5

> Search Console / measurement preparation dla subdomeny **https://daf-daz.radoslaw-pleskot.com/**
> Repo: Lord-Kedaar/daf-daz-site · Data: 2026-08-13 · Zakres: wyłącznie przygotowanie (zero side effects)
> Status danych z konta: **NEEDS_GSC_ACCESS** — żadna wartość w tym pliku nie pochodzi z konta Google Search Console / Analytics / GBP. Wszystko poniżej to plan i checklista dla człowieka.

---

## 1. Property / sitemap submission checklist

### 1.1 Property (własność subdomeny)

| Krok | Akcja | Status |
|---|---|---|
| 1 | W GSC dodać property typu **Domain** (`daf-daz.radoslaw-pleskot.com`) lub **URL prefix** (`https://daf-daz.radoslaw-pleskot.com/`) | HUMAN_REQUIRED |
| 2 | Wybrać metodę weryfikacji: **HTML file upload** (najprostsza dla statycznego hostingu) lub **DNS TXT** (jeśli dostęp do panelu DNS) | HUMAN_REQUIRED |
| 3 | Po weryfikacji sprawdzić, czy property pokazuje się jako "Verified" | HUMAN_REQUIRED |
| 4 | Jeśli subdomena jest częścią szerszej domeny `radoslaw-pleskot.com` — rozważyć, czy nie dodać property Domain dla całej domeny (opcjonalne; nie mieszać danych) | HUMAN_REQUIRED |

Uwaga: strona jest hostowana statycznie (GitHub Pages / Cloudflare Pages — do potwierdzenia w panelu hostingu). Weryfikacja HTML file jest preferowana, bo nie wymaga dostępu do DNS.

### 1.2 Sitemap submission

| Krok | Akcja | Status |
|---|---|---|
| 1 | Sitemap istnieje lokalnie: `sitemap.xml` (13 URL-i, lastmod 2026-08-13) | CONFIRMED (repo) |
| 2 | robots.txt wskazuje sitemap: `Sitemap: https://daf-daz.radoslaw-pleskot.com/sitemap.xml` | CONFIRMED (repo) |
| 3 | W GSC: **Sitemaps → Add a new sitemap** → wpisać `sitemap.xml` | HUMAN_REQUIRED |
| 4 | Po submisji odczekać i sprawdzić status: "Success" + liczba odkrytych URL-i (oczekiwane ~13) | HUMAN_REQUIRED |
| 5 | Jeśli status "Couldn't fetch" — sprawdzić, czy sitemap jest dostępny publicznie pod pełnym URL | NEEDS_GSC_ACCESS |

### 1.3 Stan publiczny (do weryfikacji po deployu)

- `CNAME` w repo wskazuje subdomenę (CONFIRMED w repo — plik `CNAME` istnieje).
- Publiczna dostępność `https://daf-daz.radoslaw-pleskot.com/sitemap.xml` — **NOT_CONFIRMED** (deploy nie był wykonany w ramach tej fazy; wszystkie zmiany lokalne, niepushowane).

---

## 2. URL-e i landingi do ręcznej inspekcji w GSC

Po weryfikacji property i submisji sitemap — ręczna inspekcja (URL Inspection) każdego z poniższych:

### 2.1 Strony główne (3 warianty językowe)

| URL | Język | Uwagi |
|---|---|---|
| `https://daf-daz.radoslaw-pleskot.com/` | DE (domyślny) | Strona główna; canonical self |
| `https://daf-daz.radoslaw-pleskot.com/pl/` | PL | Wariant polski |
| `https://daf-daz.radoslaw-pleskot.com/en/` | EN | Wariant angielski |

### 2.2 Landingi priorytetowe (Phase 2, 4 sztuki)

| URL | Język | Cel wyszukiwania |
|---|---|---|
| `https://daf-daz.radoslaw-pleskot.com/deutsch-privatunterricht-wien/` | DE | "Deutsch Privatunterricht Wien" |
| `https://daf-daz.radoslaw-pleskot.com/deutsch-fuer-polnischsprachige-wien/` | DE | "Deutsch für Polnischsprachige Wien" |
| `https://daf-daz.radoslaw-pleskot.com/pl/niemiecki-dla-polakow-wieden/` | PL | "niemiecki dla Polaków Wiedeń" |
| `https://daf-daz.radoslaw-pleskot.com/pl/przygotowanie-oeif-oesd-wieden/` | PL | "przygotowanie ÖIF ÖSD Wiedeń" |

### 2.3 Strony prawne (6 sztuk)

| URL | Uwagi |
|---|---|
| `https://daf-daz.radoslaw-pleskot.com/legal/imprint.html` | DE |
| `https://daf-daz.radoslaw-pleskot.com/legal/privacy.html` | DE |
| `https://daf-daz.radoslaw-pleskot.com/pl/legal/imprint.html` | PL |
| `https://daf-daz.radoslaw-pleskot.com/pl/legal/privacy.html` | PL |
| `https://daf-daz.radoslaw-pleskot.com/en/legal/imprint.html` | EN |
| `https://daf-daz.radoslaw-pleskot.com/en/legal/privacy.html` | EN |

### 2.4 Procedura inspekcji (dla każdego URL)

1. URL Inspection → wkleić URL → Enter.
2. Sprawdzić: "URL is on Google" / "URL is not on Google".
3. Jeśli "not on Google" → **Request Indexing** (limit dzienny ~10–20; priorytet: 4 landingi + 3 indexy).
4. Sprawdzić zgłoszone canonical i hreflang (landingi mają canonical self + hreflang tylko dla realnej pary DE↔PL — Phase 2).
5. Sprawdzić, czy Google widzi wersję z `/` (trailing slash) — strona używa trailing slash w sitemap.

---

## 3. Plan pomiaru po 4 / 8 / 12 tygodniach

### 3.1 Harmonogram snapshotów

| Okno | Kiedy (od dnia weryfikacji property) | Zakres |
|---|---|---|
| Baseline | Dzień 0 (po weryfikacji + submisji sitemap) | Zapisanie stanu: liczba zindeksowanych URL-i, brak danych historycznych |
| T+4 tyg | ~28 dni | Pierwszy snapshot: czy sitemap się indeksuje, pierwsze impressions |
| T+8 tyg | ~56 dni | Drugi snapshot: trend, pierwsze kliknięcia, pozycje |
| T+12 tyg | ~84 dni | Trzeci snapshot: pełny raport vs baseline |

### 3.2 Metryki do odczytu w GSC (Performance → Search results)

| Metryka | Definicja | Źródło |
|---|---|---|
| Impressions | Liczba wyświetleń w wynikach Google | GSC Performance |
| Clicks | Liczba kliknięć z wyników Google | GSC Performance |
| CTR | Clicks / Impressions (w %) | GSC Performance (kolumna) |
| Average position | Średnia pozycja wyświetleń | GSC Performance (kolumna) |
| Landing page | Rozbicie wg strony docelowej (dimension) | GSC Performance → Pages |
| Language | Rozbicie wg wariantu językowego (dimension: URL zawiera /pl/, /en/ lub brak) | GSC Performance → Pages (filtrowanie po URL) |

### 3.3 Metryki biznesowe (poza GSC — wymagają źródła danych z formularza)

| Metryka | Definicja | Źródło | Status |
|---|---|---|---|
| Inquiry goal | Liczba zgłoszeń z formularza kontaktowego (leadów) | Formularz + hidden UTM fields (Phase 3) | CONFIRMED (mechanizm w repo); dane: NEEDS_GSC_ACCESS / NEEDS_FORM_DATA |
| First lesson | Liczba umówionych pierwszych lekcji | Poza stroną (kalendarz / komunikacja z klientem) | NEEDS_GSC_ACCESS (dane poza repo) |
| Retention | Utrzymanie uczniów (liczba kontynuacji po N lekcjach) | Poza stroną | NEEDS_GSC_ACCESS (dane poza repo) |

> Uwaga: GSC mierzy ruch organiczny. Inquiry / first lesson / retention to metryki konwersji — ich źródłem jest formularz (UTM capture) i ręczny rejestr. Plan: co 4 tygodnie zestawić GSC (impressions/clicks/CTR/position) z liczbą leadów z formularza w tym samym oknie.

### 3.4 Szablon snapshotu (do wypełnienia ręcznie)

```
## Snapshot T+<N> tyg — <data>
- Impressions (total): 
- Clicks (total): 
- CTR: 
- Avg position: 
- Top 5 landing pages: 
- Rozkład językowy (DE/PL/EN): 
- Liczba leadów z formularza (okno): 
- Liczba pierwszych lekcji (okno): 
- Uwagi / anomalie: 
```

---

## 4. Definicje metryk i ostrzeżenia przed mieszaniem danych

### 4.1 Definicje

- **Impressions** — ile razy URL pojawił się w wynikach wyszukiwania Google (nie = wyświetlenia strony).
- **Clicks** — ile razy użytkownik kliknął wynik prowadzący na stronę.
- **CTR** — clicks ÷ impressions × 100%. Niski CTR przy wysokiej pozycji = problem z tytułem/opisem; wysoki CTR przy niskiej pozycji = dobra trafność zapytania.
- **Average position** — średnia pozycja wszystkich wyświetleń (niższa liczba = lepiej; 1 = pierwszy wynik).
- **Landing page** — URL, na który prowadziło kliknięcie; w GSC dostępny jako dimension "Pages".
- **Language** — w tym projekcie: wariant URL (`/` = DE domyślny, `/pl/` = PL, `/en/` = EN). GSC nie ma natywnego filtra języka — filtruje się po URL.

### 4.2 Ostrzeżenia (nie mieszać danych)

1. **Brand vs non-brand:** zapytania zawierające "daf-daz", "radoslaw-pleskot" lub nazwę firmy to ruch brandowy. Przy analizie skuteczności SEO rozdzielić: filtr zapytań brandowych vs non-brand. Mieszanie zawyża CTR i pozycje.
2. **DE / PL / EN:** nie agregować metryk z różnych wariantów językowych w jednej liczbie bez rozbicia. Zapytania DE i PL dotyczą różnych intencji i konkurencji. Zawsze raportować per wariant.
3. **Okna czasowe:** GSC ma opóźnienie danych (~2–3 dni) i domyślnie pokazuje ostatnie 3 miesiące. Porównywać tylko równe okna (4/8/12 tygodni od tego samego dnia startu).
4. **Property:** jeśli dodane zostanie drugie property (np. domain-level dla całej `radoslaw-pleskot.com`), dane z obu property NIE są sumowalne — raportować osobno.
5. **UTM ≠ GSC:** parametry UTM nie pojawiają się w GSC jako osobna dimensja. UTM służą do atrybucji leadów w formularzu (hidden fields), nie do pomiaru organicznego.

---

## 5. UTM schema (zgodny z istniejącymi polami)

### 5.1 Pola istniejące w repo (Phase 3, commit 267f42b)

Formularz kontaktowy ma hidden fields (potwierdzone w `index.html`, `pl/index.html`, `en/index.html` oraz `_src/index.html`):

| Pole | Typ | Przeznaczenie |
|---|---|---|
| `utm_source` | hidden | Źródło ruchu (np. `google_business`, `google`, `facebook`) |
| `utm_medium` | hidden | Nośnik (np. `profile`, `cpc`, `organic`) |
| `utm_campaign` | hidden | Kampania (np. `gbp_wien`) |
| `utm_content` | hidden | Wariant / konkretny element (opcjonalny) |
| `landing_page` | hidden | Pełny path + search string (np. `/deutsch-privatunterricht-wien/?utm_source=google`) |

Mechanizm: `assets/js/main.js` (linia ~93) czyta `utm_*` z URL i wypełnia hidden fields; `landing_page` zapisuje pełny path + query. Testy: `scripts/test_utm_logic.mjs` — 5/5 PASS.

### 5.2 Konwencja wartości (zalecana)

| Parametr | Wartości | Przykład |
|---|---|---|
| `utm_source` | lowercase, bez spacji: `google_business`, `google`, `facebook`, `instagram`, `newsletter`, `referral` | `utm_source=google_business` |
| `utm_medium` | `profile`, `cpc`, `organic`, `social`, `email`, `link` | `utm_medium=profile` |
| `utm_campaign` | krótki identyfikator kampanii: `gbp_wien`, `winter_2026`, `oeif_prep` | `utm_campaign=gbp_wien` |
| `utm_content` | opcjonalny, wariant: `website_link`, `hero_cta`, `footer_link` | `utm_content=website_link` |
| `landing_page` | NIE wpisywać ręcznie — wypełnia JS automatycznie | — |

### 5.3 Gotowe URL-e kampanii

- GBP (z Phase 4): `https://daf-daz.radoslaw-pleskot.com/?utm_source=google_business&utm_medium=profile&utm_campaign=gbp_wien`
- Przykład kampanii płatnej: `https://daf-daz.radoslaw-pleskot.com/deutsch-privatunterricht-wien/?utm_source=google&utm_medium=cpc&utm_campaign=privat_wien`
- Przykład social: `https://daf-daz.radoslaw-pleskot.com/pl/niemiecki-dla-polakow-wieden/?utm_source=facebook&utm_medium=social&utm_campaign=pl_community`

### 5.4 Zasady

1. Zawsze `utm_source` + `utm_medium`; `utm_campaign` obowiązkowy dla kampanii płatnych.
2. `utm_content` tylko gdy rozróżniamy warianty w tej samej kampanii.
3. Nie dodawać parametrów spoza listy — JS ignoruje nieznane (fail-safe, test 5/5).
4. Strona jest statyczna — parametry UTM nie zmieniają treści; bezpieczne w użyciu.

---

## 6. Checklista human-required

Wykonanie poniższych kroków wymaga człowieka z dostępem do kont Google:

### 6.1 Własność / weryfikacja
- [ ] Dodać property w GSC (Domain lub URL prefix dla `https://daf-daz.radoslaw-pleskot.com/`).
- [ ] Zweryfikować property (HTML file upload lub DNS TXT).
- [ ] Potwierdzić status "Verified" w GSC.

### 6.2 Sitemap submission
- [ ] Dodać sitemap: `sitemap.xml`.
- [ ] Poczekać na status "Success" i sprawdzić liczbę odkrytych URL-i (~13).
- [ ] Jeśli błąd — sprawdzić publiczną dostępność sitemap po deployu.

### 6.3 URL inspection / request indexing
- [ ] Zaindeksować ręcznie (Request Indexing) priorytetowo: 4 landingi + 3 indexy językowe.
- [ ] Sprawdzić canonical i hreflang na landingach (Phase 2: canonical self, hreflang DE↔PL).
- [ ] Sprawdzić, czy wersje z trailing slash indeksują się poprawnie.

### 6.4 Token meta verification (opcjonalnie)
- [ ] Jeśli wybrano weryfikację przez meta tag — dodać tag do `_src/index.html` i przebudować (build.py), a następnie zweryfikować w GSC.
- [ ] Uwaga: meta tag weryfikacyjny to jedyny przypadek, w którym modyfikacja kodu aplikacji jest dopuszczalna w tej fazie — po weryfikacji tag można usunąć.

### 6.5 Po weryfikacji
- [ ] Zrobić baseline snapshot (sekcja 3.4) w dniu weryfikacji.
- [ ] Ustawić przypomnienia: T+4, T+8, T+12 tygodni.

---

## 7. Rekomendacje privacy-first (bez zewnętrznego trackingu)

1. **Brak Google Analytics / gtag / GA4 na stronie** — strona pozostaje bez zewnętrznych skryptów śledzących. Pomiar organiczny odbywa się wyłącznie w GSC (dane agregowane, bez identyfikacji użytkownika).
2. **UTM capture jest privacy-friendly:** parametry UTM są odczytywane lokalnie w JS i zapisywane do hidden fields formularza — nie ma żadnego zewnętrznego wywołania sieciowego przy ich zbieraniu (CONFIRMED w `assets/js/main.js`).
3. **Brak cookies** — strona nie ustawia cookies śledzących; polityka prywatności (Phase 3) została zaktualizowana pod kątem UTM.
4. **GSC nie wymaga zgody użytkownika** — dane są zagregowane i nie zawierają PII; zgodne z RODO przy braku logowania użytkowników.
5. **Nie dodawać** w przyszłości: Google Analytics, Facebook Pixel, Hotjar, czy innych trackerów bez wyraźnej decyzji właściciela i aktualizacji polityki prywatności.
6. **Jeśli kiedyś pojawi się płatna reklama** — Google Ads może wymagać zgody na cookies; decyzja poza zakresem tej fazy, wymaga osobnej analizy RODO.

---

## 8. NOT_CONFIRMED / NEEDS_GSC_ACCESS — jawne braki danych

| Element | Status | Powód |
|---|---|---|
| Publiczna dostępność subdomeny | NOT_CONFIRMED | Deploy nie wykonany (wszystkie zmiany lokalne, niepushowane) |
| Publiczna dostępność sitemap.xml | NOT_CONFIRMED | jw. |
| Weryfikacja property w GSC | NEEDS_GSC_ACCESS | Wymaga logowania do konta Google (zakazane w tej fazie) |
| Status submisji sitemap | NEEDS_GSC_ACCESS | jw. |
| Liczba zindeksowanych URL-i | NEEDS_GSC_ACCESS | jw. |
| Dane historyczne impressions/clicks/CTR/position | NEEDS_GSC_ACCESS | jw. |
| Liczba leadów z formularza | NEEDS_GSC_ACCESS | Dane poza repo (formularz nie wysyłał jeszcze zgłoszeń w tej fazie) |
| First lesson / retention | NEEDS_GSC_ACCESS | Dane poza stroną (rejestr właściciela) |
| Metoda weryfikacji (HTML file vs DNS) | NOT_CONFIRMED | Decyzja właściciela; zależy od dostępu do DNS |
| Hosting (GitHub Pages vs Cloudflare Pages) | NOT_CONFIRMED | Do potwierdzenia w panelu hostingu |

---

## RESULT_CAPSULE

- **status:** DONE_VERIFIED (artefakt utworzony i zweryfikowany lokalnie; zero side effects)
- **task_id:** t_8c1d66edc732ea9c
- **zmienione pliki:** `GSC_MEASUREMENT_PREP.md` (nowy, artefakt repozytoryjny)
- **commit:** lokalny, po sanity check (hash w git log; push NIE wykonany)
- **zero-side-effect attestation:** brak logowania do GSC/GA/GBP, brak tokenów, brak zmian DNS, brak push/deploy, brak wysyłki formularzy, brak zewnętrznych wywołań sieciowych, brak modyfikacji publicznego copy ani kodu aplikacji (jedyny nowy plik to statyczna checklista)
- **testy:** sanity check pliku (sekcje 1–8 + RESULT_CAPSULE obecne), git diff/status czysty względem nowego pliku; testy UTM z Phase 3 (5/5 PASS) nie były re-uruchamiane — poza zakresem tej fazy
- **HUMAN_REQUIRED:** sekcja 6 (własność/verification, sitemap submission, URL inspection/request indexing, ewentualny token meta verification) + baseline snapshot (sekcja 3.4)
- **werdykt:** PASS
