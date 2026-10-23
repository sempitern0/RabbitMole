# RabbitMole · Inventario LOCAL de Windows. PowerShell 5.1+, sin Python ni administrador.
# Solo lectura, sin escaneo remoto, sin recopilar contraseñas ni claves de licencia.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$Output)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$limitations = New-Object 'System.Collections.Generic.List[string]'
function Warn-Limited([string]$area) {
    if (-not $limitations.Contains($area)) { [void]$limitations.Add($area) }
}
function Safe-Text($value, [int]$max=600) {
    if ($null -eq $value) { return '' }
    $result = ([string]$value).Trim()
    if ($result.Length -gt $max) { return $result.Substring(0,$max) }
    return $result
}
function Read-Cim([string]$class, [string]$label) {
    try { return @(Get-CimInstance -ClassName $class -ErrorAction Stop) }
    catch { Warn-Limited "$label: consulta no disponible con estos permisos o políticas"; return @() }
}
function To-Prefix([string]$mask) {
    $parts = $mask.Split('.')
    if ($parts.Count -ne 4) { return '' }
    try {
        $bits = ''
        foreach ($part in $parts) {
            $n = [int]$part
            if ($n -lt 0 -or $n -gt 255) { return '' }
            $bits += [Convert]::ToString($n,2).PadLeft(8,'0')
        }
        if ($bits -notmatch '^1*0*$') { return '' }
        return [string]($bits.ToCharArray() | Where-Object { $_ -eq '1' }).Count
    } catch { return '' }
}
$full = [IO.Path]::GetFullPath($Output)
$folder = [IO.Path]::GetDirectoryName($full)
if (-not [IO.Directory]::Exists($folder)) { throw 'La carpeta de destino no existe.' }
if ([IO.File]::Exists($full)) { throw 'El JSON ya existe. Elige una ruta nueva: no se sobrescriben capturas.' }
$computer = @(Read-Cim 'Win32_ComputerSystem' 'Equipo') | Select-Object -First 1
$os = @(Read-Cim 'Win32_OperatingSystem' 'Sistema operativo') | Select-Object -First 1
$processor = @(Read-Cim 'Win32_Processor' 'Procesador') | Select-Object -First 1
$bios = @(Read-Cim 'Win32_BIOS' 'BIOS') | Select-Object -First 1
$disks = @(Read-Cim 'Win32_DiskDrive' 'Discos') | Select-Object -First 16
$networkAdapters = @(Read-Cim 'Win32_NetworkAdapterConfiguration' 'Interfaces IP') |
    Where-Object { $_.IPEnabled -eq $true } | Select-Object -First 16
