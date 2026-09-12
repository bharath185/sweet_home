@echo off
echo ========================================================
echo Starting Sweet Home 3D Full Web Platform
echo [Backend]: Spring Boot at http://localhost:8090
echo [Frontend]: Next.js at http://localhost:3000
echo ========================================================

start "SweetHome3D-SpringBoot" cmd /c "d:\PROJECTS\sweethome\start-springboot.bat"
timeout /t 3
start "SweetHome3D-NextJS" cmd /c "d:\PROJECTS\sweethome\start-nextjs.bat"

echo.
echo Both servers starting! Open your browser at:
echo http://localhost:3000
echo.
pause
