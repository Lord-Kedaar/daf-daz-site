# GOOGLE_BUSINESS_PROFILE_COPY.md

> Dokument przygotowawczy — PHASE 4 (LOCAL SEO PREPARATION), aktualizacja 2026-08-16.
> Status: **MATERIAŁ DO RĘCZNEGO WPROWADZENIA** — nic nie zostało opublikowane, żaden profil nie został utworzony ani zweryfikowany.
> Wszystkie fakty o ofercie pochodzą wyłącznie z treści strony https://daf-daz.radoslaw-pleskot.com (stan: 2026-08-16, commit 5371cfe).
> Wszystkie nazwy kategorii/serwisów GBP są **rekomendacjami do weryfikacji w aktualnym UI** — oznaczono je `VERIFY_CURRENT_UI`.
> **Weryfikację profilu wykonuje właściciel osobiście** (wymaga logowania do Google) — poza zakresem jakiejkolwiek automatyzacji.

---

## 1. Dane NAP (spójne — używać identycznie we wszystkich miejscach)

| Pole | Wartość | Źródło |
|---|---|---|
| Nazwa firmy (Name) | `Radosław Pleskot` (wariant ASCII: `Radoslaw Pleskot`) | imprint.html / JSON-LD Person: "Radosław Pleskot" |
| Telefon | `+43 681 101 502 83` | imprint.html (tel:+436****0283) |
| E-mail | `kontakt@radoslaw-pleskot.com` | imprint.html / sekcja Kontakt |
| Strona WWW | `https://daf-daz.radoslaw-pleskot.com` | CNAME / sitemap.xml |
| Miasto / Service area | `Wien` | sekcja Kontakt: "Wien, Österreich" |
| Adres (Address) | **NIE PODAWAĆ** — patrz §4 | brak adresu na stronie (świadomie) |

> **Real-world name policy (rekomendacja domyślna):** Google wymaga, aby nazwa profilu była dokładną, publicznie używaną nazwą działalności — bez dopisków marketingowych, słów kluczowych ani lokalizacji w nazwie. Domyślną rekomendacją jest **`Radosław Pleskot`** — dokładnie ta nazwa, pod którą właściciel występuje publicznie (imprint, JSON-LD Person, meta author). Opis usług (Deutschunterricht, DaF/DaZ) i lokalizację (Wien) umieszcza się w **odpowiednich polach** (opis profilu, kategorie, service area), a NIE w nazwie.
>
> **Nie dodawać do nazwy:** słów kluczowych ("Deutschunterricht", "German lessons"), "Wien" jako członu marketingowego, myślników z opisem działalności, emoji ani wariantów typu "Best German Tutor". Nazwa z dopiskiem opisowym (np. `Radoslaw Pleskot – Deutschunterricht Wien`) jest dopuszczalna **wyłącznie**, jeśli jest to rzeczywista, zarejestrowana nazwa działalności — w innym wypadku Google może odrzucić profil przy weryfikacji.
>
> Uwaga: nazwa w GBP może wymagać wariantu ASCII (limit znaków / walidacja UI). Warianty do wyboru przy zakładaniu (jeden, spójny):
> - `Radosław Pleskot` (preferowany — dokładna nazwa publiczna)
> - `Radoslaw Pleskot` (wariant ASCII, jeśli UI odrzuca diakrytyki)
> Wybór należy potwierdzić w UI (`VERIFY_CURRENT_UI`) i używać **tej samej** wersji w GBP, katalogach i na stronie.

---

## 2. Opis — wersja DE (główna)

> Limit znaków GBP: ~750 znaków (`VERIFY_CURRENT_UI`). Poniższy tekst mieści się w limicie; przed wklejeniem sprawdzić aktualny licznik w UI.

```
Individueller Deutschunterricht in Wien — für Kinder, Jugendliche und Erwachsene (A1–B2+).

Ich unterrichte Einzelunterricht, abgestimmt auf Ihr Tempo und Ihre Ziele: Alltag, Beruf, Schule oder Prüfungsvorbereitung (ÖIF, ÖSD). Klar erklärt, ohne Druck — für Anfänger und Fortgeschrittene.

Unterricht vor Ort in Wien oder online. Kostenloses Erstgespräch zur Einstufung und Zielvereinbarung.

Kontakt: +43 681 101 502 83 · kontakt@radoslaw-pleskot.com · https://daf-daz.radoslaw-pleskot.com
```

