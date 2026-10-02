New-Item -ItemType Directory -Force -Path "legacy\root_clutter" | Out-Null
New-Item -ItemType Directory -Force -Path "legacy\backend_data" | Out-Null

$rootClutter = @(
  'BUG_FIX_DUPLICATE_EXERCISES.md',
  'CONNECTION_STATUS_REPORT.md',
  'CORS_FIX_REPORT.md',
  'DEPLOYMENT_GUIDE.md',
  'DIAGNOSTIC_CHECK.bat',
  'FINAL_PORT_CORRECTION_REPORT.md',
  'FRONTEND_FEATURE_GUIDE.md',
  'LAUNCH_TITAN_OS.bat',
  'LAUNCH_TITAN_OS_PRODUCTION.bat',
  'LOG_PERSISTENCE_FIX.md',
  'PERFORMANCE_OPTIMIZATION.md',
  'TITAN_AI_ARCHITECTURE.md',
  'TITAN_AI_INTEGRITY_REPORT.md',
  'TITAN_OS_FEATURE_AUDIT.md',
  'TITAN_OS_INTEGRATED_SYSTEM.html',
  'TITAN_OS_INTEGRATION_COMPLETE.md',
  'TITAN_OS_WORKING_DEMO.html',
  'package-test.json',
  'simple-check.bat',
  'test-ai-brain-deva-and-stability.js',
  'test-api-simple.ps1',
  'test-biomechanics-moment-arm.js',
  'test-correct-port.bat',
  'test-cors-fix.bat',
  'test-final-connection.ps1',
  'test-frontend-backend-connection.js',
  'test-instagram-scout.js',
  'test-recovery-council.js',
  'test-rpe-liar.js',
  'test-sentiment-session.ps1',
  'test-session-simple.ps1',
  'test-session.json',
  'test-session.ps1',
  'test-simple.bat',
  'test-titan-all.js',
  'titan-demo.html',
  'titan-interactive-demo.html',
  'verification-report.json'
)

foreach ($f in $rootClutter) {
  if (Test-Path $f) {
    Move-Item -Path $f -Destination "legacy\root_clutter" -Force
    Write-Host "Moved $f to legacy\root_clutter"
  }
}

$backendDataFiles = @(
  'backend\data\athlete_memories.json',
  'backend\data\athletes.json',
  'backend\data\athleteStatus.json',
  'backend\data\users.json',
  'backend\data\workoutLogs.json',
  'backend\data\autoregulationProposals.json',
  'backend\data\coach_waitlist.json',
  'backend\data\broadcasts.json'
)

foreach ($bf in $backendDataFiles) {
  if (Test-Path $bf) {
    Copy-Item -Path $bf -Destination "legacy\backend_data" -Force
    git rm --cached $bf 2>$null
    Write-Host "Archived and untracked $bf"
  }
}
