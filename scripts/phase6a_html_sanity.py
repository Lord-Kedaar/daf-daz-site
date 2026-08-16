#!/usr/bin/env python3
"""Phase 6A: HTML tag-balance sanity + JSON-LD deep validation over all public HTML files."""
import glob
import json
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr"}
RAW_TEXT = {"script", "style", "textarea", "title"}

ERRORS = []


class BalanceParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        self.stack.append((tag, self.getpos()))

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack:
            self.errors.append(f"unexpected </{tag}> at {self.getpos()}")
            return
        # pop until match (tolerate implicit closes like <li>)
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                # anything above i is implicitly closed
                for t, pos in self.stack[i + 1:]:
                    self.errors.append(f"implicit close <{t}> opened at {pos} closed by </{tag}> at {self.getpos()}")
                del self.stack[i:]
                return
        self.errors.append(f"unmatched </{tag}> at {self.getpos()}")


def check_html(path):
    src = open(path, encoding="utf-8").read()
    p = BalanceParser()
    p.feed(src)
    for t, pos in p.stack:
        p.errors.append(f"unclosed <{t}> opened at {pos}")
    if p.errors:
        ERRORS.append(f"{path}: {p.errors[:5]}")
    # doctype
    if not src.lstrip().lower().startswith("<!doctype html"):
        ERRORS.append(f"{path}: missing doctype")
    # viewport
    if 'name="viewport"' not in src:
        ERRORS.append(f"{path}: missing viewport meta")
    # charset
    if 'charset="UTF-8"' not in src and 'charset="utf-8"' not in src:
        ERRORS.append(f"{path}: missing charset")
    # lang attr
    if not re.search(r'<html lang="[a-z-]+"', src):
        ERRORS.append(f"{path}: missing html lang")
    # JSON-LD deep validation
    for i, blk in enumerate(re.findall(r'<script type="application/ld\+json">(.*?)</script>', src, re.S)):
        try:
            data = json.loads(blk)
        except Exception as e:
            ERRORS.append(f"{path}: JSON-LD block {i} parse error: {e}")
            continue
        if not isinstance(data, dict) or "@context" not in data:
            ERRORS.append(f"{path}: JSON-LD block {i} missing @context")
            continue
        graph = data.get("@graph", [data])
        ids = set()
        for node in graph:
            if not isinstance(node, dict) or "@type" not in node:
                ERRORS.append(f"{path}: JSON-LD node missing @type")
                continue
            if "@id" in node:
                ids.add(node["@id"])
            if node["@type"] not in ("Person", "WebSite", "Service", "WebPage"):
                ERRORS.append(f"{path}: JSON-LD unknown @type {node['@type']}")
        # @id references resolve
        text = json.dumps(data, ensure_ascii=False)
        for ref in re.findall(r'"@id"\s*:\s*"([^"]+)"', text):
            if ref.startswith("http") and ref not in ids and "#" not in ref:
                ERRORS.append(f"{path}: JSON-LD dangling @id ref {ref}")


def main():
    files = sorted(glob.glob("**/*.html", recursive=True))
    files = [f for f in files if not f.startswith("_src")]
    for f in files:
        check_html(f)
    if ERRORS:
        print(f"HTML/JSON-LD FAIL — {len(ERRORS)} error(s):")
        for e in ERRORS:
            print(f"  ✗ {e}")
        sys.exit(1)
    print(f"HTML/JSON-LD OK — {len(files)} public HTML files balanced, doctype/viewport/charset/lang present, JSON-LD valid.")


if __name__ == "__main__":
    main()
