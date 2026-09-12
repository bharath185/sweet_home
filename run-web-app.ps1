$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir "SweetHome3DJS")

Write-Host "Starting Sweet Home 3D WebGL Design Studio at http://localhost:8000" -ForegroundColor Green
Start-Process "http://localhost:8000/studio.html"

python -m http.server 8000
