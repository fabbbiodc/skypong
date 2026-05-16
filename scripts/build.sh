#!/bin/bash
set -e

BASE_PATH="${BASE_PATH:-/skypong}"

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
