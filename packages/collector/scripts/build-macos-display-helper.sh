#!/bin/sh
set -eu

# CoreGraphics로 활성 디스플레이의 실제 좌표계 bounds를 출력하는 helper를 universal binary로 생성
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
OUT_DIR="${DAYGRAPH_DISPLAY_HELPER_OUT_DIR:-$ROOT_DIR/bin/darwin}"
MACOS_MIN_VERSION="${MACOSX_DEPLOYMENT_TARGET:-11.0}"

mkdir -p "$OUT_DIR"

clang \
  -arch arm64 \
  -arch x86_64 \
  "$ROOT_DIR/native/macos/display-helper.c" \
  -O2 \
  -Wall \
  -mmacosx-version-min="$MACOS_MIN_VERSION" \
  -framework CoreGraphics \
  -o "$OUT_DIR/daygraph-display-helper"

chmod 755 "$OUT_DIR/daygraph-display-helper"
