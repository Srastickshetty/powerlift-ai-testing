$body = @{
    athleteData = @{
        hrv = 45
        restingHR = 72
        sleepQuality = 5.5
    }
    baselineData = @{
        hrv = 65
        restingHR = 60
        avgVelocity = 0.35
    }
    sessionData = @{
        currentRPE = 10
        currentVelocity = 0.5
        targetVelocity = 0.4
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5001/api/agents/sentiment/analyze' -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 5
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
