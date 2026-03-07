$body = @{
    athleteData = @{
        hrv = 45
    }
}

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5001/api/agents/sentiment/analyze' -Method POST -ContentType 'application/json' -Body ($body | ConvertTo-Json)
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
