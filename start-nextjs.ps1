Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting DecoFrog 3D - Next.js Studio (Port 4005)" -ForegroundColor Green
Write-Host "Opening in browser at http://localhost:4005" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir "frontend-nextjs")

Start-Process "http://localhost:4005"
npm run dev
