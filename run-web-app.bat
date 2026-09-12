@echo off
setlocal
cd /d "%~dp0SweetHome3DJS"

echo Starting Sweet Home 3D WebGL Design Studio...
echo Serving at http://localhost:8000
start http://localhost:8000/studio.html

python -m http.server 8000
