#!/bin/sh
set -eu

# 배포/개발 공통으로 재사용할 prebuilt helper를 universal binary로 생성
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
OUT_DIR="${DAYGRAPH_INPUT_HELPER_OUT_DIR:-$ROOT_DIR/bin/darwin}"
MACOS_MIN_VERSION="${MACOSX_DEPLOYMENT_TARGET:-11.0}"

mkdir -p "$OUT_DIR"

clang \
  -arch arm64 \
  -arch x86_64 \
  "$ROOT_DIR/native/macos/input-helper.c" \
  -O2 \
  -Wall \
  -mmacosx-version-min="$MACOS_MIN_VERSION" \
  -framework ApplicationServices \
  -framework CoreFoundation \
  -o "$OUT_DIR/daygraph-input-helper"

chmod 755 "$OUT_DIR/daygraph-input-helper"
