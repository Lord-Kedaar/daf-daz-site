#!/usr/bin/env python3
"""
DaF/DaZ site build generator — single source of truth -> per-language static pages.

Etap 1+2: language architecture (DE/PL/EN URLs) + canonical + hreflang + OG/Twitter.
Etap 3:   meta title/description per language (dekret 7.3), canonical email unification.
Etap 4:   per-language JSON-LD (Person + WebSite + Service with honest pricing).

Reads _src/index.html + _src/legal/*.html (pre-repair German source with data-lang
triplets) and emits standalone per-language pages that work without JavaScript.

Usage: python3 build.py
"""

import html.parser
import json
import os
import re
import sys

BASE = "https://daf-daz.radoslaw-pleskot.com"
SRC_INDEX = "_src/index.html"
SRC_LEGAL = "_src/legal"

LANGS = ("de", "pl", "en")

LANG_LABEL = {"de": "DE", "pl": "PL", "en": "EN"}
LANG_NAME = {"de": "Deutsch", "pl": "Polski", "en": "English"}
MOBILE_LABEL = {"de": "Menü öffnen", "en": "Open menu", "pl": "Otwórz menu"}

# Void elements never have end tags — must not affect nesting counters.
VOID_ELEMENTS = {"area", "base", "br", "col", "embed", "hr", "img", "input",
                 "link", "meta", "param", "source", "track", "wbr"}

# Canonical per-language URLs (index pages keep trailing slash; files don't)
PAGE_URLS = {
    "index": {"de": "/", "pl": "/pl/", "en": "/en/"},
    "imprint": {"de": "/legal/imprint.html", "pl": "/pl/legal/imprint.html", "en": "/en/legal/imprint.html"},
    "privacy": {"de": "/legal/privacy.html", "pl": "/pl/legal/privacy.html", "en": "/en/legal/privacy.html"},
}

# Dekret 7.3 — meta title/description per language
META = {
    "de": {
        "title": "Deutschunterricht in Wien | Radosław Pleskot",
        "description": "Individueller Deutschunterricht in Wien und online für Erwachsene, Jugendliche und Kinder. A1–B2+, ÖIF-/ÖSD-Vorbereitung und Deutsch für Alltag, Schule und Beruf.",
    },
    "pl": {
        "title": "Indywidualny niemiecki w Wiedniu | Radosław Pleskot",
        "description": "Indywidualne lekcje niemieckiego w Wiedniu i online dla dorosłych, młodzieży i dzieci. Poziomy A1–B2+, przygotowanie do ÖIF i ÖSD oraz niemiecki do życia, szkoły i pracy.",
    },
    "en": {
        "title": "Private German Lessons in Vienna | Radosław Pleskot",
        "description": "Private German lessons in Vienna and online for adults, teenagers and children. A1–B2+, ÖIF/ÖSD preparation, and practical German for daily life, school and work.",
    },
}

LEGAL_TITLES = {
    "imprint": {"de": "Impressum – Radosław Pleskot", "pl": "Impressum – Radosław Pleskot", "en": "Imprint – Radosław Pleskot"},
    "privacy": {"de": "Datenschutzerklärung – Radosław Pleskot", "pl": "Polityka prywatności – Radosław Pleskot", "en": "Privacy Policy – Radosław Pleskot"},
}

LEGAL_DESCRIPTIONS = {
    "imprint": {
        "de": "Impressum und Anbieterkennzeichnung für daf-daz.radoslaw-pleskot.com – Radosław Pleskot, privater Sprachunterricht (DaF/DaZ) in Wien und online.",
        "pl": "Impressum i dane wydawcy serwisu daf-daz.radoslaw-pleskot.com – Radosław Pleskot, prywatne lekcje języka niemieckiego (DaF/DaZ) w Wiedniu i online.",
        "en": "Imprint and provider identification for daf-daz.radoslaw-pleskot.com – Radosław Pleskot, private German lessons (DaF/DaZ) in Vienna and online.",
    },
    "privacy": {
        "de": "Datenschutzerklärung für daf-daz.radoslaw-pleskot.com – Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.",
        "pl": "Polityka prywatności serwisu daf-daz.radoslaw-pleskot.com – informacje o przetwarzaniu danych osobowych zgodnie z RODO.",
        "en": "Privacy policy for daf-daz.radoslaw-pleskot.com – information on the processing of personal data under the GDPR.",
    },
}

