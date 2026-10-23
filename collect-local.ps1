# RabbitMole · Inventario LOCAL de Windows. PowerShell 5.1+, sin Python ni administrador.
# Solo lectura, sin escaneo remoto, sin recopilar contraseñas ni claves de licencia.
[CmdletBinding()]
param([string]$Output = "captura.json")
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
# Default and repeated captures must never overwrite the audit trail.
# Reserve the final filename atomically AFTER a successful inventory.
function New-CaptureTarget([string]$requested) {
    $path = [IO.Path]::GetFullPath($requested)
    $directory = [IO.Path]::GetDirectoryName($path)
    if (-not [IO.Directory]::Exists($directory)) {
        throw "La carpeta de salida no existe: $directory"
    }
    if ([IO.Path]::GetExtension($path) -ne '.json') {
        throw "El archivo de salida debe tener extensión .json"
    }
    $base = [IO.Path]::GetFileNameWithoutExtension($path)
    for ($number = 0; $number -le 9999; $number++) {
        $candidate = if ($number -eq 0) { $path } else {
            [IO.Path]::Combine($directory, ('{0}-{1}.json' -f $base,$number))
        }
        try {
            $stream = [IO.File]::Open($candidate,[IO.FileMode]::CreateNew,
                [IO.FileAccess]::Write,[IO.FileShare]::None)
            return @{ Path=$candidate; Stream=$stream }
        } catch [System.IO.IOException] {
            if (-not [IO.File]::Exists($candidate)) { throw }
        }
    }
    throw "Hay demasiadas capturas en $directory. Selecciona otra carpeta."
}
Write-Host "[RabbitMole] 1/5 · Preparando inventario de solo lectura..." -ForegroundColor Cyan
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
# Some uninstall/AppX records omit DisplayName, Version, Publisher or InstallDate.
# In StrictMode those omissions are not ordinary nulls unless read explicitly.
function Get-OptionalValue([object]$item, [string]$property) {
    if ($null -eq $item) { return $null }
    $entry = $item.PSObject.Properties[$property]
    if ($null -eq $entry) { return $null }
    return $entry.Value
}
function Read-Cim([string]$class, [string]$label) {
    try { return @(Get-CimInstance -ClassName $class -ErrorAction Stop) }
    catch { Warn-Limited "${label}: consulta no disponible con estos permisos o políticas"; return @() }
}
function To-NetworkCidr([string]$address,[int]$length) {
    try {
        $bytes = [Net.IPAddress]::Parse($address).GetAddressBytes()
        if ($bytes.Length -ne 4 -or $length -lt 0 -or $length -gt 32) { return '' }
        for ($i=0; $i -lt 4; $i++) {
            $bits = [Math]::Min([Math]::Max(($length-$i*8),0),8)
            $mask = if ($bits -eq 0) { 0 } else { 256 - [Math]::Pow(2,8-$bits) }
            $bytes[$i] = [byte]([int]$bytes[$i] -band [int]$mask)
        }
        return ((New-Object Net.IPAddress (,$bytes)).ToString()+'/'+$length)
    } catch { return '' }
}
function Invariant-Number([double]$number,[int]$digits=1) {
    return $number.ToString(('F'+$digits),[Globalization.CultureInfo]::InvariantCulture)
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
        $ones = ($bits.ToCharArray() | Where-Object { $_ -eq '1' } | Measure-Object).Count
        return [string]$ones
    } catch { return '' }
}
$full = [IO.Path]::GetFullPath($Output)
$folder = [IO.Path]::GetDirectoryName($full)
if (-not [IO.Directory]::Exists($folder)) { throw "La carpeta de salida no existe: $folder" }
if ([IO.Path]::GetExtension($full) -ne '.json') { throw 'La captura debe guardarse como .json' }
Write-Host ("[RabbitMole] Destino solicitado: {0}" -f $full)
Write-Host '[RabbitMole] 2/5 · Hardware, Windows, discos e interfaces…' -ForegroundColor Cyan
$computer = @(Read-Cim 'Win32_ComputerSystem' 'Equipo') | Select-Object -First 1
$os = @(Read-Cim 'Win32_OperatingSystem' 'Sistema operativo') | Select-Object -First 1
$processor = @(Read-Cim 'Win32_Processor' 'Procesador') | Select-Object -First 1
$bios = @(Read-Cim 'Win32_BIOS' 'BIOS') | Select-Object -First 1
$disks = @(Read-Cim 'Win32_DiskDrive' 'Discos' | Select-Object -First 16)
$video = @(Read-Cim 'Win32_VideoController' 'Gráficos' | Select-Object -First 4)
$memory = @(Read-Cim 'Win32_PhysicalMemory' 'Módulos RAM' | Select-Object -First 32)

