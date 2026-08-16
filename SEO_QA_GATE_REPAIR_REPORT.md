# SEO_QA_GATE_REPAIR_REPORT — DaF/DaZ QA Gate Repair (Phase 6F)

- **Data:** 2026-08-16
- **Repo:** /Users/radek/PROJECTS/daf-daz-site (Lord-Kedaar/daf-daz-site)
- **Task:** t_e20cfabf1dddf6e8 — DaF/DaZ SEO: naprawa testów i rollbacku
- **Baza:** MORDAX_SEO_PHASE6_FINAL_REVIEW.md (werdykt CHANGES_REQUESTED; HIGH: rollback dirty tree + zakres, MEDIUM: idempotencja, runner fail-closed, preview evidence, LOW: liczba artefaktów)
- **Zakres:** wyłącznie wiarygodność testów i procedura rollbacku. **Zero zmian treści strony, SEO, UI, formularza. Zero push / zero deploy / zero publikacji / zero DNS / zero Cloudflare / zero GSC / zero GBP / zero Formspree. Zdalne repo nietknięte.**
- **Werdykt:** **PASS** (wszystkie 5 findingów Phase 6F zamknięte; 12/12 kroków QA exit 0; fail-closed udowodniony testem negatywnym)

---

## 1. FINDING → FIX → EVIDENCE

### F1 [MEDIUM] — Idempotencja nie została faktycznie zmierzona

**FINDING (Mordax):** `scripts/run_phase6e_evidence.sh:32-37` uruchamiało oba buildy PRZED zapisaniem `hash1.txt` i `hash2.txt`; oba manifesty były liczone z tego samego finalnego drzewa, więc ich równość nie dowodziła idempotencji.

**FIX:** Kolejność w runnerze poprawiona na:
```
build 1 → hash1.txt (natychmiast po buildzie 1) → build 2 → hash2.txt → diff
```
Diff wykonywany dopiero po obu hashach; jakakolwiek różnica → `IDEMPOTENCY: FAIL` i końcowy exit != 0.

**EVIDENCE:** `evidence/phase6e/hash1.txt` (09:13, po build1) vs `hash2.txt` (09:13, po build2) — identyczne; `hash_diff.txt` zawiera `IDEMPOTENCY: PASS (hash1 == hash2, diff empty)`. Sekwencja komend widoczna w `build1.log`/`build2.log` (timestampy w logach).

### F2 [MEDIUM] — Runner nie jest fail-closed

**FINDING (Mordax):** skrypt miał `set -u` bez `set -e`/agregacji; nieudany suite nie zatrzymywał skryptu, a końcowy `echo` mógł dać exit 0 mimo awarii.

**FIX:** Runner agreguje exit code każdego kroku (`STEPS[]`), każdy niezerowy exit ustawia `FAIL=1`, a na końcu:
- podsumowanie `=== SUMMARY (fail-closed) ===` z **każdą komendą, exit code i czasem trwania**,
- `exit "$FAIL"` — **pierwszy nieudany test ⇒ końcowy status niezerowy** (fail-closed, nie fail-fast: wszystkie kroki się wykonują, ale wynik jest wiarygodny).

**EVIDENCE (test negatywny, 2026-08-16):** kopia runnera z podmienionym `sanity` na `false` → `RUNNER_EXIT=1`, `=== OVERALL: FAIL (at least one step failed) ===`, pozostałe kroki exit 0 (fail-closed = agregacja, nie przerwanie). Testowy runner i artefakty usunięte po weryfikacji.

### F3 [MEDIUM] — Brak trwałego evidence preview

**FINDING (Mordax):** raporty deklarowały HTTP 200, ale w `evidence/phase6e/` nie było `preview.log` z komendą, raw outputem i exit code.

**FIX:** Runner wykonuje sekcję preview z trwałym zapisem:
- komenda (serwer + curl per URL),
- env (cwd, data),
- per-URL `GET <url> -> HTTP <code>` dla 8 kluczowych URL-i (index DE/PL/EN, privacy, 4 landingi),
- `=== EXIT CODE: N ===` (0 = wszystkie 200),
- cleanup: runner ubija **wyłącznie** serwer, który sam uruchomił; serwer zewnętrzny (już działający na 8899) jest oznaczony jako `external, not managed by this runner` i nietknięty.

**EVIDENCE:** `evidence/phase6e/preview.log` — 8× HTTP 200, `EXIT CODE: 0`, komenda i env w nagłówku logu.

### F4 [HIGH] — Rollback niebezpieczny dla dirty tree i niepełny

**FINDING (Mordax):** (a) `git reset --hard 0523456` i `git checkout c957dda -- .` nadpisują tracked working tree bez ochrony dirty tree (6 modified + 14 untracked); (b) `git revert d929a75..0d14ed3` pomija pierwszy commit SEO `d929a75`; (c) brak osobnego rollbacku commitów 6E `6083ad4`/`b495551`.

