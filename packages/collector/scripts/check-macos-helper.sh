#!/bin/sh
set -eu

# source와 prebuilt helper가 어긋나면 커밋 전에 바로 실패시킴
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
EXPECTED="$ROOT_DIR/bin/darwin/daygraph-input-helper"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

if [ ! -f "$EXPECTED" ]; then
  echo "missing prebuilt helper: $EXPECTED" >&2
  exit 1
fi

DAYGRAPH_INPUT_HELPER_OUT_DIR="$TMP_DIR" sh "$SCRIPT_DIR/build-macos-helper.sh"

if ! cmp -s "$EXPECTED" "$TMP_DIR/daygraph-input-helper"; then
  echo "prebuilt helper is stale. Run 'pnpm -C packages/collector build:helper:darwin' and commit the updated binary." >&2
  exit 1
fi

echo "prebuilt helper is up to date"
