@echo off
setlocal enabledelayedexpansion

echo.
echo ======================================================
echo    Restaurant POS System - Quick Start
echo ======================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Docker is not installed
    echo Please install Docker from https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Docker Compose is not installed
    echo Please install Docker Compose from https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo [OK] Docker is installed
echo [OK] Docker Compose is installed
echo.

REM Start services
echo [INFO] Building and starting services...
echo.

docker-compose up --build

echo.
echo ======================================================
echo      Application Started Successfully
echo ======================================================
echo.
echo Access the application:
echo   Frontend:   http://localhost
echo   Backend API: http://localhost:8000
echo   API Docs:   http://localhost:8000/docs
echo.
echo Default Credentials:
echo   Admin:  admin@restaurant.com / admin123456
echo   Staff:  staff@restaurant.com / staff123456
echo.
echo Press Ctrl+C to stop the application
echo.
pause
