#!/bin/bash
set -e

BASE_PATH="${BASE_PATH:-/skypong}"

echo "=== Converting EXR to HDR (if needed) ==="
bash "$(dirname "$0")/convert-exr-to-hdr.sh"

echo ""
echo "=== Checking for .env files ==="

ENV_FILES=(
  "front/public/environment/dramatic-sky1.env"
  "front/public/environment/dramatic-sky1-mobile.env"
  "game/client/public/environment/dramatic-sky1.env"
  "game/client/public/environment/dramatic-sky1-mobile.env"
)

MISSING_ENV=false
for env_file in "${ENV_FILES[@]}"; do
  if [ ! -f "$env_file" ]; then
    echo "MISSING: $env_file"
    MISSING_ENV=true
  else
    echo "OK: $env_file ($(ls -lh "$env_file" | awk '{print $5}'))"
  fi
done

if [ "$MISSING_ENV" = true ]; then
  echo ""
  echo "ERROR: .env files are missing!"
  echo "Please convert the HDR files to .env using the Babylon.js IBL Texture Tool:"
  echo "  1. Open https://www.babylonjs.com/tools/textures/"
  echo "  2. Drag each .hdr file into the tool"
  echo "  3. Save as .env in the same directory"
  echo ""
  exit 1
fi

echo ""
echo "=== Building game client ==="
cd game/client
VITE_BASE_PATH="${BASE_PATH}/game/" npx vite build
cd ../..

echo "=== Copying game client to frontend public ==="
rm -rf front/public/game
cp -r game/client/dist front/public/game

echo "=== Building Next.js frontend ==="
cd front
NEXT_PUBLIC_BASE_PATH="$BASE_PATH" npx next build
cd ..

echo "=== Setting up SPA routing for GitHub Pages ==="
cp front/out/index.html front/out/404.html
cp front/out/game/index.html front/out/game/404.html

echo "=== Build complete! Output in front/out/ ==="
