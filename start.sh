#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    Restaurant POS System - Quick Start              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

# Check if containers are already running
if docker ps --format '{{.Names}}' | grep -q "pos_"; then
    echo -e "${YELLOW}POS containers are already running${NC}"
    echo ""
    echo -e "Options:"
    echo "  1) Stop and restart containers"
    echo "  2) View logs"
    echo "  3) Stop containers"
    echo "  4) Exit"
    read -p "Choose an option (1-4): " option
    
    case $option in
        1)
            echo -e "${YELLOW}Stopping containers...${NC}"
            docker-compose down
            ;;
        2)
            docker-compose logs -f
            exit 0
            ;;
        3)
            docker-compose down
            exit 0
            ;;
        4)
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac
fi

# Start services
echo -e "${YELLOW}Building and starting services...${NC}"
echo ""

docker-compose up --build

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            Application Started Successfully          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Access the application:"
echo -e "  ${GREEN}Frontend:${NC}  http://localhost"
echo -e "  ${GREEN}Backend API:${NC} http://localhost:8000"
echo -e "  ${GREEN}API Docs:${NC}   http://localhost:8000/docs"
echo ""
echo -e "Default Credentials:"
echo -e "  ${GREEN}Admin:${NC}     admin@restaurant.com / admin123456"
echo -e "  ${GREEN}Staff:${NC}     staff@restaurant.com / staff123456"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the application${NC}"
