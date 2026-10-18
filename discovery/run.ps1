$ErrorActionPreference='Stop'
$engine=Join-Path $PSScriptRoot 'discover.py'
if($args.Count -gt 0 -and $args[0] -eq 'service'){
    $engine=Join-Path $PSScriptRoot 'service.py'
    $commandArgs=@($args | Select-Object -Skip 1)
} else { $commandArgs=if ($args.Count -eq 0){@('wizard')}else{$args} }
if(Get-Command py -ErrorAction SilentlyContinue){& py -3 $engine @commandArgs}
elseif(Get-Command python -ErrorAction SilentlyContinue){& python $engine @commandArgs}
else{throw 'Python 3.9+ no disponible. Ejecuta discovery/setup.ps1.'}
exit $LASTEXITCODE