$memoryArrays = @(Read-Cim 'Win32_PhysicalMemoryArray' 'Ranuras RAM' | Select-Object -First 8)
$ramSlotCount = 0
$ramMaxGiB = ''
foreach ($bank in $memoryArrays) {
    $slots = Get-OptionalValue $bank 'MemoryDevices'
    if ($slots -and [int]$slots -gt 0) { $ramSlotCount += [int]$slots }
    $capacity = Get-OptionalValue $bank 'MaxCapacityEx'
    if (-not $capacity) { $capacity = Get-OptionalValue $bank 'MaxCapacity' }
    if ($capacity -and [double]$capacity -gt 0 -and -not $ramMaxGiB) {
        $ramMaxGiB = Invariant-Number ([double]$capacity / 1MB) 1
    }
}
$diskTechnology = ''
$diskDetails = ''
try {
    if (Get-Command Get-PhysicalDisk -ErrorAction SilentlyContinue) {
        $physical = @(Get-PhysicalDisk -ErrorAction Stop | Select-Object -First 16)
        $classes = New-Object 'System.Collections.Generic.List[string]'
        $diskSummary = New-Object 'System.Collections.Generic.List[string]'
        foreach ($drive in $physical) {
            $media = Safe-Text (Get-OptionalValue $drive 'MediaType') 35
            $bus = Safe-Text (Get-OptionalValue $drive 'BusType') 35
            if ($bus -match 'NVMe') { [void]$classes.Add('SSD M.2 NVMe') }
            elseif ($bus -match 'SATA' -and $media -match 'SSD') { [void]$classes.Add('SSD SATA') }
            elseif ($media -eq 'HDD') { [void]$classes.Add('HDD') }
            [void]$diskSummary.Add((Safe-Text (Get-OptionalValue $drive 'FriendlyName') 65)+': '+$media+', '+$bus)
        }
        $kinds = @($classes | Select-Object -Unique)
        if ($kinds.Count -eq 1) { $diskTechnology = $kinds[0] }
        elseif ($kinds.Count -gt 1) { $diskTechnology = 'Mixto' }
        $diskDetails = Safe-Text ($diskSummary -join '; ') 450
    }
} catch { Warn-Limited 'No se pudo determinar la tecnología física de todas las unidades.' }

$networkAdapters = @(Read-Cim 'Win32_NetworkAdapterConfiguration' 'Interfaces IP' |
    Where-Object { $_.IPEnabled -eq $true } | Select-Object -First 16)
