#!/bin/bash

# =============================================================================
# init.sh - Fullstack Blog Initialization Script
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Initializing Fullstack Blog...${NC}"

# Check MongoDB
echo "Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
  mongosh --eval "db.runCommand({ ping: 1 })" --quiet > /dev/null 2>&1 || {
    echo -e "${RED}Error: MongoDB is not running. Please start MongoDB first.${NC}"
    exit 1
  }
  echo -e "${GREEN}✓ MongoDB is running${NC}"
else
  echo -e "${YELLOW}Warning: mongosh not found, skipping MongoDB check${NC}"
fi

# Backend setup
if [ -d "backend" ]; then
  echo "Installing backend dependencies..."
  cd backend
  npm install
  cd ..
fi

# Frontend setup
if [ -d "frontend" ]; then
  echo "Installing frontend dependencies..."
  cd frontend
  npm install
  cd ..
fi

# Start backend
if [ -d "backend" ]; then
  echo "Starting backend server on port 5000..."
  cd backend
  npm run dev &
  BACKEND_PID=$!
  cd ..
fi

# Start frontend
if [ -d "frontend" ]; then
  echo "Starting frontend dev server on port 5173..."
  cd frontend
  npm run dev &
  FRONTEND_PID=$!
  cd ..
fi

sleep 3

echo ""
echo -e "${GREEN}✓ Initialization complete!${NC}"
[ -n "$BACKEND_PID" ] && echo -e "${GREEN}✓ Backend running at http://localhost:5000 (PID: $BACKEND_PID)${NC}"
[ -n "$FRONTEND_PID" ] && echo -e "${GREEN}✓ Frontend running at http://localhost:5173 (PID: $FRONTEND_PID)${NC}"
echo ""
echo "Ready to continue development."
