#!/usr/bin/env bash
# Usage: tools/og.sh OUTPUT.png KICKER TITLE vi|en|home
set -euo pipefail
if [[ $# != 4 ]]; then
  echo 'Usage: tools/og.sh OUTPUT.png KICKER TITLE vi|en|home' >&2
  exit 1
fi
root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
output=$(python3 -c 'import pathlib, sys; print(pathlib.Path(sys.argv[1]).resolve())' "$1")
url=$(python3 - "$root/tools/og.html" "$2" "$3" "$4" <<'PY'
import pathlib, sys, urllib.parse
print(pathlib.Path(sys.argv[1]).as_uri() + '?' + urllib.parse.urlencode(dict(zip(('k', 't', 'l'), sys.argv[2:]))))
PY
)
mkdir -p -- "$(dirname -- "$output")"
profile=$(mktemp -d)
trap 'rm -rf -- "$profile"' EXIT
"${CHROME_BIN:-google-chrome}" --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --user-data-dir="$profile" --no-first-run --no-default-browser-check \
  --force-device-scale-factor=2 --window-size=1200,630 \
  --virtual-time-budget=5000 --timeout=20000 --screenshot="$output" "$url"
python3 - "$output" <<'PY'
import pathlib, struct, sys
p = pathlib.Path(sys.argv[1])
assert struct.unpack('>II', p.read_bytes()[16:24]) == (2400, 1260), 'Expected 2400×1260 PNG'
assert p.stat().st_size < 1_000_000, 'PNG must be smaller than 1 MB'
print(f'{p.name}: 2400×1260, {p.stat().st_size} bytes')
PY
