#!/bin/bash
# Phase 6E/6F — durable evidence runner for DaF/DaZ SEO closure (fail-closed).
# Records: command, environment versions, raw stdout+stderr, exit code, duration.
# Fail-closed: ANY failing step (build/hash/preview/suite) -> overall exit != 0.
# Usage: bash scripts/run_phase6e_evidence.sh
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=evidence/phase6e
mkdir -p "$OUT"
FAIL=0
STEPS=()

run() {
  local name="$1"; shift
  local log="$OUT/$name.log"
  local start end dur rc
  start=$(date +%s)
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
  rc=$?
  end=$(date +%s)
  dur=$((end - start))
  echo "=== EXIT CODE: $rc ===" >> "$log"
  echo "=== DURATION: ${dur}s ===" >> "$log"
  STEPS+=("$name|$rc|${dur}s")
  if [ "$rc" -ne 0 ]; then FAIL=1; fi
  echo "$name: exit=$rc (${dur}s)"
  return "$rc"
}

# 1. Build idempotency — hash1 captured IMMEDIATELY after build 1,
#    then build 2, then hash2, then diff. Any difference -> FAIL.
run build1 python3 build.py
find . -path ./_src -prune -o -name '*.html' -print | grep -v '^\./\.git' | sort | xargs shasum > "$OUT/hash1.txt"
run build2 python3 build.py
find . -path ./_src -prune -o -name '*.html' -print | grep -v '^\./\.git' | sort | xargs shasum > "$OUT/hash2.txt"
if diff "$OUT/hash1.txt" "$OUT/hash2.txt" > "$OUT/hash_diff.txt" 2>&1; then
  echo "IDEMPOTENCY: PASS (hash1 == hash2, diff empty)" >> "$OUT/hash_diff.txt"
  IDEM_RC=0
else
  echo "IDEMPOTENCY: FAIL (hash1 != hash2)" >> "$OUT/hash_diff.txt"
  IDEM_RC=1
fi
STEPS+=("idempotency|$IDEM_RC|n/a")
if [ "$IDEM_RC" -ne 0 ]; then FAIL=1; fi
echo "idempotency: exit=$IDEM_RC (hash1 vs hash2)"

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

# 4. Preview — durable raw evidence: command, per-URL HTTP code, exit code.
#    Server: reuse an already-running instance on 8899; otherwise start our
#    own and kill it in cleanup (never kill a server we did not start).
PREVIEW_LOG="$OUT/preview.log"
{
  echo "=== COMMAND ==="
  echo "python3 -m http.server 8899 --bind 127.0.0.1 (background if not already running)"
  echo "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8899<url>  (per key URL)"
  echo "=== ENV ==="
  echo "cwd: $(pwd)"
  echo "date: $(date '+%Y-%m-%d %H:%M:%S %z')"
  echo "=== STDOUT+STDERR ==="
} > "$PREVIEW_LOG"

SERVER_PID=""
if curl -s -o /dev/null --max-time 2 http://127.0.0.1:8899/; then
  echo "server: already running on 8899 (external, not managed by this runner)" >> "$PREVIEW_LOG"
else
  python3 -m http.server 8899 --bind 127.0.0.1 >> "$PREVIEW_LOG" 2>&1 &
  SERVER_PID=$!
  sleep 1
  echo "server: started pid=$SERVER_PID" >> "$PREVIEW_LOG"
fi

PREVIEW_RC=0
for url in / /pl/ /en/ /legal/privacy.html /deutsch-privatunterricht-wien/ /deutsch-fuer-polnischsprachige-wien/ /pl/niemiecki-dla-polakow-wieden/ /pl/przygotowanie-oeif-oesd-wieden/; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://127.0.0.1:8899$url")
  echo "GET $url -> HTTP $code" >> "$PREVIEW_LOG"
  if [ "$code" != "200" ]; then PREVIEW_RC=1; fi
done
echo "=== EXIT CODE: $PREVIEW_RC ===" >> "$PREVIEW_LOG"
STEPS+=("preview|$PREVIEW_RC|n/a")
if [ "$PREVIEW_RC" -ne 0 ]; then FAIL=1; fi
echo "preview: exit=$PREVIEW_RC (8 key URLs)"

# Cleanup: only our own server process
if [ -n "$SERVER_PID" ]; then
  kill "$SERVER_PID" 2>/dev/null
  wait "$SERVER_PID" 2>/dev/null
  echo "server: stopped pid=$SERVER_PID" >> "$PREVIEW_LOG"
fi

# 5. Fail-closed summary: every step, exit code, duration; overall != 0 on any fail
echo ""
echo "=== SUMMARY (fail-closed) ==="
for s in "${STEPS[@]}"; do
  IFS='|' read -r name rc dur <<< "$s"
  printf '%-22s exit=%-3s %s\n' "$name" "$rc" "$dur"
done
if [ "$FAIL" -eq 0 ]; then
  echo "=== OVERALL: PASS ==="
else
  echo "=== OVERALL: FAIL (at least one step failed) ==="
fi
echo "=== logs in $OUT ==="
exit "$FAIL"
