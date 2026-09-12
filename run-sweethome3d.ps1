$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$javaExe = "C:\Program Files (x86)\Java\jdk-1.8\bin\javaw.exe"
if (!(Test-Path $javaExe)) {
    $javaExe = "C:\Program Files (x86)\Java\jre1.8.0_441\bin\javaw.exe"
}
if (!(Test-Path $javaExe)) {
    $javaExe = "javaw"
}

$cp = @(
    "build\classes",
    "SweetHome3D\lib\j3dcore.jar",
    "SweetHome3D\lib\vecmath.jar",
    "SweetHome3D\lib\j3dutils.jar",
    "SweetHome3D\lib\iText-2.1.7.jar",
    "SweetHome3D\lib\freehep-vectorgraphics-svg-2.1.1b.jar",
    "SweetHome3D\lib\sunflow-0.07.3i.jar",
    "SweetHome3D\lib\jmf.jar",
    "SweetHome3D\lib\batik-svgpathparser-1.7.jar",
    "SweetHome3D\libtest\AppleJavaExtensions.jar",
    "SweetHome3D\libtest\jnlp.jar"
) -join ";"

$libPath = (Resolve-Path "SweetHome3D\lib\windows\i386").Path

Start-Process -FilePath $javaExe -ArgumentList @("-cp", "`"$cp`"", "-Djava.library.path=`"$libPath`"", "com.eteks.sweethome3d.SweetHome3D")
