#!/bin/bash
# Integration test for nteract-elements shadcn registry
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TEMP_DIR=$(mktemp -d)
PORT=19876

echo "=== nteract-elements Registry Integration Test ==="
echo "Project root: $PROJECT_ROOT"
echo "Temp dir: $TEMP_DIR"

cleanup() {
    echo ""
    echo "Cleaning up..."
    kill $SERVER_PID 2>/dev/null || true
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Build registry
echo ""
echo "[1/7] Building registry..."
cd "$PROJECT_ROOT"
pnpm run registry:build

# Start simple static server
echo ""
echo "[2/7] Starting registry server on port $PORT..."
npx -y serve public -l $PORT &
SERVER_PID=$!

# Wait for server to be ready (retry up to 30 seconds)
echo "Waiting for server to start..."
for i in {1..30}; do
    if curl -s "http://localhost:$PORT/r/all.json" > /dev/null 2>&1; then
        echo "Server is up after ${i}s!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Server failed to start after 30s"
        exit 1
    fi
    sleep 1
done

# Create Next.js app
echo ""
echo "[3/7] Creating Next.js project..."
cd "$TEMP_DIR"
pnpm create next-app@latest test-app --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
cd test-app

# Init shadcn
echo ""
echo "[4/7] Initializing shadcn..."
pnpm dlx shadcn@latest init -y -d

# Configure registry
echo ""
echo "[5/7] Configuring local registry..."
node -e "
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('components.json', 'utf-8'));
config.registries = { '@nteract': { url: 'http://localhost:$PORT/r/{name}.json' } };
fs.writeFileSync('components.json', JSON.stringify(config, null, 2));
"
echo "Done"

# Install components
echo ""
echo "[6/7] Installing @nteract/all..."
pnpm dlx shadcn@latest add @nteract/all -yo

# Build
echo ""
echo "[7/7] Building Next.js app..."
pnpm build

echo ""
echo "=== ALL TESTS PASSED ==="
