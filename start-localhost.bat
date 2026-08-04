@echo off
cd /d "%~dp0"
title Grocery Shop - Localhost
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js and try again.
  pause
  exit /b 1
)
echo.
echo Starting Grocery Shop on localhost...
echo URL: http://127.0.0.1:3000/
echo Login: Admin / SPI99
echo Keep this window open while using the website.
echo.
start "" powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:3000/'"
node server.mjs
if errorlevel 1 (
  echo.
  echo Server did not start. Check whether another app is using port 3000.
  pause
)
