#!/bin/bash
# Phase 6E — durable evidence runner for DaF/DaZ SEO closure.
# Records: command, environment versions, raw stdout+stderr, exit code.
# Usage: bash scripts/run_phase6e_evidence.sh
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=evidence/phase6e
mkdir -p "$OUT"

run() {
  local name="$1"; shift
  local log="$OUT/$name.log"
  {
    echo "=== COMMAND ==="
    printf '%q ' "$@"; echo
    echo "=== ENV ==="
    echo "node: $(node --version 2>&1)"
    echo "python3: $(python3 --version 2>&1)"
    echo "chrome: $(curl -s http://127.0.0.1:9222/json/version 2>/dev/null | grep -o '"Browser": "[^"]*"' | head -1)"
    echo "cwd: $(pwd)"
    echo "date: $(date '+%Y-%m-%d %H:%M:%S %z')"
    echo "=== STDOUT+STDERR ==="
  } > "$log"
  "$@" >> "$log" 2>&1
  local rc=$?
  echo "=== EXIT CODE: $rc ===" >> "$log"
  echo "$name: exit=$rc"
  return $rc
}

# 1. Build idempotency: two builds + hash manifests
run build1 python3 build.py
run build2 python3 build.py
find . -path ./_src -prune -o -name '*.html' -print | grep -v '^\./\.git' | sort | xargs shasum > "$OUT/hash1.txt"
find . -path ./_src -prune -o -name '*.html' -print | grep -v '^\./\.git' | sort | xargs shasum > "$OUT/hash2.txt"
diff "$OUT/hash1.txt" "$OUT/hash2.txt" > "$OUT/hash_diff.txt" 2>&1
echo "hash_diff exit=$? (0 = identical)" | tee -a "$OUT/hash_diff.txt"

# 2. Static suites (no browser needed)
run sanity python3 scripts/sanity_check.py
run meta python3 scripts/check_phase2_meta.py
run links python3 scripts/check_links_phase2.py
run html_sanity python3 scripts/phase6a_html_sanity.py
run utm_logic node scripts/test_utm_logic.mjs

# 3. Browser E2E suites (CDP 9222 + static server 8899)
run phase3 node scripts/phase3_verify.mjs
run phase6a node scripts/phase6a_qa.mjs
run phase6c_utm_e2e node scripts/phase6c_utm_e2e.mjs

echo "=== ALL DONE — logs in $OUT ==="