OG_LOCALE = {"de": "de_AT", "pl": "pl_PL", "en": "en_US"}
OG_ALT = {"de": ["pl_PL", "en_US"], "pl": ["de_AT", "en_US"], "en": ["de_AT", "pl_PL"]}

# Canonical contact (dekret 2.11 — homepage email wins)
CANONICAL_EMAIL = "kontakt@radoslaw-pleskot.com"
LEGACY_EMAILS = ("radoslaw.pleskot@gmail.com",)

# --- JSON-LD (Etap 4) ---------------------------------------------------------

def json_ld(lang, page):
    canonical = BASE + PAGE_URLS[page][lang]
    title = META[lang]["title"] if page == "index" else LEGAL_TITLES[page][lang]
    if page == "index":
        service_name = {
            "de": "Individueller Deutschunterricht (DaF/DaZ)",
            "pl": "Indywidualna nauka niemieckiego (DaF/DaZ)",
            "en": "Private German lessons (DaF/DaZ)",
        }[lang]
        price_desc = {
            "de": "Vor Ort in Wien: 30 EUR / 45 Min (40 EUR / 60 Min). Online: 21 EUR / 45 Min (28 EUR / 60 Min).",
            "pl": "Stacjonarnie w Wiedniu: 30 EUR / 45 min (40 EUR / 60 min). Online: 21 EUR / 45 min (28 EUR / 60 min).",
            "en": "In person in Vienna: EUR 30 / 45 min (EUR 40 / 60 min). Online: EUR 21 / 45 min (EUR 28 / 60 min).",
        }[lang]
        graph = [
            {
                "@type": "Person",
                "@id": f"{BASE}/#person",
                "name": "Radosław Pleskot",
                "jobTitle": "Sprachtrainer DaF/DaZ",
                "url": BASE + "/",
                "image": f"{BASE}/assets/img/modern_friendly.webp",
                "address": {"@type": "PostalAddress", "addressLocality": "Wien", "addressCountry": "AT"},
                "sameAs": ["https://www.linkedin.com/in/radoslaw-pleskot/"],
            },
            {
                "@type": "WebSite",
                "@id": f"{BASE}/#website",
                "url": BASE + "/",
                "name": title,
                "inLanguage": lang,
                "publisher": {"@id": f"{BASE}/#person"},
            },
            {
                "@type": "Service",
                "@id": f"{BASE}/#service",
                "name": service_name,
                "url": canonical,
                "provider": {"@id": f"{BASE}/#person"},
                "areaServed": {"@type": "City", "name": "Wien"},
                "availableLanguage": ["de", "pl", "en"],
                "description": price_desc,
                "offers": {
                    "@type": "Offer",
                    "description": price_desc,
                    "priceSpecification": {
                        "@type": "UnitPriceSpecification",
                        "price": "30.00",
                        "priceCurrency": "EUR",
                        "referenceQuantity": {"@type": "QuantitativeValue", "value": 45, "unitCode": "MIN"},
                    },
                },
            },
        ]
    else:
        graph = [
            {
                "@type": "WebPage",
                "@id": canonical,
                "url": canonical,
                "name": title,
                "inLanguage": lang,
                "isPartOf": {"@id": f"{BASE}/#website"},
            },
            {
                "@type": "WebSite",
                "@id": f"{BASE}/#website",
                "url": BASE + "/",
                "name": META["de"]["title"],
                "inLanguage": lang,
                "publisher": {"@id": f"{BASE}/#person"},
            },
            {
                "@type": "Person",
                "@id": f"{BASE}/#person",
                "name": "Radosław Pleskot",
                "jobTitle": "Sprachtrainer DaF/DaZ",
                "url": BASE + "/",
                "address": {"@type": "PostalAddress", "addressLocality": "Wien", "addressCountry": "AT"},
            },
        ]
    import json
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=4)


# --- Head generation ----------------------------------------------------------

