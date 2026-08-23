#!/bin/sh
set -eu

# source와 prebuilt display helper가 어긋나면 커밋 전에 실패시킴
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
EXPECTED="$ROOT_DIR/bin/darwin/daygraph-display-helper"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

if [ ! -f "$EXPECTED" ]; then
  echo "missing prebuilt display helper: $EXPECTED" >&2
  exit 1
fi

DAYGRAPH_DISPLAY_HELPER_OUT_DIR="$TMP_DIR" sh "$SCRIPT_DIR/build-macos-display-helper.sh"

if ! cmp -s "$EXPECTED" "$TMP_DIR/daygraph-display-helper"; then
  echo "prebuilt display helper is stale. Run 'pnpm -C packages/collector build:helper:darwin-display' and commit the updated binary." >&2
  exit 1
fi

echo "prebuilt display helper is up to date"