Fakty potwierdzone na stronie (nie fabrykowane):
- Einzelunterricht, vor Ort in Wien oder online — sekcja "Organisation" / landings.
- Zielgruppen: Kinder, Jugendliche, Erwachsene; A1–B2+ — meta description strony głównej.
- Prüfungsvorbereitung ÖIF und ÖSD — sekcja "Prüfungen".
- Kostenloses Erstgespräch — CTA hero.
- Preise: vor Ort 30 €/45 Min (40 €/60 Min); online 21 €/45 Min (28 €/60 Min) — sekcja "Preise".

---

## 3. Opis — wersja PL (krótka)

```
Indywidualna nauka niemieckiego w Wiedniu — dla dzieci, młodzieży i dorosłych (A1–B2+).

Lekcje indywidualne dopasowane do Twojego tempa i celów: codzienny język, praca, szkoła lub przygotowanie do egzaminów ÖIF i ÖSD. Stacjonarnie w Wiedniu lub online. Bezpłatna pierwsza konsultacja.

Kontakt: +43 681 101 502 83 · kontakt@radoslaw-pleskot.com · https://daf-daz.radoslaw-pleskot.com
```

> Uwaga: GBP pozwala na jeden opis główny. Wersja PL może być użyta jako opis wtórny tylko jeśli UI na to pozwala (`VERIFY_CURRENT_UI`); w przeciwnym razie wersja PL służy jako materiał do postów/aktualizacji, nie do pola opisu.

---

## 4. Adres i service area

- **Service area: `Wien`** (cały obszar miasta; ewentualnie dzielnice, jeśli UI wymaga listy — `VERIFY_CURRENT_UI`).
- **Adres: NIE WYŚWIETLAĆ.** Rekomendacja: profil bez adresu (service-area business), ponieważ:
  1. strona celowo nie publikuje adresu domowego (w sekcji Kontakt jest tylko "Wien, Österreich");
  2. zajęcia odbywają się u ucznia / online / w miejscach publicznych — brak stałej lokalizacji przyjmującej klientów;
  3. pokazanie adresu domowego w GBP wiąże się z ryzykiem prywatności i wymogiem zgodności z Google (wizyty, godziny).
- **Nie używać do weryfikacji:** skrzynek pocztowych (PO box), wirtualnych biur ani adresów, pod którymi działalność faktycznie nie przyjmuje klientów — Google odrzuca takie adresy przy weryfikacji i może zablokować profil. Jeśli Google wymaga adresu do weryfikacji (`VERIFY_CURRENT_UI`), jedyną poprawną opcją jest adres, pod którym realnie odbywa się działalność (np. lokal, w którym prowadzone są zajęcia) — decyzja właściciela. HUMAN_REQUIRED: decyzja właściciela.

---

## 5. Sugerowane kategorie i atrybuty (do weryfikacji w aktualnym GBP UI)

> Google zmienia taksonomię kategorii. Poniższe to **kandydatury do sprawdzenia** — wybrać maksymalnie 1 kategorię główną + do 9 dodatkowych (`VERIFY_CURRENT_UI`). Nie wpisywać kategorii, których nie ma na liście UI.

Kandydaci (kolejność priorytetu):
1. `Language school` / `Sprachschule` — jeśli dostępna (`VERIFY_CURRENT_UI`)
2. `Tutor` / `Nachhilfe` / `Private tutor` — jeśli dostępna (`VERIFY_CURRENT_UI`)
3. `German language instructor` / `Deutschlehrer` — jeśli dostępna (`VERIFY_CURRENT_UI`)
4. `Exam preparation` / `Prüfungsvorbereitung` — jeśli dostępna (`VERIFY_CURRENT_UI`)

Atrybuty/usługi do oznaczenia w UI (jeśli istnieją jako checkboxy — `VERIFY_CURRENT_UI`):
- Online lessons / Online-Unterricht
- In-person lessons / Vor-Ort-Unterricht
- Service area: Wien