def make_head(lang, page):
    canonical = BASE + PAGE_URLS[page][lang]
    group = {l: BASE + PAGE_URLS[page][l] for l in LANGS}
    if page == "index":
        title = META[lang]["title"]
        desc = META[lang]["description"]
    else:
        title = LEGAL_TITLES[page][lang]
        desc = LEGAL_DESCRIPTIONS[page][lang]

    hreflang = "".join(f'    <link rel="alternate" hreflang="{l}" href="{group[l]}" />\n' for l in LANGS)
    hreflang += f'    <link rel="alternate" hreflang="x-default" href="{group["de"]}" />\n'
    alt_locales = "".join(f'    <meta property="og:locale:alternate" content="{loc}" />\n' for loc in OG_ALT[lang])

    return f"""<!doctype html>
<html lang="{lang}" class="scroll-smooth">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="{desc}" />
    <meta name="author" content="Radoslaw Pleskot" />

    <!-- Canonical -->
    <link rel="canonical" href="{canonical}" />

    <!-- Hreflang -->
{hreflang}
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{canonical}" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{desc}" />
    <meta property="og:locale" content="{OG_LOCALE[lang]}" />
{alt_locales}    <meta property="og:image" content="{BASE}/assets/img/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Radosław Pleskot — Deutschunterricht in Wien" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="{canonical}" />
    <meta name="twitter:title" content="{title}" />
    <meta name="twitter:description" content="{desc}" />
    <meta name="twitter:image" content="{BASE}/assets/img/og-image.jpg" />

    <title>{title}</title>

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg" />
    <link rel="alternate icon" href="/assets/img/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/assets/img/favicon.svg" />

    <!-- Preload Critical Resources for LCP -->
    <link rel="preload" href="/assets/img/hero.webp" as="image" type="image/webp" fetchpriority="high" />
    <link rel="preload" href="/assets/img/hero2.webp" as="image" type="image/webp" media="(prefers-color-scheme: dark)" />
    <link rel="preload" href="/assets/css/styles.css" as="style" />
    <link rel="preload" href="/assets/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />

    <link rel="stylesheet" href="/assets/css/styles.css" />

    <!-- Structured Data -->
    <script type="application/ld+json">
{json_ld(lang, page)}
    </script>
</head>
"""


# --- Body filtering -----------------------------------------------------------

def render_tag(tag, attrs, selfclosing):
    s = f"<{tag}"
    for k, v in attrs.items():
        if v is None:
            s += f" {k}"
        else:
            s += f' {k}="{v}"'
    return s + (" />" if selfclosing else ">")


