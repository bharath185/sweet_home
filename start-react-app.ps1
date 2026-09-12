$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir "web-app-react")

Write-Host "Starting Sweet Home 3D React Application at http://localhost:3000..." -ForegroundColor Green
Start-Process "http://localhost:3000"
npm run dev
