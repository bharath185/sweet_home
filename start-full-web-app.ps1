$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting DecoFrog 3D Full Web Platform" -ForegroundColor Yellow
Write-Host " [Backend]: Spring Boot REST API -> http://localhost:8090" -ForegroundColor Green
Write-Host " [Frontend]: Next.js CAD Studio -> http://localhost:4005" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-File", (Join-Path $scriptDir "start-springboot.ps1")
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-File", (Join-Path $scriptDir "start-nextjs.ps1")

Write-Host "`nBoth servers starting! Open your browser at http://localhost:4005`n" -ForegroundColor Cyan
