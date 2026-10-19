@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 "%~dp0companion.py"
  goto success
)
where python >nul 2>nul
if %errorlevel%==0 (
  python "%~dp0companion.py"
  goto success
)
echo RabbitMole Companion requiere Python 3.9 o superior con Tkinter.
echo Ejecuta setup.ps1 para diagnosticar y, opcionalmente, instalar Python.
pause
exit /b 1
:success
if errorlevel 1 (
  echo El Companion no pudo arrancar. Revisa Python y consulta README_ES.md.
  pause
)
