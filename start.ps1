$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir "frontend-nextjs")

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Launching DecoFrog 3D Studio at http://localhost:4005..." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

Start-Process "http://localhost:4005"
npm run dev
