#!/bin/bash

# Test script for verifying all pages with TextField migrations load without errors
# This script checks if the Next.js dev server can start and pages are accessible

echo "🧪 Starting TextField Migration Test..."
echo ""

# Check if we're in the front directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must be run from the /front directory"
  exit 1
fi

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Pages to test (paths that were migrated)
PAGES=(
  "/login"
  "/signup"
  "/updateme"
  "/play"
  "/ui-test"
)

echo "📋 Pages to test:"
for page in "${PAGES[@]}"; do
  echo "   - $page"
done
echo ""

# Start the dev server in the background
echo "🚀 Starting Next.js dev server..."
npm run dev > /tmp/nextjs-test.log 2>&1 &
DEV_PID=$!

# Wait for server to start (check for "Ready" message or port 3000)
echo "⏳ Waiting for server to be ready..."
COUNTER=0
MAX_WAIT=60

while [ $COUNTER -lt $MAX_WAIT ]; do
  if grep -q "Ready" /tmp/nextjs-test.log 2>/dev/null || curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Server is ready!"
    echo ""
    break
  fi
  sleep 1
  COUNTER=$((COUNTER + 1))
  if [ $((COUNTER % 5)) -eq 0 ]; then
    echo "   Still waiting... (${COUNTER}s)"
  fi
done

if [ $COUNTER -eq $MAX_WAIT ]; then
  echo "❌ Server failed to start within ${MAX_WAIT} seconds"
  echo ""
  echo "📄 Server log:"
  cat /tmp/nextjs-test.log
  kill $DEV_PID 2>/dev/null
  exit 1
fi

# Check for compilation errors in the log
echo "🔍 Checking for compilation errors..."
if grep -i "error" /tmp/nextjs-test.log | grep -v "404" > /dev/null; then
  echo -e "${RED}❌ Compilation errors found:${NC}"
  grep -i "error" /tmp/nextjs-test.log | grep -v "404"
  echo ""
  kill $DEV_PID 2>/dev/null
  exit 1
else
  echo -e "${GREEN}✅ No compilation errors${NC}"
fi
echo ""

# Test each page
echo "🌐 Testing page accessibility..."
FAILED_PAGES=()

for page in "${PAGES[@]}"; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$page")
  
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "   ${GREEN}✅${NC} $page (HTTP $HTTP_CODE)"
  else
    echo -e "   ${RED}❌${NC} $page (HTTP $HTTP_CODE)"
    FAILED_PAGES+=("$page")
  fi
done

echo ""

# Cleanup
echo "🧹 Stopping dev server..."
kill $DEV_PID 2>/dev/null
sleep 2

# Final results
echo ""
echo "================================================"
if [ ${#FAILED_PAGES[@]} -eq 0 ]; then
  echo -e "${GREEN}✅ All pages passed!${NC}"
  echo "================================================"
  exit 0
else
  echo -e "${RED}❌ ${#FAILED_PAGES[@]} page(s) failed:${NC}"
  for page in "${FAILED_PAGES[@]}"; do
    echo "   - $page"
  done
  echo "================================================"
  echo ""
  echo "📄 Check the full log at /tmp/nextjs-test.log for details"
  exit 1
fi
