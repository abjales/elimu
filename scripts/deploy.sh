#!/bin/bash
# ELIMU Platform - Deployment Script
# Run on the production VPS to pull, build, migrate, and reload in place.
# This is a single monorepo: elimu-platform/ + openmaic/ live under APP_DIR.

set -e

APP_DIR="/home/abjales/projects/elimu"
LOG_DIR="/var/log/elimu"

echo "=== ELIMU Deployment ==="
echo ""

# Create log directory
sudo mkdir -p "$LOG_DIR"
sudo chown "$USER":"$USER" "$LOG_DIR"

# Navigate to repo root (single monorepo)
cd "$APP_DIR"

# Pull latest changes (one repo, one pull)
echo "1. Pulling latest changes..."
git pull origin main

# Install dependencies
echo "2. Installing dependencies..."
cd elimu-platform
pnpm install --frozen-lockfile
cd ../openmaic
pnpm install --frozen-lockfile
cd ..

# Build ELIMU Platform
echo "3. Building ELIMU Platform..."
cd elimu-platform
pnpm build
cd ..

# Build OpenMAIC
echo "4. Building OpenMAIC..."
cd openmaic
pnpm build
cd ..

# Run database migrations (drizzle-kit migrate reads .env.local via drizzle.config.ts)
echo "5. Running database migrations..."
cd elimu-platform
pnpm db:migrate
cd ..

# Restart applications
echo "6. Restarting applications..."
pm2 restart ecosystem.config.js

# Save PM2 process list
pm2 save

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Check status: pm2 status"
echo "View logs: pm2 logs"
echo ""
