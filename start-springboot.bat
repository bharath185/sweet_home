@echo off
setlocal
cd /d "%~dp0sweethome3d-springboot"

echo Starting Sweet Home 3D Spring Boot Web Server...
echo Web Interface URL: http://localhost:8090
start http://localhost:8090

java -jar target/sweethome3d-springboot-1.0.0.jar
