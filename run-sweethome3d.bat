@echo off
setlocal
cd /d "%~dp0"

set "JAVA_EXE=C:\Program Files (x86)\Java\jdk-1.8\bin\javaw.exe"
if not exist "%JAVA_EXE%" (
    set "JAVA_EXE=C:\Program Files (x86)\Java\jre1.8.0_441\bin\javaw.exe"
)
if not exist "%JAVA_EXE%" (
    set "JAVA_EXE=javaw"
)

set "CP=build\classes;SweetHome3D\lib\j3dcore.jar;SweetHome3D\lib\vecmath.jar;SweetHome3D\lib\j3dutils.jar;SweetHome3D\lib\iText-2.1.7.jar;SweetHome3D\lib\freehep-vectorgraphics-svg-2.1.1b.jar;SweetHome3D\lib\sunflow-0.07.3i.jar;SweetHome3D\lib\jmf.jar;SweetHome3D\lib\batik-svgpathparser-1.7.jar;SweetHome3D\libtest\AppleJavaExtensions.jar;SweetHome3D\libtest\jnlp.jar"
set "LIB_PATH=%~dp0SweetHome3D\lib\windows\i386"

start "" "%JAVA_EXE%" -cp "%CP%" "-Djava.library.path=%LIB_PATH%" com.eteks.sweethome3d.SweetHome3D %*
