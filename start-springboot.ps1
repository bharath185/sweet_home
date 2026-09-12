$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir "sweethome3d-springboot")

Write-Host "Starting Sweet Home 3D Spring Boot Web Server at http://localhost:8090..." -ForegroundColor Green
Start-Process "http://localhost:8090"
java -jar target/sweethome3d-springboot-1.0.0.jar
