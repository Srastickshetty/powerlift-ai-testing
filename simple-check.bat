@echo off
echo Checking Backend...
curl -s http://localhost:5001/api/agents/capabilities | findstr "success"

echo.
echo Checking Frontend...
curl -s -I http://localhost:5173 | findstr "200"

echo.
echo If both show results, system is working
echo.
pause
