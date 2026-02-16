#!/bin/bash

# =============================================================================
# init.sh - Fullstack Blog Initialization Script
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${YELLOW}Initializing Fullstack Blog...${NC}"

# Check MySQL connection
echo "Checking MySQL connection..."
if command -v mysql &> /dev/null; then
  if mysql -u root -phero1234 -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ MySQL is running and accessible${NC}"

    # Ensure database exists
    mysql -u root -phero1234 -e "CREATE DATABASE IF NOT EXISTS fullstack_blog" 2>/dev/null
    echo -e "${GREEN}✓ Database fullstack_blog ready${NC}"
  else
    echo -e "${RED}Error: Cannot connect to MySQL. Check password in CLAUDE.md.${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}Warning: mysql CLI not found, skipping DB check${NC}"
fi

# Backend setup
if [ -d "$SCRIPT_DIR/backend" ]; then
  echo "Installing backend dependencies..."
  cd "$SCRIPT_DIR/backend"
  npm install

  # Sync Prisma schema to database
  echo "Syncing database schema..."
  npx prisma db push 2>&1 || {
    echo -e "${RED}Error: prisma db push failed${NC}"
    exit 1
  }
  echo -e "${GREEN}✓ Database schema synced${NC}"

  # Generate Prisma client
  npx prisma generate 2>&1 > /dev/null
  echo -e "${GREEN}✓ Prisma client generated${NC}"

  # Run seed
  echo "Seeding database..."
  npm run seed 2>&1 && echo -e "${GREEN}✓ Database seeded (admin@blog.com / admin123)${NC}" || {
    echo -e "${YELLOW}Warning: Seed failed, may already be seeded${NC}"
  }

  cd "$SCRIPT_DIR"
fi

# Frontend setup
if [ -d "$SCRIPT_DIR/frontend" ]; then
  echo "Installing frontend dependencies..."
  cd "$SCRIPT_DIR/frontend"
  npm install
  cd "$SCRIPT_DIR"
fi

# Verify builds
echo ""
echo "Verifying builds..."

cd "$SCRIPT_DIR/backend" && npm run build 2>&1 > /dev/null && \
  echo -e "${GREEN}✓ Backend build passed${NC}" || \
  echo -e "${RED}✗ Backend build failed${NC}"

cd "$SCRIPT_DIR/frontend" && npm run build 2>&1 > /dev/null && \
  echo -e "${GREEN}✓ Frontend build passed${NC}" || \
  echo -e "${RED}✗ Frontend build failed${NC}"

cd "$SCRIPT_DIR"

echo ""
echo -e "${GREEN}✓ Initialization complete!${NC}"
echo ""
echo "To start development, run in separate terminals:"
echo "  cd backend  && npm run dev    # http://localhost:5000"
echo "  cd frontend && npm run dev    # http://localhost:5173"
echo ""
echo "Admin login: admin@blog.com / admin123"