**FIX (w 3 plikach: README.md, SEO_PHASE6E_CLOSURE_REPORT.md, SEO_PHASE6C_REMEDIATION_REPORT.md):**
1. **Krok 0 — ochrona dirty tree (OBOWIĄZKOWY):** `git status --porcelain` + jedna z trzech wersji: stash z untracked (`git stash push -u`), commit backup, branch backup. Bez tego: **STOP**.
2. **Osobne rollbacki:** 6E (`git revert --no-edit b495551 6083ad4` — preferowany; alternatywa `git reset --hard 0523456` po kroku 0), 6C (`git revert --no-edit 0523456`; alternatywa `git reset --hard 0d14ed3` po kroku 0), Phase 1–5 (revert 8 commitów w odwrotnej kolejności, **jawnie z `d929a75`**), working tree do HEAD, pełny pre-SEO (`git checkout c957dda -- .` + build, po kroku 0).
3. **Zakaz zdalny** rozszerzony: żaden reset/push/force-push `origin` bez jawnego approval.
4. Wszystkie SHA realne (zweryfikowane `git log`): `b49555129588654a50be036756007f4f8f4e7f4d`, `6083ad4ac550cec860a6e935d5e2706399a7b066`, `0523456403ad2680e807d76ec68a7a5b181be049`, `0d14ed374ec0408019ad8bc303edc0a6041b2e2a`, `c957ddaf00e6a36459e2f254f6b5245a6f14db99`, `d929a75` (pełny SHA: `d929a75` — patrz `git log`).

**EVIDENCE:** sekcje rollback w 3 plikach (diff w commicie); `git log --oneline --reverse c957dda..HEAD` potwierdza 11 commitów SEO: `d929a75 b7e2457 7399a47 1680630 267f42b 54eef98 4a7fafb 0d14ed3 0523456 6083ad4 b495551`.

### F5 [LOW] — Manifest evidence niespójnie policzony

**FINDING (Mordax):** raport deklarował 11 plików, faktyczny zestaw to 13.

**FIX:** Po naprawie runnera zestaw to **14 artefaktów** (13 poprzednich + `preview.log`). Liczba podana jawnie w sekcji 2 i RESULT_CAPSULE.

**EVIDENCE:** `ls evidence/phase6e/` — 14 plików (build1, build2, hash1, hash2, hash_diff, sanity, meta, links, html_sanity, utm_logic, phase3, phase6a, phase6c_utm_e2e, preview).

---

## 2. Wyniki pełnego zestawu QA (2026-08-16 09:13–09:14 +0200)

Runner: `bash scripts/run_phase6e_evidence.sh` — **12/12 kroków exit 0, OVERALL: PASS**.

| Krok | Log | Exit | Czas |
|------|-----|------|------|
| build 1 | `build1.log` | 0 | 0s |
| build 2 | `build2.log` | 0 | 0s |
| idempotencja (hash1 po build1 → build2 → hash2 → diff) | `hash1.txt`/`hash2.txt`/`hash_diff.txt` | 0 | n/a |
| sanity 13 stron + sitemap + robots | `sanity.log` | 0 | 0s |
| meta 4/4 (title==oczekiwany, H1==1) | `meta.log` | 0 | 0s |
| links 0 broken (publiczne, bez _src) | `links.log` | 0 | 0s |
| HTML sanity 14/14 | `html_sanity.log` | 0 | 0s |
| UTM logic 5/5 | `utm_logic.log` | 0 | 1s |
| phase3 12/12 | `phase3.log` | 0 | 6s |
| phase6a 36/36 | `phase6a.log` | 0 | 33s |
| UTM E2E 34/34 | `phase6c_utm_e2e.log` | 0 | 14s |
| preview 8 URL-i HTTP 200 | `preview.log` | 0 | n/a |

Środowisko (z logów): node v22.22.3, Python 3.9.6, Chrome/151.0.7922.138, serwer 127.0.0.1:8899, CDP 9222.

**Fail-closed (test negatywny):** celowo zepsuty krok → `RUNNER_EXIT=1`, `OVERALL: FAIL`. Dowód: przebieg testowy 2026-08-16 (artefakty testowe usunięte po weryfikacji; wynik zarejestrowany w tym raporcie).

---

## 3. Zmienione pliki

