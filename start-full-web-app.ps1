Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting Sweet Home 3D Full Web Platform" -ForegroundColor Yellow
Write-Host " [Backend]: Spring Boot REST API -> http://localhost:8090" -ForegroundColor Green
Write-Host " [Frontend]: Next.js CAD Studio -> http://localhost:3000" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-File", "d:\PROJECTS\sweethome\start-springboot.ps1"
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-File", "d:\PROJECTS\sweethome\start-nextjs.ps1"

Write-Host "`nBoth servers starting! Open your browser at http://localhost:3000`n" -ForegroundColor Cyan
