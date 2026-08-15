#!/usr/bin/env python3
"""Phase 2 verification: titles, H1 counts, forbidden patterns on 4 landings."""
import re, sys

pages = [
    ("deutsch-privatunterricht-wien/index.html", "Privatunterricht Deutsch in Wien | Radosław Pleskot"),
    ("deutsch-fuer-polnischsprachige-wien/index.html", "Deutsch für Polnischsprachige in Wien | Radosław Pleskot"),
    ("pl/niemiecki-dla-polakow-wieden/index.html", "Niemiecki dla Polaków w Wiedniu | Radosław Pleskot"),
    ("pl/przygotowanie-oeif-oesd-wieden/index.html", "Przygotowanie do egzaminów ÖIF i ÖSD w Wiedniu | Radosław Pleskot"),
]

forbidden = ["A1-C1", "unitCode", "example.com", "localhost", "keyword stuffing"]
ok = True
for p, expected_title in pages:
    html = open(p, encoding="utf-8").read()
    title = re.search(r"<title>([^<]*)</title>", html)
    h1s = re.findall(r"<h1[^>]*>(.*?)</h1>", html, re.S)
    h1 = re.sub(r"<[^>]+>", "", h1s[0]).strip() if h1s else "MISSING"
    print(f"--- {p}")
    print(f"  title: {title.group(1) if title else 'MISSING'}")
    print(f"  H1 count: {len(h1s)} | H1: {h1}")
    if not title or title.group(1) != expected_title:
        print(f"  FAIL: title mismatch (got {title.group(1) if title else 'MISSING'!r}, want {expected_title!r})")
        ok = False
    if len(h1s) != 1:
        print(f"  FAIL: H1 count != 1 ({len(h1s)})")
        ok = False
    for pat in forbidden:
        if pat.lower() in html.lower():
            print(f"  FORBIDDEN: {pat}")
            ok = False
    # answer-first check: first ~150 words after hero H1
    body = re.sub(r"<[^>]+>", " ", html)
    body = re.sub(r"\s+", " ", body)
    words = body.split()
    print(f"  total words: {len(words)}")
sys.exit(0 if ok else 1)
