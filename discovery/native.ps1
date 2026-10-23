# RabbitMole Discovery nativo · Windows PowerShell 5.1+
# Sin Python, sin elevación, sin instalación ni exploración de puertos.
[CmdletBinding()]
param(
    [ValidateSet('doctor','wizard','scan','inventory')][string]$Action = 'wizard',
    [string]$Cidr = '',
    [string]$Output = '',
    [switch]$Authorized
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$collector=Join-Path (Split-Path -Parent $PSScriptRoot) 'collect-local.ps1'
function Save-Json([object]$payload,[string]$name) {
    if ([string]::IsNullOrWhiteSpace($name)) { throw 'Especifica -Output con un nuevo archivo JSON.' }
    $full=[IO.Path]::GetFullPath($name)
    if (-not [IO.Directory]::Exists([IO.Path]::GetDirectoryName($full))) { throw 'La carpeta de salida no existe.' }
    if ([IO.File]::Exists($full)) { throw 'Archivo ya existente. No se sobrescriben capturas.' }
    $json=ConvertTo-Json -InputObject $payload -Depth 9
    $stream=[IO.File]::Open($full,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
    try {
        $writer=New-Object IO.StreamWriter($stream,(New-Object System.Text.UTF8Encoding($false)))
        try { $writer.Write($json);$writer.Flush() } finally { $writer.Dispose() }
    } finally { $stream.Dispose() }
    Write-Host "Guardado: $full"
}
function Check-Scope([string]$candidate) {
    $match=[regex]::Match($candidate,'^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$')
    if (-not $match.Success) { throw 'CIDR inválido. Ejemplo: 192.168.10.0/26.' }
    $prefix=[int]$match.Groups[2].Value
    if ($prefix -lt 24 -or $prefix -gt 30) { throw 'Escaneo nativo limitado a prefijos /24 a /30 (máximo 256 direcciones).' }
    $ip=[System.Net.IPAddress]::Parse($match.Groups[1].Value)
    $bytes=$ip.GetAddressBytes()
    if ($bytes.Length -ne 4) { throw 'Solo IPv4.' }
    $private=($bytes[0] -eq 10) -or
        ($bytes[0] -eq 172 -and $bytes[1] -ge 16 -and $bytes[1] -le 31) -or
        ($bytes[0] -eq 192 -and $bytes[1] -eq 168)
    if (-not $private) { throw 'Solo redes privadas RFC1918 autorizadas.' }
    $address=([uint64]$bytes[0] -shl 24) -bor ([uint64]$bytes[1] -shl 16) -bor
        ([uint64]$bytes[2] -shl 8) -bor ([uint64]$bytes[3])
    $size=[int][math]::Pow(2,32-$prefix)
    if (($address % $size) -ne 0) { throw 'Especifica la dirección de RED alineada al CIDR, no la IP de un host.' }
    return @{address=$address;count=$size;cidr=$candidate}
}
function Detect-Host([string]$ip) {
    # ping ICMP nativo: no invoca administración remota ni consulta puertos.
    try {
        & ping.exe -n 1 -w 600 $ip *> $null
        return ($LASTEXITCODE -eq 0)
    } catch { return $false }
}
if ($Action -eq 'doctor') {
    Write-Host ('Windows PowerShell: '+$PSVersionTable.PSVersion.ToString())
    Write-Host ('PowerShell local: '+(Test-Path $collector)+'; ping.exe: '+[bool](Get-Command ping.exe -ErrorAction SilentlyContinue))
    Write-Host 'Modo estándar: inventario local sin Python ni administrador.'
    Write-Host 'La red requiere -Action scan, -Cidr, -Authorized y -Output. La ausencia de respuesta ICMP NO prueba que un equipo no exista.'
    return
}
if ($Action -eq 'wizard') {
    Write-Host 'RabbitMole · Reconocimiento con permisos de usuario estándar'
    Write-Host '1. Inventario de ESTE equipo (hardware, SO, programas y estado antivirus)'
    Write-Host '2. Descubrimiento ICMP de hosts en red privada autorizada'
    Write-Host '3. Diagnóstico de herramientas'
    $choice=Read-Host 'Selecciona 1, 2 o 3'
    if ($choice -eq '3') { & $PSCommandPath -Action doctor; return }
    if ($choice -notin @('1','2')) { throw 'Opción cancelada o desconocida.' }
    if ($choice -eq '1') { $Action='inventory' }
    else { $Action='scan';$Cidr=Read-Host 'CIDR autorizado (por ejemplo 192.168.10.0/26)'
        if ((Read-Host 'Escribe AUTORIZO para confirmar el alcance') -ne 'AUTORIZO') { throw 'No autorizado. No se inicia tráfico.' }
        $Authorized=$true }
    $Output=Read-Host 'Ruta de un NUEVO archivo JSON'
}
if ($Action -eq 'inventory') {
    if (-not (Test-Path -LiteralPath $collector -PathType Leaf)) { throw 'Falta collect-local.ps1 en el kit.' }
    & $collector -Output $Output
    if (-not $?) { throw 'La recopilación local no se ha completado.' }
    return
}
if (-not $Authorized) { throw 'Es obligatorio confirmar el alcance con -Authorized. No se ejecutó tráfico.' }
if (-not (Get-Command ping.exe -ErrorAction SilentlyContinue)) { throw 'No se encontró ping.exe en el sistema.' }
$scope=Check-Scope $Cidr
$hosts=New-Object 'System.Collections.Generic.List[object]'
$checked=0
$start=1
$end=$scope.count - 2
if ($end -lt $start) { throw 'CIDR demasiado pequeño para enumerar hosts.' }
Write-Host ("ICMP solo lectura: {0} direcciones en {1}. Solo hosts que respondan. Puede tardar." -f ($end-$start+1),$Cidr)
for ($i=$start;$i -le $end;$i++) {
    $value=[uint64]$scope.address+[uint64]$i
    $ip=('{0}.{1}.{2}.{3}' -f (($value -shr 24) -band 255),(($value -shr 16) -band 255),(($value -shr 8) -band 255),($value -band 255))
    $checked++
    if (Detect-Host $ip) {
        [void]$hosts.Add([ordered]@{
            name=$ip;ip=$ip
            notes='Respondió a ICMP desde equipo auditor. Identidad, hardware, SO, programas y credenciales NO comprobados.'
        })
    }
}
$payload=[ordered]@{
    kind='rabbitmole-discovery-v1';schemaVersion=1;capturedAt=(Get-Date).ToUniversalTime().ToString('o')
    source=[ordered]@{platform='Windows';collector='discovery/native.ps1';scope=$Cidr;mode='authorized-icmp';privilege='usuario estándar';limitations=@('ICMP no detecta hosts que bloqueen ping','No realiza inventario remoto de sistema, software ni licencias')}
    items=[ordered]@{
        assets=@($hosts.ToArray())
        networks=@([ordered]@{name="Alcance observado $Cidr";cidr=$Cidr;notes='Alcance autorizado del barrido. No verifica VLAN, gateway ni ACL.'})
        software=@()
    }
}
Save-Json $payload $Output
Write-Host ("Respuestas: {0} / {1}. No se escanearon puertos ni se identificó software remoto." -f $hosts.Count,$checked)
