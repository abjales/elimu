#!/bin/bash
# ELIMU Platform - Deployment Script
# Run this on your Contabo VPS after initial setup

set -e

APP_DIR="/var/www/elimu"
LOG_DIR="/var/log/elimu"

echo "=== ELIMU Deployment ==="
echo ""

# Create log directory
sudo mkdir -p $LOG_DIR
sudo chown $USER:$USER $LOG_DIR

# Navigate to app directory
cd $APP_DIR

# Pull latest changes
echo "1. Pulling latest changes..."
cd elimu-platform
git pull origin main
cd ..

cd openmaic
git pull origin main
cd ..

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

# Run database migrations
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
