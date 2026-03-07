@echo off
title TITAN-OS Production Launch
echo.
echo ========================================
echo   TITAN-OS PRODUCTION LAUNCH SEQUENCE
echo ========================================
echo.

echo [1/5] Starting Backend Server...
cd /d "d:\powerlift-ai - Copy\backend"
start "TITAN-OS Backend" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

echo [2/5] Verifying Backend Health...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5001/api/agents/capabilities' -UseBasicParsing $false -TimeoutSec 10; Write-Host 'Backend Status: ONLINE' } catch { Write-Host 'Backend Status: OFFLINE - Error:' $_.Exception.Message }"

echo.
echo [3/5] Starting Frontend Server...
cd /d "d:\powerlift-ai - Copy\frontend"
start "TITAN-OS Frontend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo [4/5] Verifying Frontend Health...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing $false -TimeoutSec 10; Write-Host 'Frontend Status: ONLINE' } catch { Write-Host 'Frontend Status: OFFLINE - Error:' $_.Exception.Message }"

echo.
echo [5/5] Running System Verification...
cd /d "d:\powerlift-ai - Copy"
node scripts/final-verify.js

echo.
echo ========================================
echo   TITAN-OS PRODUCTION SYSTEM READY
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5001
echo.
echo Available Routes:
echo   /                    - Titan War Room
echo   /dashboard           - Athlete Command Center / Coach Strategy Room
echo   /competition         - Competition Engine
echo   /biomechanics        - Biomechanics Lab
echo   /voice               - Voice Processor
echo   /meet-logistics      - Meet Logistics
echo   /tars-d              - TARS-D Voice Assistant
echo   /titan-demo          - Interactive Demo
echo.
echo Press any key to open Titan Dashboard...
pause >nul

start http://localhost:5173

echo.
echo 🚀 TITAN-OS Production System Launched Successfully!
echo.
pause
