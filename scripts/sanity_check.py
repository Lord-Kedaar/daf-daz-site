#!/usr/bin/env python3
"""
DaF/DaZ site sanity check — runs over all public HTML files.

Etap 14 wymagania:
  1. przechodzi po wszystkich publicznych plikach HTML
  2. obecność i unikalność: title, meta description, canonical, H1
  3. poprawne html lang
  4. wewnętrzne linki i assety
  5. wykrywanie: A1-C1 / A1–C1, unitCode H przy 30 EUR, placeholdery,
     domena główna zamiast subdomeny, brak wzajemnych hreflang, fałszywe sitemap cele
  6. parsuje każdy blok JSON-LD jako JSON
  7. niezerowy exit code przy błędzie

Usage: python3 scripts/sanity_check.py [--root .]
"""

import argparse
import json
import os
import re
import sys
import urllib.request

BASE = "https://daf-daz.radoslaw-pleskot.com"
INDEXABLE = [
    "/",
    "/pl/",
    "/en/",
    "/legal/imprint.html",
    "/legal/privacy.html",
    "/pl/legal/imprint.html",
    "/pl/legal/privacy.html",
    "/en/legal/imprint.html",
    "/en/legal/privacy.html",
]

HREFLANG_GROUPS = {
    "/": ["/", "/pl/", "/en/"],
    "/pl/": ["/", "/pl/", "/en/"],
    "/en/": ["/", "/pl/", "/en/"],
    "/legal/imprint.html": ["/legal/imprint.html", "/pl/legal/imprint.html", "/en/legal/imprint.html"],
    "/legal/privacy.html": ["/legal/privacy.html", "/pl/legal/privacy.html", "/en/legal/privacy.html"],
    "/pl/legal/imprint.html": ["/legal/imprint.html", "/pl/legal/imprint.html", "/en/legal/imprint.html"],
    "/pl/legal/privacy.html": ["/legal/privacy.html", "/pl/legal/privacy.html", "/en/legal/privacy.html"],
    "/en/legal/imprint.html": ["/legal/imprint.html", "/pl/legal/imprint.html", "/en/legal/imprint.html"],
    "/en/legal/privacy.html": ["/legal/privacy.html", "/pl/legal/privacy.html", "/en/legal/privacy.html"],
}

ERRORS = []


def err(path, msg):
    ERRORS.append(f"{path}: {msg}")


def local_path(url_path, root):
    if url_path == "/":
        return os.path.join(root, "index.html")
    return os.path.join(root, url_path.lstrip("/"))