> Zasada: nazwy kategorii w tym dokumencie NIE są gwarantowane. Przed zapisaniem sprawdzić dokładną nazwę w rozwijanej liście GBP. Jeśli żadna z powyższych nie istnieje, wybrać najbliższą dostępną i zanotować wybór w tym pliku.

---

## 6. Sugerowany URL strony z UTM

**URL do wpisania w polu "Website" w GBP:**

```
https://daf-daz.radoslaw-pleskot.com/?utm_source=google_business&utm_medium=profile&utm_campaign=gbp_wien
```

### Objaśnienie parametrów

| Parametr | Wartość | Znaczenie |
|---|---|---|
| `utm_source` | `google_business` | Skąd przyszedł ruch (profil Google Business) |
| `utm_medium` | `profile` | Rodzaj nośnika (profil firmowy) |
| `utm_campaign` | `gbp_wien` | Kampania (profil GBP dla Wiednia) |

Dlaczego tak:
- Strona ma już mechanizm przechwytywania UTM w formularzu kontaktowym (hidden fields `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` — dodane w Phase 3, commit 267f42b). Parametry z URL trafią do zgłoszeń z formularza, co pozwoli mierzyć leady z GBP bez dodatkowej pracy.
- Wartości są krótkie, czytelne i spójne z konwencją UTM.
- `utm_content` celowo pominięty w URL (opcjonalny; można dodać np. `&utm_content=website_link` jeśli UI na to pozwala — `VERIFY_CURRENT_UI`).

> Uwaga: jeśli GBP wymaga wpisania URL bez parametrów lub je obcina (`VERIFY_CURRENT_UI`), wpisać czysty `https://daf-daz.radoslaw-pleskot.com` i zanotować decyzję. Parametry UTM nie wpływają na działanie strony (strona statyczna, parametry ignorowane przez serwer).

---

## 7. Godziny otwarcia

- Strona nie deklaruje godzin przyjmowania klientów (zajęcia umawiane indywidualnie).
- Rekomendacja: w GBP ustawić "by appointment" / "Termin nach Vereinbarung", jeśli UI na to pozwala (`VERIFY_CURRENT_UI`).
- HUMAN_REQUIRED: właściciel decyduje, czy podać stałe godziny (np. pon–pt 9:00–19:00) — nie wpisywać godzin bez tej decyzji.

---

## 8. Co NIE zostało zrobione (zero side-effects)

- Nie utworzono ani nie zweryfikowano profilu GBP — **weryfikację wykonuje właściciel osobiście** (wymaga logowania do Google).
- Nie logowano się do Google / GSC / GBP.
- Nie opublikowano nic w katalogach.
- Nie wysłano żadnych próśb o opinię.
- Nie zmieniono publicznej strony (dokument zaktualizowany lokalnie; zmiany wejdą z najbliższym commitem SEO).

## HUMAN_REQUIRED (podsumowanie)

1. Decyzja: czy profil GBP ma być bez adresu (rekomendacja) — potwierdzenie właściciela.
2. Wybór kategorii w aktualnym UI GBP (lista może się różnić od kandydatur w §5).
3. Decyzja o godzinach otwarcia ("by appointment" vs stałe godziny).
4. **Ręczne założenie i weryfikacja profilu przez właściciela** (wymaga logowania do Google — poza zakresem automatyzacji).
5. Potwierdzenie finalnej nazwy NAP (wariant z §1) i jej użycie we wszystkich miejscach.

## Podział: automatyzowalne vs wymagające właściciela

| Działanie | Kto | Status |
|---|---|---|
| Przygotowanie copy, NAP, URL z UTM, kategorie-kandydatki | Metricus (ten dokument) | GOTOWE |
| Założenie profilu GBP | Właściciel (logowanie do Google) | HUMAN_REQUIRED |
| Weryfikacja profilu (kod/wideorozmowa/pocztówka) | Właściciel osobiście | HUMAN_REQUIRED |
| Wybór kategorii w UI | Właściciel | HUMAN_REQUIRED |
| Decyzja o adresie / service area | Właściciel | HUMAN_REQUIRED |
| Decyzja o godzinach | Właściciel | HUMAN_REQUIRED |
| Zdjęcia profilu | Właściciel (materiał z urządzenia właściciela) | HUMAN_REQUIRED |
| Odpowiadanie na opinie | Właściciel | HUMAN_REQUIRED |
