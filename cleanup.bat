@echo off
echo ========================================
echo KnightKernel Cleanup Script
echo ========================================
echo.
echo This script will delete all project files except:
echo - README.md
echo - PROJECT_REPORT.md
echo.
echo IMPORTANT: Stop all running processes first:
echo 1. Stop the frontend dev server (Ctrl+C in frontend terminal)
echo 2. Stop the Node.js bridge server (Ctrl+C in server terminal)
echo 3. Close any running kernel processes
echo.
pause

echo.
echo Deleting directories...
echo.

if exist "frontend" (
    echo Removing frontend...
    rmdir /s /q frontend
    if exist "frontend" (
        echo WARNING: Could not delete frontend - process may still be running
    ) else (
        echo SUCCESS: frontend deleted
    )
)

if exist "kernel" (
    echo Removing kernel...
    rmdir /s /q kernel
    if exist "kernel" (
        echo WARNING: Could not delete kernel - process may still be running
    ) else (
        echo SUCCESS: kernel deleted
    )
)

if exist "server" (
    echo Removing server...
    rmdir /s /q server
    if exist "server" (
        echo WARNING: Could not delete server - process may still be running
    ) else (
        echo SUCCESS: server deleted
    )
)

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Remaining files:
dir /b
echo.
pause