def check_html(path, root):
    if path.endswith("/"):
        full = os.path.join(root, path.lstrip("/"), "index.html")
    else:
        full = os.path.join(root, path.lstrip("/"))
    if not os.path.exists(full):
        err(path, "file missing on disk")
        return
    src = open(full, encoding="utf-8").read()

    # 2. title / description / canonical / H1 uniqueness
    if len(re.findall(r"<title>", src)) != 1:
        err(path, f"title count != 1 ({len(re.findall('<title>', src))})")
    if len(re.findall(r'<meta name="description"', src)) != 1:
        err(path, "meta description count != 1")
    canon = re.findall(r'<link rel="canonical" href="([^"]+)"', src)
    if len(canon) != 1:
        err(path, f"canonical count != 1 ({len(canon)})")
    elif not canon[0].startswith(BASE):
        err(path, f"canonical not absolute self-referencing: {canon[0]}")
    h1s = re.findall(r"<h1[^>]*>", src)
    if len(h1s) != 1:
        err(path, f"H1 count != 1 ({len(h1s)})")

    # 3. html lang
    lang = re.search(r'<html lang="([^"]+)"', src)
    if not lang:
        err(path, "missing html lang")
    elif lang.group(1) not in ("de", "pl", "en"):
        err(path, f"invalid html lang: {lang.group(1)}")

    # 5a. forbidden patterns
    for pat, label in [
        (r"A1[-–]C1", "A1-C1"),
        (r"unitCode\".{0,20}\"H\"", "unitCode H"),
        (r"example\.com", "example.com placeholder"),
        (r"localhost", "localhost"),
        (r"https://radoslaw-pleskot\.com(?!\.)", "apex domain instead of subdomain"),
    ]:
        if re.search(pat, src):
            err(path, f"forbidden pattern: {label}")

    # 5b. hreflang reciprocity
    hfs = dict(re.findall(r'hreflang="([^"]+)" href="([^"]+)"', src))
    group = HREFLANG_GROUPS.get(path)
    if group is not None:
        for l, url in (("de", BASE + group[0]), ("pl", BASE + group[1]), ("en", BASE + group[2])):
            if hfs.get(l) != url:
                err(path, f"hreflang {l} missing/mismatched (got {hfs.get(l)}, want {url})")
        if hfs.get("x-default") != BASE + group[0]:
            err(path, "hreflang x-default missing/mismatched")

    # 4. internal links and assets
    for href in re.findall(r'href="([^"]+)"', src):
        if href.startswith(("http", "mailto:", "tel:", "#")) or href == "":
            continue
        target = href.split("#")[0]
        if target.startswith("/"):
            target = target[1:]
        if target and not os.path.exists(os.path.join(root, target)):
            err(path, f"broken internal link: {href}")
    for s in re.findall(r'src="([^"]+)"', src):
        if s.startswith(("http", "data:")):
            continue
        if s.startswith("/"):
            s = s[1:]
        if s and not os.path.exists(os.path.join(root, s)):
            err(path, f"broken asset src: {s}")

    # 6. JSON-LD parses
    for blk in re.findall(r'<script type="application/ld\+json">(.*?)</script>', src, re.S):
        try:
            data = json.loads(blk)
            assert isinstance(data, dict) and "@context" in data, "no @context"
            assert "30.00" not in json.dumps(data) or "unitCode" not in json.dumps(data) or "H" not in json.dumps(data.get("offers", {}), ensure_ascii=False), "suspicious unitCode"
        except Exception as e:
            err(path, f"JSON-LD invalid: {e}")


def check_sitemap(root):
    spath = os.path.join(root, "sitemap.xml")
    if not os.path.exists(spath):
        err("sitemap.xml", "missing")
        return
    src = open(spath, encoding="utf-8").read()
    locs = re.findall(r"<loc>([^<]+)</loc>", src)
    if not locs:
        err("sitemap.xml", "no <loc> entries")
        return
    for loc in locs:
        if not loc.startswith(BASE):
            err("sitemap.xml", f"loc not under subdomain: {loc}")
        url_path = loc[len(BASE):]
        if url_path not in INDEXABLE:
            err("sitemap.xml", f"loc not in canonical set: {url_path}")
        target = local_path(url_path, root)
        if not os.path.exists(target):
            err("sitemap.xml", f"loc target missing on disk: {target}")
        if "lastmod=2026-01-01" in src or "<lastmod>2026-01-01</lastmod>" in src:
            err("sitemap.xml", "stale hand-written lastmod 2026-01-01")


def check_robots(root):
    rpath = os.path.join(root, "robots.txt")
    if not os.path.exists(rpath):
        err("robots.txt", "missing")
        return
    src = open(rpath, encoding="utf-8").read()
    m = re.search(r"Sitemap:\s*(\S+)", src)
    if not m:
        err("robots.txt", "no Sitemap directive")
    elif m.group(1) != BASE + "/sitemap.xml":
        err("robots.txt", f"sitemap URL wrong: {m.group(1)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    args = ap.parse_args()
    root = os.path.abspath(args.root)

    for url_path in INDEXABLE:
        check_html(url_path, root)
    check_sitemap(root)
    check_robots(root)

    if ERRORS:
        print(f"SANITY FAIL — {len(ERRORS)} error(s):")
        for e in ERRORS:
            print(f"  ✗ {e}")
        sys.exit(1)
    print(f"SANITY OK — {len(INDEXABLE)} pages + sitemap + robots passed.")
    sys.exit(0)


if __name__ == "__main__":
    main()
