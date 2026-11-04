@echo off
setlocal
echo ========================================================
echo Starting DecoFrog 3D Full Web Platform
echo [Backend]: Spring Boot at http://localhost:8090
echo [Frontend]: Next.js at http://localhost:4005
echo ========================================================

start "DecoFrog3D-SpringBoot" cmd /c "%~dp0start-springboot.bat"
timeout /t 3
start "DecoFrog3D-NextJS" cmd /c "%~dp0start-nextjs.bat"

echo.
echo Both servers starting! Open your browser at:
echo http://localhost:4005
echo.
pause
