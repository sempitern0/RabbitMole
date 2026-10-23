[CmdletBinding()]
param([switch]$InstallTools)
$ErrorActionPreference='Stop'
$pythonPresent=$false
if(Get-Command py -ErrorAction SilentlyContinue){& py -3 -c 'import sys;sys.exit(0 if sys.version_info>=(3,9) else 1)' 2>$null;$pythonPresent=($LASTEXITCODE -eq 0)}
elseif(Get-Command python -ErrorAction SilentlyContinue){& python -c 'import sys;sys.exit(0 if sys.version_info>=(3,9) else 1)' 2>$null;$pythonPresent=($LASTEXITCODE -eq 0)}
$nmapPresent=[bool](Get-Command nmap -ErrorAction SilentlyContinue)
Write-Host "PowerShell nativo: disponible; Python avanzado: $pythonPresent; Nmap opcional: $nmapPresent; ping: $([bool](Get-Command ping -ErrorAction SilentlyContinue))"
Write-Host 'Inventario de este Windows sin Python: powershell.exe -NoProfile -File .\\collect-local.ps1 -Output captura.json'
if(-not $InstallTools){Write-Host 'Solo diagnóstico. Python/Nmap NO son necesarios para el inventario nativo. -InstallTools solo para motor avanzado y bajo autorización del cliente.';return}
if(-not(Get-Command winget -ErrorAction SilentlyContinue)){throw 'Instala Python 3 y Nmap manualmente: winget no disponible.'}
if(-not $pythonPresent){& winget install --exact --id Python.Python.3.13;if($LASTEXITCODE -ne 0){throw 'Error instalando Python'}}
if(-not $nmapPresent){& winget install --exact --id Insecure.Nmap;if($LASTEXITCODE -ne 0){throw 'Error instalando Nmap'}}
Write-Host 'Reabre PowerShell para actualizar PATH.'
