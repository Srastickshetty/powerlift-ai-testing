@echo off
echo Testing CORS Fix...
echo.

curl -X GET "http://localhost:5001/api/coach/athletes/T37Oellg4pg5oE9HA6kWTqDIFvF2" -H "Origin: http://localhost:5174" -v

echo.
pause