$captured = (Get-Date).ToUniversalTime().ToString('o')
$observedDate = (Get-Date).ToString('yyyy-MM-dd')
$hostName = Safe-Text $env:COMPUTERNAME 140
$networks = New-Object 'System.Collections.Generic.List[object]'
$observedIp = ''
$observedMac = ''
$assignment = 'Sin verificar'
foreach ($nic in $networkAdapters) {
    $ips = @($nic.IPAddress | Where-Object {
        $_ -match '^\d{1,3}(?:\.\d{1,3}){3}$' -and $_ -notmatch '^(127|169\.254)\.'
    })
    if (-not $ips.Count) { continue }
    $ip = Safe-Text $ips[0] 80
    $mode = if ($nic.DHCPEnabled -eq $true) { 'DHCP / dinámica' }
            elseif ($nic.DHCPEnabled -eq $false) { 'Estática / manual' }
            else { 'Sin verificar' }
    if (-not $observedIp) {
        $observedIp = $ip
        $observedMac = Safe-Text $nic.MACAddress 60
        $assignment = $mode
    }
    $prefix = if ($nic.IPSubnet) { To-Prefix ([string]@($nic.IPSubnet)[0]) } else { '' }
    $networkNotes = "Interfaz observada: $mode; máscara/prefijo local, DHCP y gateway por contrastar con la configuración autorizada. No acredita VLAN ni segmentación."
    if ($nic.DefaultIPGateway) { $gateway = Safe-Text @($nic.DefaultIPGateway)[0] 80 }
    else { $gateway = '' }
    $name = Safe-Text $nic.Description 140
    if (-not $name) { $name = 'Interfaz '+$networks.Count }
    $row = [ordered]@{
        name=$name
        cidr=$(if ($prefix) { "$ip/$prefix" } else { '' })
        gateway=$gateway
        notes=$networkNotes
    }
    [void]$networks.Add($row)
}
if (-not $networkAdapters.Count) { Warn-Limited 'No se pudo comprobar la asignación DHCP o las interfaces IP.' }
$drives = @($disks | ForEach-Object {
    $size = if ($_.Size) { ' ({0:N1} GiB)' -f ([double]$_.Size / 1GB) } else { '' }
    Safe-Text ((Safe-Text $_.Model 100)+$size) 160
} | Where-Object { $_ })
$security = [ordered]@{
    product=''
    realtime='No verificada'
    engine=''
    signatures=''
    checked=''
    notes='Estado de seguridad pendiente de contrastar.'
}
try {
    if (Get-Command Get-MpComputerStatus -ErrorAction SilentlyContinue) {
        $mp = Get-MpComputerStatus -ErrorAction Stop
        if ($null -ne $mp -and $null -ne $mp.AntivirusEnabled) {
            $security.product = 'Microsoft Defender Antivirus'
            if ($mp.AntivirusEnabled -eq $true -and $mp.RealTimeProtectionEnabled -eq $true) {
                $security.realtime = 'Activada'
            } elseif ($mp.RealTimeProtectionEnabled -eq $false) {
                $security.realtime = 'Desactivada'
            }
            $security.engine = Safe-Text $mp.AMEngineVersion 80
            $security.signatures = Safe-Text $mp.AntivirusSignatureVersion 80
            if ($security.signatures) { $security.checked = $observedDate }
            $security.notes = 'Estado local declarado por Defender. Puede estar en modo pasivo o gestionado; verificar políticas, fecha de actualización y consola EDR.'
        } else { Warn-Limited 'El estado de Microsoft Defender no está disponible.' }
    } else { Warn-Limited 'Get-MpComputerStatus no existe en este equipo.' }
} catch { Warn-Limited 'Defender: lectura restringida o no disponible; no se declara protección activa.' }
$services = @()
try {
    $services = @(Get-Service -ErrorAction Stop | Where-Object { $_.Status -eq 'Running' } |
        Select-Object -First 25 | ForEach-Object { Safe-Text $_.Name 100 })
} catch { Warn-Limited 'Servicios: listado parcial o acceso denegado.' }
$assetNotes = 'Captura LOCAL de solo lectura realizada con permisos del usuario actual. Datos declarados por Windows: contrastar con el equipo y la evidencia; no demuestra cumplimiento, derechos de licencia, EOL ni configuraciones administrativas.'
if ($limitations.Count) { $assetNotes += ' Limitaciones: '+($limitations -join '; ') }
$asset = [ordered]@{
    name=$hostName
    type='PC / portátil'
    vendor=$(if ($computer) { Safe-Text $computer.Manufacturer 140 } else { '' })
    model=$(if ($computer) { Safe-Text $computer.Model 140 } else { '' })
    serial=$(if ($bios) { Safe-Text $bios.SerialNumber 140 } else { '' })
    os=$(if ($os) { Safe-Text $os.Caption 180 } else { '' })
    cpu=$(if ($processor) { Safe-Text $processor.Name 160 } else { '' })
    ram=$(if ($computer -and $computer.TotalPhysicalMemory) {
        '{0:N1} GiB' -f ([double]$computer.TotalPhysicalMemory / 1GB)
    } else { '' })
    storage=Safe-Text ($drives -join '; ') 600
    ip=$observedIp
    ipAssignment=$assignment
    ipObservedAt=$(if ($observedIp) { $observedDate } else { '' })
    mac=$observedMac
    avProduct=$security.product
    avRealtime=$security.realtime
    avUpdated='No verificados'
    avEngineVersion=$security.engine
    avSignaturesVersion=$security.signatures
    avSignaturesCheckedAt=$security.checked
    osLicense='Pendiente de verificar'
    processReview=$(if ($services.Count) { 'Servicios locales observados (máx. 25): '+($services -join ', ')+'. No implica revisión de exposición.' } else { '' })
    notes=Safe-Text ($assetNotes+' '+$security.notes) 1800
}
$software = New-Object 'System.Collections.Generic.List[object]'
$seen = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
$uninstallRoots = @(
    'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKCU:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'
)
foreach ($root in $uninstallRoots) {
    try {
        $records = @(Get-ItemProperty -Path $root -ErrorAction Stop)
        foreach ($app in $records) {
            $name = Safe-Text $app.DisplayName 190
            if (-not $name -or $software.Count -ge 250) { continue }
            $version = Safe-Text $app.DisplayVersion 100
            $vendor = Safe-Text $app.Publisher 150
            $key = $name+'|'+$version+'|'+$vendor
            if (-not $seen.Add($key)) { continue }
            $sourceScope = if ($root.StartsWith('HKCU:')) { 'usuario actual' } else { 'equipo / HKLM' }
            [void]$software.Add([ordered]@{
                name=$name;version=$version;vendor=$vendor;asset=$hostName
                licenseStatus='Pendiente de verificar'
                support='Pendiente de verificar'
                notes="Instalación declarada en registro ($sourceScope). No demuestra licencia, uso efectivo ni fin de soporte; puede faltar software portable, Store o de otros perfiles."
            })
        }
    } catch { Warn-Limited ('Registro de programas no accesible: '+$root.Split('\')[0]) }
}
if (-not $software.Count) { Warn-Limited 'No hay aplicaciones enumerables en las claves Uninstall accesibles.' }
$data = [ordered]@{
    kind='rabbitmole-discovery-v1'
    schemaVersion=1
    capturedAt=$captured
    source=[ordered]@{
        platform='Windows';collector='collect-local.ps1';scope='local';mode='read-only'
        privilege='usuario actual (sin elevación requerida)'
        tools='PowerShell 5.1+; CIM; Registro de Windows; cmdlets disponibles'
        limitations=@($limitations)
    }
    items=[ordered]@{assets=@($asset);networks=@($networks.ToArray());software=@($software.ToArray())}
}
$json = ConvertTo-Json -InputObject $data -Depth 9
$encoding = New-Object System.Text.UTF8Encoding($false)
$stream = [IO.File]::Open($full,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
try {
    $writer = New-Object System.IO.StreamWriter($stream,$encoding)
    try { $writer.Write($json); $writer.Flush() } finally { $writer.Dispose() }
} finally { $stream.Dispose() }
Write-Host "RabbitMole: JSON local guardado en $full"
Write-Host ("Equipos: 1 | Interfaces: {0} | Aplicaciones: {1}" -f $networks.Count,$software.Count)
if ($limitations.Count) { Write-Warning ("Limitaciones: "+($limitations -join '; ')) }
