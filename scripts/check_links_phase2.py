#!/usr/bin/env python3
"""Link check for daf-daz-site: root-relative + page-relative href/src resolution."""
import os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

pages = sorted(glob.glob('**/index.html', recursive=True)) + ['index.html', '404.html']
pages = [p for p in pages if 'legal' not in p and not p.startswith('_src')]

broken = []
checked = 0
for p in pages:
    html = open(p, encoding='utf-8').read()
    for href in re.findall(r'(?:href|src)="([^"]+)"', html):
        if href.startswith(('http', 'mailto', 'tel', 'data:', '#')):
            continue
        target = href.split('?')[0].split('#')[0]
        if not target:
            continue
        if target.startswith('/'):
            # root-relative: resolve against repo root
            cand = target.lstrip('/')
            if cand.endswith('/'):
                cand += 'index.html'
            full = os.path.join(ROOT, cand)
        else:
            # page-relative: resolve against page dir
            cand = os.path.normpath(os.path.join(os.path.dirname(p), target))
            if os.path.isdir(full if False else os.path.join(ROOT, cand)):
                cand = os.path.join(cand, 'index.html')
            full = os.path.join(ROOT, cand)
        checked += 1
        if not os.path.exists(full):
            broken.append((p, href, full))

print(f"pages checked: {len(pages)}")
print(f"links checked: {checked}")
print(f"broken: {len(broken)}")
for b in broken:
    print("  BROKEN:", b)
sys.exit(1 if broken else 0)
