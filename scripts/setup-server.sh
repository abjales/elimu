#!/bin/bash
# ELIMU Platform - Server Setup Script
# Run this on your Contabo VPS (Ubuntu 22.04)

set -e

echo "=== ELIMU Platform Setup ==="
echo "This script will set up your Contabo VPS for ELIMU."
echo ""

# Update system
echo "1. Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "2. Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
echo "3. Installing pnpm..."
sudo npm install -g pnpm

# Install PM2
echo "4. Installing PM2..."
sudo npm install -g pm2

# Install PostgreSQL 16
echo "5. Installing PostgreSQL 16..."
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16 postgresql-client-16

# Install Redis
echo "6. Installing Redis..."
sudo apt install -y redis-server

# Install Nginx
echo "7. Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
echo "8. Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Install Docker (optional, for OpenMAIC)
echo "9. Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# Configure PostgreSQL
echo "10. Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE USER elimu WITH PASSWORD 'your_secure_password_here';"
sudo -u postgres psql -c "CREATE DATABASE elimu OWNER elimu;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE elimu TO elimu;"

# Configure Redis
echo "11. Configuring Redis..."
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Create app directory
echo "12. Creating app directory..."
sudo mkdir -p /var/www/elimu
sudo chown $USER:$USER /var/www/elimu

# Create uploads directory
echo "13. Creating uploads directory..."
sudo mkdir -p /var/www/elimu/uploads
sudo chown $USER:$USER /var/www/elimu/uploads

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Clone your ELIMU repository to /var/www/elimu"
echo "2. Configure .env.local with your database and API keys"
echo "3. Run 'pnpm install && pnpm build'"
echo "4. Set up Nginx configuration (see nginx-config.conf)"
echo "5. Run 'pm2 start ecosystem.config.js' to start the app"
echo "6. Run 'certbot --nginx' to set up SSL"
echo ""
echo "Don't forget to:"
echo "- Update PostgreSQL password from the default"
echo "- Set up firewall rules (UFW)"
echo "- Configure your domain DNS to point to this server"
