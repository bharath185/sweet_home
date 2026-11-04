@echo off
setlocal
cd /d "%~dp0frontend-nextjs"

echo ========================================================
echo Starting DecoFrog 3D Studio (Port 4005)...
echo Opening in browser at: http://localhost:4005
echo ========================================================

start "" http://localhost:4005
npm run dev
pause
