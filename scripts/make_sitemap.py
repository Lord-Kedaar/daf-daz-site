#!/usr/bin/env python3
"""Generate sitemap.xml with real lastmod (build date). Run after build.py."""

import datetime
import os

BASE = "https://daf-daz.radoslaw-pleskot.com"

# Only indexable canonical URLs
URLS = [
    "/",
    "/pl/",
    "/en/",
    "/legal/imprint.html",
    "/legal/privacy.html",
    "/pl/legal/imprint.html",
    "/pl/legal/privacy.html",
    "/en/legal/imprint.html",
    "/en/legal/privacy.html",
    # Phase 2 — priority landings
    "/deutsch-privatunterricht-wien/",
    "/deutsch-fuer-polnischsprachige-wien/",
    "/pl/niemiecki-dla-polakow-wieden/",
    "/pl/przygotowanie-oeif-oesd-wieden/",
]

today = datetime.date.today().isoformat()

with open("sitemap.xml", "w", encoding="utf-8") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    for u in URLS:
        f.write("    <url>\n")
        f.write(f"        <loc>{BASE}{u}</loc>\n")
        f.write(f"        <lastmod>{today}</lastmod>\n")
        f.write("    </url>\n")
    f.write("</urlset>\n")

print(f"sitemap.xml written with lastmod {today} ({len(URLS)} URLs)")
