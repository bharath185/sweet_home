@echo off
setlocal
cd /d "%~dp0frontend-nextjs"

echo ========================================================
echo Launching DecoFrog 3D Studio...
echo App URL: http://localhost:4005
echo ========================================================

start "" http://localhost:4005
npm run dev
