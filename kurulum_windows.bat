@echo off
chcp 65001 >nul
title YKS 2027 Koci - Windows 10 Otomatik Kurulum

echo ========================================================
echo YKS 2027 Koci - Windows 10 Otomatik Kurulum ve Baslatici
echo ========================================================
echo.
echo Bu betik:
echo 1. Masaustune 'YKS 2027 Koci' kisayolu olusturur.
echo 2. Bilgisayar her acildiginda uygulamanin otomatik baslamasini saglar.
echo.

set "APP_URL=https://ozunekmekci.github.io/2027YKSProgrami/"
set "SHORTCUT_NAME=YKS 2027 Koci.lnk"
set "DESKTOP_DIR=%USERPROFILE%\Desktop"
set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

set "BROWSER_EXE=msedge.exe"
where msedge.exe >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    where chrome.exe >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set "BROWSER_EXE=chrome.exe"
    ) else (
        echo [UYARI] Edge veya Chrome bulunamadi, varsayilan tarayici ile baslatilacak.
        set "BROWSER_EXE="
    )
)

echo [1/3] Masaustu kisayolu olusturuluyor...
powershell -NoProfile -Command ^
    "$ws = New-Object -ComObject WScript.Shell; " ^
    "$s = $ws.CreateShortcut('%DESKTOP_DIR%\%SHORTCUT_NAME%'); " ^
    "if ('%BROWSER_EXE%' -ne '') { $s.TargetPath = '%BROWSER_EXE%'; $s.Arguments = '--app=%APP_URL%'; } else { $s.TargetPath = '%APP_URL%'; } " ^
    "$s.Description = 'YKS 2027 Calisma Programi ve Kocu'; " ^
    "$s.Save()"

echo [2/3] Windows Baslangic (Startup) kaydi yapiliyor...
powershell -NoProfile -Command ^
    "$ws = New-Object -ComObject WScript.Shell; " ^
    "$s = $ws.CreateShortcut('%STARTUP_DIR%\%SHORTCUT_NAME%'); " ^
    "if ('%BROWSER_EXE%' -ne '') { $s.TargetPath = '%BROWSER_EXE%'; $s.Arguments = '--app=%APP_URL%'; } else { $s.TargetPath = '%APP_URL%'; } " ^
    "$s.Description = 'YKS 2027 Calisma Programi ve Kocu'; " ^
    "$s.Save()"

echo [3/3] Kurulum tamamlandi. Uygulama baslatiliyor...
if "%BROWSER_EXE%" NEQ "" (
    start "" "%BROWSER_EXE%" --app=%APP_URL%
) else (
    start "" "%APP_URL%"
)

echo.
echo ========================================================
echo Kurulum basariyla tamamlandi.
echo Bilgisayarinizi her actiginizda program kaldigi yerden
echo otomatik olarak acilacaktir.
echo ========================================================
echo.
timeout /t 5
