#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== Converting EXR to HDR for .env generation ==="
echo ""
echo "IMPORTANT: After this script completes, you must manually convert the HDR files to .env:"
echo "  1. Open https://www.babylonjs.com/tools/textures/"
echo "  2. Drag dramatic-sky1.hdr into the tool"
echo "  3. Wait for processing, then save as dramatic-sky1.env"
echo "  4. Repeat for dramatic-sky1-mobile.hdr -> dramatic-sky1-mobile.env"
echo "  5. Place both .env files in front/public/environment/ and game/client/public/environment/"
echo ""

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
  hdr_dest="$dir/${base}.hdr"
  mobile_hdr_dest="$dir/${base}-mobile.hdr"

  if [ -f "$hdr_dest" ] && [ -f "$mobile_hdr_dest" ]; then
    echo "SKIP: HDR files already exist for $src"
    echo "  $hdr_dest ($(ls -lh "$hdr_dest" | awk '{print $5'}))"
    echo "  $mobile_hdr_dest ($(ls -lh "$mobile_hdr_dest" | awk '{print $5'}))"
    echo ""
    continue
  fi

  echo "Converting: $src -> $hdr_dest"
  oiiotool "$src" -o "$hdr_dest" 2>&1

  if [ -f "$hdr_dest" ]; then
    src_size=$(ls -lh "$src" | awk '{print $5}')
    hdr_size=$(ls -lh "$hdr_dest" | awk '{print $5}')
    echo "  EXR: $src_size -> HDR: $hdr_size"
  fi

  echo "Creating mobile HDR (1024px): $mobile_hdr_dest"
  oiiotool "$src" --resize 1024x512 -o "$mobile_hdr_dest" 2>&1

  if [ -f "$mobile_hdr_dest" ]; then
    mobile_hdr_size=$(ls -lh "$mobile_hdr_dest" | awk '{print $5}')
    echo "  Mobile HDR: $mobile_hdr_size"
  fi
  echo ""
done

echo "=== HDR files ready for .env conversion ==="
echo ""
echo "Next step: Use the Babylon.js IBL Texture Tool to convert HDR to .env"
echo "URL: https://www.babylonjs.com/tools/textures/"
