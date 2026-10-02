@echo off
echo ====================================
echo   TITAN-OS DIAGNOSTIC CHECK
echo ====================================
echo.

echo [1] Checking Backend Status...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5001/api/agents/capabilities' -UseBasicParsing $false -TimeoutSec 5; Write-Host 'Backend Status: ONLINE'; Write-Host 'Response:' $response.Content } catch { Write-Host 'Backend Status: OFFLINE - Error:' $_.Exception.Message }"

echo.
echo [2] Checking Frontend Status...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing $false -TimeoutSec 5; Write-Host 'Frontend Status: ONLINE'; Write-Host 'Response Length:' $response.Content.Length } catch { Write-Host 'Frontend Status: OFFLINE - Error:' $_.Exception.Message }"

echo.
echo [3] Checking CORS Configuration...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5001/api/agents/capabilities' -Headers @{'Origin'='http://localhost:5173'} -UseBasicParsing $false -TimeoutSec 5; Write-Host 'CORS Status: WORKING'; Write-Host 'CORS Header:' $response.Headers['Access-Control-Allow-Origin'] } catch { Write-Host 'CORS Status: FAILED - Error:' $_.Exception.Message }"

echo.
echo [4] Test Routes Available:
echo.
echo   Main Dashboard: http://localhost:5173/dashboard
echo   Test Features:  http://localhost:5173/test
echo   Titan War Room: http://localhost:5173/
echo   Classic Dashboard: http://localhost:5173/dashboard-classic

echo.
echo ====================================
echo   DIAGNOSTIC COMPLETE
echo ====================================
echo.
pause