class BodyFilter(html.parser.HTMLParser):
    def __init__(self, lang, page):
        super().__init__(convert_charrefs=False)
        self.lang = lang
        self.page = page
        self.out = []
        self.in_head = False
        self.skipping = 0
        self.in_switcher = False

    # -- helpers ------------------------------------------------------------

    def rewrite_href(self, v):
        if not v:
            return v
        if v == "#":
            return PAGE_URLS["index"][self.lang]
        if v == "../index.html":
            return PAGE_URLS["index"][self.lang]
        if v.startswith("../index.html#"):
            return PAGE_URLS["index"][self.lang] + v[len("../index.html"):]
        if v in ("legal/imprint.html", "legal/privacy.html", "imprint.html", "privacy.html"):
            doc = "imprint" if "imprint" in v else "privacy"
            return PAGE_URLS[doc][self.lang]
        if v.startswith("assets/") or v.startswith("../assets/"):
            return "/" + v.replace("../", "", 1) if v.startswith("../") else "/" + v
        if v.startswith(("#", "/", "http", "mailto:", "tel:")):
            # Canonical email unification (dekret 2.11)
            if v.startswith("mailto:") and any(m in v for m in LEGACY_EMAILS):
                return "mailto:" + CANONICAL_EMAIL
            return v
        return v

    def rewrite_src(self, v):
        if not v:
            return v
        if v.startswith("assets/"):
            return "/" + v
        if v.startswith("../assets/"):
            return "/" + v[3:]
        return v

    def make_switcher_links(self):
        links = []
        for l in LANGS:
            url = PAGE_URLS[self.page][l]
            active = " active" if l == self.lang else ""
            cur = ' aria-current="true"' if l == self.lang else ""
            links.append(
                f'<a class="lang-btn{active}" href="{url}" aria-label="{LANG_NAME[l]}"{cur}>{LANG_LABEL[l]}</a>'
            )
        return "".join(links)

    # -- parser callbacks -----------------------------------------------------

    def handle_starttag(self, tag, attrs):
        if self.in_head:
            return
        if self.skipping:
            if tag not in VOID_ELEMENTS:
                self.skipping += 1
            return
        if tag in ("html", "body"):
            return
        if tag == "head":
            self.in_head = True
            return
        if self.in_switcher:
            return

        a = {k: v for k, v in attrs}
        cls = a.get("class", "").split()

        if tag == "div" and "lang-switcher" in cls:
            self.in_switcher = True
            self.out.append('<div class="lang-switcher">')
            self.out.append(self.make_switcher_links())
            return

        lang = a.get("data-lang")
        if lang is not None:
            if lang == self.lang:
                a.pop("data-lang", None)
                self._emit(tag, a, selfclosing=False)
            else:
                self.skipping = 1
            return

        self._emit(tag, a, selfclosing=False)

    def handle_startendtag(self, tag, attrs):
        if self.in_head or self.skipping or self.in_switcher:
            return
        if tag in ("html", "body", "head"):
            return
        a = {k: v for k, v in attrs}
        lang = a.get("data-lang")
        if lang is not None:
            if lang == self.lang:
                a.pop("data-lang", None)
                self._emit(tag, a, selfclosing=True)
            return
        self._emit(tag, a, selfclosing=True)

    def handle_endtag(self, tag):
        if self.in_head:
            if tag == "head":
                self.in_head = False
            return
        if self.skipping:
            if tag not in VOID_ELEMENTS:
                self.skipping -= 1
            return
        if self.in_switcher:
            if tag == "div":
                self.in_switcher = False
                self.out.append("</div>")
            return
        if tag in ("html", "body", "head"):
            return
        self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if not self.in_head and not self.skipping and not self.in_switcher:
            # Canonical email unification (dekret 2.11) — visible text too
            for m in LEGACY_EMAILS:
                data = data.replace(m, CANONICAL_EMAIL)
            # Dekret 2.10 — privacy/legal body must name the daf-daz service,
            # not the bare apex domain. Never touch mailto addresses or URLs.
            data = re.sub(r"(?<![\w@.])radoslaw-pleskot\.com(?![\w-])",
                          "daf-daz.radoslaw-pleskot.com", data)
            self.out.append(data)

    def handle_comment(self, data):
        if not self.in_head and not self.skipping and not self.in_switcher:
            self.out.append(f"<!--{data}-->")

    def handle_entityref(self, name):
        if not self.in_head and not self.skipping and not self.in_switcher:
            self.out.append(f"&{name};")

    def handle_charref(self, name):
        if not self.in_head and not self.skipping and not self.in_switcher:
            self.out.append(f"&#{name};")

    def _emit(self, tag, a, selfclosing):
        if "href" in a:
            a["href"] = self.rewrite_href(a["href"])
        if "src" in a:
            a["src"] = self.rewrite_src(a["src"])
        if tag == "button" and "mobile-toggle" in (a.get("class") or "").split():
            a["aria-label"] = MOBILE_LABEL[self.lang]
        self.out.append(render_tag(tag, a, selfclosing))


# --- Assembly ----------------------------------------------------------------

def generate_page(lang, page):
    src_path = SRC_INDEX if page == "index" else os.path.join(SRC_LEGAL, f"{page}.html")
    src = open(src_path, encoding="utf-8").read()
    f = BodyFilter(lang, page)
    f.feed(src)
    body = "".join(f.out)
    # Remove empty <li> leftovers (list items that held only other-language elements)
    body = re.sub(r"<li>\s*</li>", "", body)
    head = make_head(lang, page)
    return head + "\n<body>\n" + body + "\n</body>\n</html>\n"


def main():
    print(f"build.py — base: {BASE}")
    if not os.path.exists(SRC_INDEX):
        print("ERROR: missing _src/index.html — run from repo root", file=sys.stderr)
        sys.exit(1)

    for lang in LANGS:
        for page in ("index", "imprint", "privacy"):
            html = generate_page(lang, page)
            if lang == "de":
                if page == "index":
                    path = "index.html"
                else:
                    path = f"legal/{page}.html"
            else:
                if page == "index":
                    path = f"{lang}/index.html"
                else:
                    path = f"{lang}/legal/{page}.html"
            os.makedirs(os.path.dirname(path), exist_ok=True) if os.path.dirname(path) else None
            with open(path, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"  wrote {path} ({len(html)} bytes)")
    print("done.")


if __name__ == "__main__":
    main()
