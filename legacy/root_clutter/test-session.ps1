$body = Get-Content 'test-session.json' | Out-String

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5001/api/agents/sentiment/analyze' -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 5
    Write-Host '🚀 TITAN-AI Session Start Test'
    Write-Host '================================'
    Write-Host 'Status:' $response.StatusCode
    
    if ($response.Content) {
        Write-Host '✅ Response Received:'
        Write-Host $response.Content
        
        $jsonResponse = $response.Content | ConvertFrom-Json
        
        # Check for intervention alerts
        if ($jsonResponse.result -and $jsonResponse.result.alerts) {
            Write-Host '🚨 Intervention Alerts Triggered:'
            $jsonResponse.result.alerts | ForEach-Object {
                Write-Host "  - [$($_.severity.ToUpper())] $($_.type): $($_.message)"
            }
        }
        
        # Check intervention level
        if ($jsonResponse.result -and $jsonResponse.result.interventionLevel) {
            Write-Host "🎯 Intervention Level: $($jsonResponse.result.interventionLevel.ToUpper())"
        }
        
        # Check recommendations
        if ($jsonResponse.result -and $jsonResponse.result.recommendations) {
            Write-Host '💡 Recommendations Generated:'
            $jsonResponse.result.recommendations | ForEach-Object {
                Write-Host "  - [$($_.priority.ToUpper())] $($_.type): $($_.message)"
            }
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
}
