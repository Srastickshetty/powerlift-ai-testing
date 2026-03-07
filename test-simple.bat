@echo off
echo Testing TITAN-AI API Connection...
echo.

curl -X GET http://localhost:5001/api/agents/capabilities
echo.

echo.
pause
