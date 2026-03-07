@echo off
echo ====================================
echo   TITAN-OS ECOSYSTEM LAUNCH
echo ====================================
echo.

echo [1] Starting Backend Server...
cd /d "d:\powerlift-ai - Copy\backend"
start /B "POWERLIFT_AI Backend" node server.js

echo [2] Starting Frontend Server...
cd /d "d:\powerlift-ai - Copy\frontend"
start /B "TITAN-AI Frontend" npm run dev

echo.
echo [3] Servers Starting...
timeout /t 5 > nul

echo.
echo [4] Checking Backend Status...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5001/api/titan-os/orb' -UseBasicParsing $false -TimeoutSec 5; Write-Host 'Backend Status:' $response.StatusCode; Write-Host 'Response:' $response.Content } catch { Write-Host 'Backend Error:' $_.Exception.Message }"

echo.
echo [5] Launching Browser...
start http://localhost:5173

echo.
echo ====================================
echo   TITAN-OS FULLY OPERATIONAL
echo ====================================
echo.
echo Access Main Dashboard: http://localhost:5173
echo Access Titan-OS Control: http://localhost:5173
echo.
pause
