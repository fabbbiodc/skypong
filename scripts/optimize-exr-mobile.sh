#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

MOBILE_WIDTH=${MOBILE_WIDTH:-1024}
COMPRESSION=${COMPRESSION:-zip}

echo "=== Creating mobile-optimized EXR files ==="
echo "Target width: ${MOBILE_WIDTH}px"
echo "Compression: ${COMPRESSION}"

EXR_FILES=(
  "$ROOT_DIR/front/public/environment/dramatic-sky1.exr"
  "$ROOT_DIR/game/client/public/environment/dramatic-sky1.exr"
)

for src in "${EXR_FILES[@]}"; do
  if [ ! -f "$src" ]; then
    echo "WARNING: Source EXR not found: $src"
    continue
  fi

  dir=$(dirname "$src")
  base=$(basename "$src" .exr)
  dest="$dir/${base}-mobile.exr"

  if [ -f "$dest" ]; then
    echo "SKIP: Mobile EXR already exists: $dest"
    continue
  fi

  echo "Creating: $dest"
  exrenvmap -l -w "$MOBILE_WIDTH" -z "$COMPRESSION" "$src" "$dest" 2>&1

  if [ -f "$dest" ]; then
    src_size=$(ls -lh "$src" | awk '{print $5}')
    dest_size=$(ls -lh "$dest" | awk '{print $5}')
    echo "  Original: $src_size -> Mobile: $dest_size"
  fi
done

echo "=== Mobile EXR creation complete ==="
