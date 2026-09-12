@echo off
setlocal
cd /d "%~dp0web-app-react"

echo Starting Sweet Home 3D React Application...
start http://localhost:3000
npm run dev
