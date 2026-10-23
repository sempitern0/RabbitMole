@echo off
setlocal
cd /d "%~dp0"
where powershell.exe >nul 2>nul
if not errorlevel 1 (
  echo RabbitMole: inventario y descubrimiento local nativos sin Python.
  powershell.exe -NoProfile -File "%~dp0run.ps1" wizard
  if errorlevel 1 (
    echo No se pudo iniciar PowerShell. Si la politica de la organizacion bloquea scripts, solicita autorizacion. No desactives controles de seguridad.
    pause
    exit /b 1
  )
  exit /b 0
)
echo Windows PowerShell no disponible. No se puede iniciar Discovery.
pause
exit /b 1
