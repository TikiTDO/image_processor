#!/usr/bin/env bash
set -euo pipefail

echo "Building frontend static assets..."
# Navigate to frontend directory
cd "$(dirname "$0")/../frontend"
# Install dependencies and build
npm install
npm run build

echo "Frontend static assets built in 'frontend/dist'."
echo "Copying static assets into backend/static..."
rm -rf "$(dirname "$0")/../backend/static"
mkdir -p "$(dirname "$0")/../backend/static"
cp -r dist/* "$(dirname "$0")/../backend/static/"
echo "Static assets copied to backend/static."