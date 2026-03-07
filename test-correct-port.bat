@echo off
echo Testing CORS with Correct Port 5173...
echo.

curl -X GET "http://localhost:5001/api/coach/athletes/T37Oellg4pg5oE9HA6kWTqDIFvF2" -H "Origin: http://localhost:5173" -v

echo.
pause