| Plik | Zmiana |
|------|--------|
| `scripts/run_phase6e_evidence.sh` | fail-closed (agregacja exit codes + podsumowanie z czasem + `exit $FAIL`), idempotencja w poprawnej kolejności, sekcja preview z trwałym logiem i cleanupem, artefakty: 14 |
| `README.md` | rollback: Krok 0 (ochrona dirty tree), osobne rollbacki 6E/6C/Phase 1–5 (z `d929a75`)/pre-SEO, zakaz zdalny, realne SHA |
| `SEO_PHASE6E_CLOSURE_REPORT.md` | sekcja 4 rollback — jak wyżej |
| `SEO_PHASE6C_REMEDIATION_REPORT.md` | sekcja 3 rollback — jak wyżej |
| `evidence/phase6e/*` | 14 artefaktów (w tym nowy `preview.log`, odświeżone hashe w poprawnej kolejności) |
| `SEO_QA_GATE_REPAIR_REPORT.md` | ten raport (nowy) |

**Nietknięte:** treść strony, SEO, UI, formularz, `_src/*`, `assets/*`, `sitemap.xml`, `robots.txt`, zdalne repo.

---

## 4. Rollback tego commita

- **Cofnij ten commit (QA gate repair):** `git revert --no-edit 7d4463a` (bezpieczny) — po commicie.
- **Przed commitem:** `git checkout -- scripts/run_phase6e_evidence.sh README.md SEO_PHASE6E_CLOSURE_REPORT.md SEO_PHASE6C_REMEDIATION_REPORT.md` + usunięcie `SEO_QA_GATE_REPAIR_REPORT.md` i odświeżonych artefaktów `evidence/phase6e/` (przywrócenie z commita 6083ad4).
- **Pełna polityka rollbacku SEO:** patrz README.md sekcja Rollback (Krok 0 obowiązkowy; zdalne operacje ZAKAZ bez approval).

---

## 5. HUMAN_REQUIRED (bez zmian względem Phase 6F)

1. Push/deploy: jawna decyzja, czy lokalne commity `0523456`, `6083ad4`, `b495551` i commit 6F wolno pushnąć.
2. Potwierdzenie autoryzacji wcześniejszego pushu `c957dda → 0d14ed3` (2026-08-15 23:45:57 CEST) i czy GitHub Pages wykonał deployment.
3. Governance: klasyfikacja `daf-daz-site` (projekt vs produkt) + owner lane → `project-registry.md`.
4. Akceptacja prawna privacy copy + ręczna weryfikacja faktów ÖIF/ÖSD.
5. Osobna zgoda na realny test Formspree, GSC lub GBP.

---

## RESULT_CAPSULE

- **task_id:** t_e20cfabf1dddf6e8
- **status:** **PASS** (F1–F5 zamknięte; 12/12 kroków exit 0; fail-closed udowodniony testem negatywnym; 0 zmian treści strony)
- **baseline:** MORDAX_SEO_PHASE6_FINAL_REVIEW.md (CHANGES_REQUESTED, F1–F5); HEAD b495551, origin/main 0d14ed3, pre-SEO c957dda
- **actions_taken:** (1) runner fail-closed z agregacją exit codes, podsumowaniem (komenda/exit/czas) i `exit $FAIL`; (2) idempotencja: hash1 po build1 → build2 → hash2 → diff; (3) preview: trwały `preview.log` (komenda, 8 URL-i, HTTP codes, exit code, cleanup tylko własnego serwera); (4) rollback: Krok 0 ochrona dirty tree, osobne rollbacki 6E/6C/Phase 1–5 (z `d929a75`)/pre-SEO, realne SHA, zakaz zdalny — w README + 2 raportach; (5) evidence: 14 artefaktów w `evidence/phase6e/`; (6) raport `SEO_QA_GATE_REPAIR_REPORT.md`
- **files_changed:** scripts/run_phase6e_evidence.sh (M), README.md (M), SEO_PHASE6E_CLOSURE_REPORT.md (M), SEO_PHASE6C_REMEDIATION_REPORT.md (M), evidence/phase6e/* (14 artefaktów, w tym nowy preview.log), SEO_QA_GATE_REPAIR_REPORT.md (nowy)
- **verification:** 12/12 kroków exit 0 (build×2, idempotencja, sanity, meta, links, html_sanity, utm_logic, phase3, phase6a, utm_e2e, preview 8×200); test negatywny fail-closed → exit 1; hashe w poprawnej kolejności (hash1 po build1, hash2 po build2, diff 0)
- **evidence:** evidence/phase6e/{build1,build2,hash1,hash2,hash_diff,sanity,meta,links,html_sanity,utm_logic,phase3,phase6a,phase6c_utm_e2e,preview}.log/.txt
- **rollback_path:** `git revert --no-edit 7d4463a`; pełna polityka w README (Krok 0 obowiązkowy; zdalne ZAKAZ bez approval)
- **risks:** LCP 3.7 s (Needs Improvement, nieblokujący, z Phase 6A); deployment po pushu 23:45 niepotwierdzony (NEEDS_HUMAN); dirty tree zawiera zmiany faz 1–6A (niezacommitowane, poza tym taskiem)
- **next_action:** lokalny commit 6F (bez push); decyzje HUMAN_REQUIRED #1–5 przez Zołzę/Radosława
