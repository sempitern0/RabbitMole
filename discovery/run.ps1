# Lanzador compatible con PowerShell 5.1: inventario nativo primero.
# No cambia la política de ejecución ni solicita elevación.
$ErrorActionPreference='Stop'
$action=if($args.Count -eq 0){'wizard'}else{[string]$args[0]}
$native=Join-Path $PSScriptRoot 'native.ps1'
$python=Join-Path $PSScriptRoot 'discover.py'
$service=Join-Path $PSScriptRoot 'service.py'
if($action -in @('inventory','local','collect','doctor','wizard','scan')){
    $mode=if($action -in @('inventory','local','collect')){'inventory'}else{$action}
    # Discovery nativo es el predeterminado para Windows con permisos estándar.
    # El mismo JSON v1 se revisa antes de incorporarse a la PWA.
    $rest=if($args.Count -gt 1){@($args | Select-Object -Skip 1)}else{@()}
    $nativeArgs=@{Action=$mode}
    for($i=0;$i -lt $rest.Count;$i++){
        switch -Regex ([string]$rest[$i]){
            '^(-Output|--output)$' {
                if($i+1 -ge $rest.Count){throw 'Falta ruta -Output'};$nativeArgs.Output=[string]$rest[++$i];break
            }
            '^(-Cidr|--cidr)$' {
                if($i+1 -ge $rest.Count){throw 'Falta valor CIDR'};$nativeArgs.Cidr=[string]$rest[++$i];break
            }
            '^(-Authorized|--authorized)$' {$nativeArgs.Authorized=$true;break}
            default {throw ('Argumento desconocido: '+$rest[$i])}
        }
    }
    & $native @nativeArgs
    if(-not $?) {exit 1}
    exit 0
}
if($action -eq 'service'){
    $python=$service
    $rest=if($args.Count -gt 1){@($args | Select-Object -Skip 1)}else{@()}
    if(Get-Command py -ErrorAction SilentlyContinue){& py -3 $python @rest}
    elseif(Get-Command python -ErrorAction SilentlyContinue){& python $python @rest}
    else{throw 'El servicio puente HTTPS requiere Python 3.9+ o Companion Windows autocontenido. Para capturar el equipo sin Python usa: .\discovery\run.ps1 inventory --output captura.json'}
    exit $LASTEXITCODE
}
throw 'Acción desconocida. Usa wizard, doctor, inventory o scan (sin Python), o service (requiere Python).'