$captured = (Get-Date).ToUniversalTime().ToString('o')
$accessRole = 'Estándar o limitado'
try {
    $principal = New-Object System.Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    if ($principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { $accessRole = 'Administrador (token actual)' }
} catch { Warn-Limited 'No pudo determinarse el nivel de privilegios.' }
$observedDate = (Get-Date).ToString('yyyy-MM-dd')
$hostName = Safe-Text $env:COMPUTERNAME 140
# Stable pseudonymous identifier: same machine across captures, no raw SMBIOS UUID in JSON.
$deviceId = ''
try {
    $systemUuid = @(Read-Cim 'Win32_ComputerSystemProduct' 'Identificador SMBIOS') | Select-Object -First 1
    $uuid = if ($systemUuid) { Safe-Text (Get-OptionalValue $systemUuid 'UUID') 90 } else { '' }
    $serial = if ($bios) { Safe-Text (Get-OptionalValue $bios 'SerialNumber') 140 } else { '' }
    $identity = if ($uuid -and $uuid.Length -eq 36) { $uuid }
                elseif ($serial -and $serial.Length -gt 3) { $serial }
                else { '' }
    if ($identity) {
        $material = [Text.Encoding]::UTF8.GetBytes(('RabbitMole:v1:Windows:' + $identity.Trim().ToUpperInvariant()))
        $sha = [Security.Cryptography.SHA256]::Create()
        try { $deviceId = 'RM-WIN-'+([BitConverter]::ToString($sha.ComputeHash($material))).Replace('-','').Substring(0,24) }
        finally { $sha.Dispose() }
    } else { Warn-Limited 'Identidad SMBIOS no disponible.' }
} catch { Warn-Limited 'Identificador físico no accesible.' }
$networks = New-Object 'System.Collections.Generic.List[object]'
$linkAdapters = @()
try { if (Get-Command Get-NetAdapter -ErrorAction SilentlyContinue) { $linkAdapters = @(Get-NetAdapter -ErrorAction Stop | Select-Object -First 64) } }
catch { Warn-Limited 'Velocidad y estados de adaptadores no consultables.' }
$wifiSsid = ''
$wifiRadio = ''
$wifiAuth = ''
try {
    $wifiText = (netsh.exe wlan show interfaces 2>$null) -join [Environment]::NewLine
    $ssidMatch = [regex]::Match($wifiText,'(?im)^\s*SSID\s*:\s*(.+?)\s*$')
    if ($ssidMatch.Success) { $wifiSsid = Safe-Text $ssidMatch.Groups[1].Value 80 }
    $radioMatch = [regex]::Match($wifiText,'(?im)^\s*(?:Radio type|Tipo de radio)\s*:\s*(.+?)\s*$')
    if ($radioMatch.Success) { $wifiRadio = Safe-Text $radioMatch.Groups[1].Value 45 }
    $authMatch = [regex]::Match($wifiText,'(?im)^\s*(?:Authentication|Autenticaci[oó]n)\s*:\s*(.+?)\s*$')
    if ($authMatch.Success) { $wifiAuth = Safe-Text $authMatch.Groups[1].Value 80 }
} catch { Warn-Limited 'Detalles Wi-Fi no disponibles.' }
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
    $prefix = if ($nic.IPSubnet) { To-Prefix ([string]$nic.IPSubnet[0]) } else { '' }
    $isWifi = $nic.Description -match '(?i)Wi-?Fi|Wireless|WLAN|802.11'
    $linked = @($linkAdapters | Where-Object { $_.InterfaceDescription -eq $nic.Description } | Select-Object -First 1)
    $linkSpeed = if ($linked.Count) { Safe-Text (Get-OptionalValue $linked[0] 'LinkSpeed') 40 } else { '' }
    $networkNotes = "Interfaz local; IP observada: $ip; MAC: $(Safe-Text $nic.MACAddress 60); $mode. No acredita segmentación."
    if ($linkSpeed) { $networkNotes += " Velocidad declarada: $linkSpeed." }
    if ($isWifi -and $wifiAuth) { $networkNotes += " Autenticación Wi-Fi observada: $wifiAuth (no verificada independientemente)." }
    if ($nic.DefaultIPGateway) { $gateway = Safe-Text ([string]$nic.DefaultIPGateway[0]) 80 }
    else { $gateway = '' }
    $name = Safe-Text $nic.Description 140
    if (-not $name) { $name = 'Interfaz '+$networks.Count }
    $row = [ordered]@{
        name=$name
        networkKind=$(if ($isWifi) { 'Wi-Fi' } else { 'Otra' })
        cidr=$(if ($prefix -ne '') { To-NetworkCidr $ip ([int]$prefix) } else { '' })
        ssid=$(if ($isWifi) { $wifiSsid } else { '' })
        wifiStandard=$(if ($isWifi -and $wifiRadio -match '802[.]11(?:b|g|n|ac|ax|be)') { $Matches[0] } else { '' })
        gateway=$gateway
        dns=$(if ($nic.DNSServerSearchOrder) { Safe-Text ($nic.DNSServerSearchOrder -join ", ") 240 } else { "" })
        notes=$networkNotes
    }
    [void]$networks.Add($row)
}
if (-not $networkAdapters.Count) { Warn-Limited 'No se pudo comprobar la asignación DHCP o las interfaces IP.' }
$drives = @($disks | ForEach-Object {
    $size = if ($_.Size) { ' ({0:N1} GiB)' -f ([double]$_.Size / 1GB) } else { '' }
    Safe-Text ((Safe-Text $_.Model 100)+$size) 160
} | Where-Object { $_ })
$activation = 'No comprobada'
try {
    $licenseObjects = @(Read-Cim 'SoftwareLicensingProduct' 'Activación del sistema') |
        Where-Object { $_.Name -match 'Windows' -and $_.PartialProductKey } | Select-Object -First 1
    if ($licenseObjects) {
        switch ([int]$licenseObjects.LicenseStatus) {
            1 { $activation = 'Windows informa: activado (no acredita derecho de uso)' }
            0 { $activation = 'Windows informa: no activado' }
            default { $activation = 'Windows informa: estado no confirmado o temporal' }
        }
    }
} catch { Warn-Limited 'No pudo consultarse el estado de activación de Windows.' }
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
$assetNotes = 'Captura LOCAL de solo lectura realizada con permisos del usuario actual. Activación SO: '+$activation+'. La activación no demuestra titularidad o derecho de licencia. Datos declarados por Windows: contrastar con el equipo y la evidencia; no demuestra cumplimiento, derechos de licencia, EOL ni configuraciones administrativas.'
$gpuNames = Safe-Text (($video | ForEach-Object { $_.Name }) -join '; ') 180
if ($gpuNames) { $assetNotes += ' GPU observada: '+$gpuNames+' (tipo pendiente de comprobar).' }
if ($diskDetails) { $assetNotes += ' Unidades físicas: '+$diskDetails+'.' }
if ($processor) {
    $assetNotes += (' CPU: {0} núcleos y {1} hilos declarados.' -f
        (Get-OptionalValue $processor 'NumberOfCores'),(Get-OptionalValue $processor 'NumberOfLogicalProcessors'))
}
if ($limitations.Count) { $assetNotes += ' Limitaciones: '+($limitations -join '; ') }
$asset = [ordered]@{
    id=$deviceId
    name=$hostName
    type='PC / portátil'
    vendor=$(if ($computer) { Safe-Text $computer.Manufacturer 140 } else { '' })
    model=$(if ($computer) { Safe-Text $computer.Model 140 } else { '' })
    serial=$(if ($bios) { Safe-Text $bios.SerialNumber 140 } else { '' })
    os=$(if ($os) { Safe-Text $os.Caption 180 } else { '' })
    cpu=$(if ($processor) { Safe-Text $processor.Name 160 } else { '' })
    cpuSpeed=$(if ($processor -and $processor.MaxClockSpeed) { Invariant-Number ([double]$processor.MaxClockSpeed / 1000) 2 } else { '' })
    gpuType='No verificada'
    ramSlots=$(if ($ramSlotCount -gt 0) { '{0} / {1}' -f $ramSlotCount,$memory.Count } else { '' })
    ramMax=$ramMaxGiB
    ram=$(if ($computer -and $computer.TotalPhysicalMemory) {
        '{0:N1} GiB' -f ([double]$computer.TotalPhysicalMemory / 1GB)
    } else { '' })
    storage=Safe-Text ($drives -join '; ') 600
    diskCapacity=$(if ($disks.Count) { Invariant-Number ((@($disks | Measure-Object -Property Size -Sum)[0].Sum) / 1GB) 1 } else { '' })
    diskType=$diskTechnology
    wifiAdapter=$(if (@($linkAdapters | Where-Object { $_.InterfaceDescription -match '(?i)Wi-?Fi|Wireless|WLAN|802.11' }).Count) { 'Presente' } else { 'No verificada' })
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
Write-Host '[RabbitMole] 3/5 · Programas instalados: HKLM/HKCU y ambas arquitecturas…' -ForegroundColor Cyan
$software = New-Object 'System.Collections.Generic.List[object]'
$seen = New-Object 'System.Collections.Generic.HashSet[string]' -ArgumentList ([StringComparer]::OrdinalIgnoreCase)
$rootCounts = New-Object 'System.Collections.Generic.List[string]'
$uninstallRoots = @(
    'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall',
    'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall',
    'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall',
    'HKCU:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall'
)
$limit = 480
foreach ($root in $uninstallRoots) {
    $added = 0
    $denied = 0
    try {
        $children = @(Get-ChildItem -Path $root -ErrorAction Stop)
    } catch {
        Warn-Limited ('No se pudo enumerar '+$root+': '+$_.Exception.Message)
        continue
    }
    foreach ($child in $children) {
        try {
            $app = Get-ItemProperty -LiteralPath $child.PSPath -ErrorAction Stop
        } catch {
            $denied++
            continue
        }
        $name = Safe-Text (Get-OptionalValue $app 'DisplayName') 190
        if (-not $name) { continue }
        $version = Safe-Text (Get-OptionalValue $app 'DisplayVersion') 100
        $vendor = Safe-Text (Get-OptionalValue $app 'Publisher') 150
        $key = $name+'|'+$version+'|'+$vendor
        if (-not $seen.Add($key)) { continue }
        if ($software.Count -ge $limit) { continue }
        $scope = if ($root.StartsWith('HKCU:')) { 'Usuario (HKCU)' } else { 'Equipo (HKLM)' }
        $installed = Safe-Text (Get-OptionalValue $app 'InstallDate') 30
        $details = "Instalación declarada por registro de Windows ($scope); licencia y soporte pendientes de verificar."
        if ($installed -match '^\d{8}$') {
            $details += (' Fecha declarada: '+$installed.Substring(0,4)+'-'+$installed.Substring(4,2)+'-'+$installed.Substring(6,2)+'.')
        }
        [void]$software.Add([ordered]@{
            name=$name;version=$version;vendor=$vendor;asset=$hostName
            licenseStatus='Pendiente de verificar';support='Pendiente de verificar'
            updateStatus='No verificado';notes=$details
        })
        $added++
    }
    [void]$rootCounts.Add("$root = $added programas")
    Write-Host ("  [OK] {0}: {1} nuevos; {2} claves inaccesibles" -f $root,$added,$denied)
    if ($denied) { Warn-Limited ("$root - $denied claves sin lectura; el resto sí se ha importado") }
}
Write-Host '[RabbitMole] 4/5 · Aplicaciones Microsoft Store accesibles…' -ForegroundColor Cyan
if (Get-Command Get-AppxPackage -ErrorAction SilentlyContinue) {
    try {
        $store = @(Get-AppxPackage -ErrorAction Stop | Where-Object {
            -not (Get-OptionalValue $_ 'IsFramework') -and -not (Get-OptionalValue $_ 'IsResourcePackage') -and (Get-OptionalValue $_ 'Name') -notmatch '^(Microsoft\.VCLibs|Microsoft\.NET\.Native|Microsoft\.UI\.Xaml)'
        } | Select-Object -First 150)
        $addedStore=0
        foreach ($app in $store) {
            $name = Safe-Text (Get-OptionalValue $app 'Name') 190
            $version = Safe-Text (Get-OptionalValue $app 'Version') 100
            if (-not $name -or -not $seen.Add($name+'|'+$version+'|Store')) { continue }
            if ($software.Count -ge $limit) { continue }
            [void]$software.Add([ordered]@{
                name=$name;version=$version;vendor=Safe-Text (Get-OptionalValue $app 'PublisherDisplayName') 150;asset=$hostName
                licenseStatus='Pendiente de verificar';support='Pendiente de verificar'
                updateStatus='No verificado'
                notes='Aplicación AppX/MSIX visible para usuario actual. Instalación, versión y licencia pendientes de contrastar.'
            })
            $addedStore++
        }
        Write-Host ("  [OK] Store: {0} aplicaciones adicionales" -f $addedStore)
    } catch {
        Warn-Limited ('Microsoft Store: inventario no accesible: '+$_.Exception.Message)
    }
}
if (-not $software.Count) { Warn-Limited 'No se encontraron programas en las fuentes accesibles.' }
if ($seen.Count -gt $limit) { Warn-Limited ("Se observaron $($seen.Count) programas; se limitó el JSON a $limit para respetar el importador.") }

$data = [ordered]@{
    kind='rabbitmole-discovery-v1'
    schemaVersion=1
    capturedAt=$captured
    source=[ordered]@{
        platform='Windows';collector='collect-local.ps1';scope='local';mode='read-only'
        deviceId=$deviceId
        privilege=$accessRole
        tools='PowerShell 5.1+; CIM; Registro de Windows; cmdlets disponibles'
        limitations=@($limitations)
    }
    items=[ordered]@{assets=@($asset);networks=@($networks.ToArray());software=@($software.ToArray())}
}
Write-Host "[RabbitMole] 5/5 · Serializando y validando JSON de auditoría…" -ForegroundColor Cyan
$json = ConvertTo-Json -InputObject $data -Depth 9
if ([Text.Encoding]::UTF8.GetByteCount($json) -gt 2MB) { throw "Captura mayor de 2 MiB. Reduce el inventario antes de importarla." }
$encoding = New-Object System.Text.UTF8Encoding($false)
$destination = New-CaptureTarget $full
try {
    $writer = New-Object System.IO.StreamWriter($destination.Stream,$encoding)
    try { $writer.Write($json); $writer.Flush() }
    finally { $writer.Dispose() }
} finally { $destination.Stream.Dispose() }
if ($destination.Path -ne $full) {
    Write-Host "[RabbitMole] Ya existía el archivo; se ha elegido un nombre nuevo sin sobrescribir." -ForegroundColor Yellow
}
Write-Host ("[RabbitMole] [OK] JSON local guardado en {0}" -f $destination.Path) -ForegroundColor Green
Write-Host ("Equipos: 1 | Interfaces: {0} | Aplicaciones: {1}" -f $networks.Count,$software.Count)
if ($limitations.Count) { foreach ($message in $limitations) { Write-Warning $message } }
Write-Host "[RabbitMole] Listo para importar en Nueva auditoría → Flujo automático asistido." -ForegroundColor Green
