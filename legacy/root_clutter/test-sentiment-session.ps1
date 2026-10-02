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
    $response = Invoke-WebRequest -Uri 'http://localhost:5001/api/agents/sentiment/analyze' -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 5
    Write-Host "🚀 TITAN-AI Session Start Test"
    Write-Host "================================"
    Write-Host "Status: $($response.StatusCode)"
    
    if ($response.Content) {
        $jsonResponse = $response.Content | ConvertFrom-Json
        Write-Host "✅ Response Received:"
        Write-Host $jsonResponse
        
        # Check for intervention alerts
        if ($jsonResponse.result -and $jsonResponse.result.alerts) {
            Write-Host "🚨 Intervention Alerts Triggered:"
            $jsonResponse.result.alerts | ForEach-Object {
                Write-Host "  - [$($_.severity.ToUpper())] $($_.type): $($_.message)"
            }
        }
        
        # Check intervention level
        if ($jsonResponse.result -and $jsonResponse.result.interventionLevel) {
            Write-Host "🎯 Intervention Level: $($jsonResponse.result.interventionLevel.ToUpper())"
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
}
