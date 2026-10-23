# RabbitMole — instalador offline Windows, PowerShell 5.1+ / 7+.
[CmdletBinding()]
param(
    [string]$OutputDirectory = (Join-Path $env:LOCALAPPDATA 'RabbitMole'),
    [string]$Ref = 'main',
    [string]$Repository = 'sempitern0/RabbitMole',
    [switch]$Update,
    [switch]$NoOpen
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ($Repository -notmatch '^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$') { throw 'Repositorio inválido (owner/repo).' }
if ($Ref -notmatch '^[A-Za-z0-9._/-]+$' -or $Ref.Contains('..') -or $Ref.StartsWith('//')) { throw 'Referencia Git inválida.' }
$files = @(
    'index.html','css/normalize.css','css/styles.css','css/brand-motion.css','css/team.css','css/contrast.css','css/relations.css','css/templates.css','css/quality.css','css/retest.css','css/comparison.css','css/glossary.css','css/print.css','css/atkinson.css','css/workspace-ux.css','css/form-system.css',
    'js/audit-workflow-views.js','js/audit-actions.js','js/android-touch.js','js/audit-record-navigation.js','js/ui-layout.js','js/audit-field-renderer.js','js/audit-field-defaults.js','js/audit-rack.js','js/audit-server-install.js','js/audit-infrastructure-quality.js','js/audit-inventory-presets.js','js/audit-report-data.js','js/audit-report-infrastructure.js','css/android-touch.css','css/layout-collapse.css','css/photo-hints.css',
    'js/audit-start.js','js/app-definitions.js','js/app-team.js','js/app-model.js','js/palette-preferences.js','js/app.js','js/deployment-profile.js','js/app-version.js','js/audit-storage.js','js/audit-import-plan.js','js/audit-relations.js','js/audit-evidence-images.js','js/audit-attachment-library.js','js/audit-identifiers.js','js/control-templates.js','js/field-assist.js','js/audit-quality.js','js/audit-retest.js','js/audit-mitigation.js','js/audit-comparison.js','js/hardware-catalog.js','js/router-catalog.js','js/software-catalog.js','js/online-lookups.js','js/os-catalog.js','js/glossary-terms.js','js/glossary-guides.js','js/glossary.js','js/inventory-import.js','js/input-guidance.js','js/secure-transfer.js','js/backup-workflow.js','js/secure-transfer-ui.js','js/document-control.js','js/pdf-appendices.js','js/external-network-analysis.js','js/network-overview.js','js/pwa-updates.js','js/pwa-install.js','js/discovery-bridge.js','js/offline-health.js','js/camera-capture.js','js/photo-code-hints.js','js/exporters.js','sw.js','manifest.webmanifest','collect-local.sh','collect-local.ps1','discovery/discover.py','discovery/service.py','discovery/inventory.py','discovery/wizard.py','discovery/native.ps1','discovery/iniciar.cmd','discovery/run.sh','discovery/run.ps1','discovery/setup.sh','discovery/setup.ps1','discovery/README_ES.md',
    'fonts/AtkinsonHyperlegible-Regular.woff2','fonts/AtkinsonHyperlegible-Bold.woff2',
    'fonts/AtkinsonHyperlegible-Italic.woff2','fonts/AtkinsonHyperlegible-BoldItalic.woff2',
    'icons/os-windows.svg','icons/os-linux.svg','icons/os-macos.svg','icons/app.png','icons/icon-192.png','icons/icon-512.png'
)
$source = if ($PSScriptRoot) { $PSScriptRoot } else { $null }
$required = $Update.IsPresent
foreach ($name in $files) {
    $path = Join-Path $OutputDirectory $name
    if (-not (Test-Path -LiteralPath $path -PathType Leaf) -or (Get-Item -LiteralPath $path).Length -eq 0) { $required = $true }
}
if ($required) {
    New-Item -Path $OutputDirectory -ItemType Directory -Force | Out-Null
    $stage = Join-Path $OutputDirectory ('.staging-' + [guid]::NewGuid().ToString('N'))
    New-Item -Path $stage -ItemType Directory -Force | Out-Null
    try {
        foreach ($name in $files) {
            $sourceFile = if ($source) { Join-Path $source $name } else { $null }
            $stagedFile = Join-Path $stage $name
            $parent = Split-Path -Parent $stagedFile
            if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
            if ($source -and (Test-Path -LiteralPath $sourceFile -PathType Leaf)) {
                Copy-Item -LiteralPath $sourceFile -Destination $stagedFile
            } else {
                $url = "https://raw.githubusercontent.com/$Repository/$Ref/$name"
                Invoke-WebRequest -Uri $url -OutFile $stagedFile -UseBasicParsing -TimeoutSec 90 | Out-Null
            }
            if (-not (Test-Path -LiteralPath $stagedFile -PathType Leaf) -or (Get-Item -LiteralPath $stagedFile).Length -eq 0) {
                throw "Archivo vacío: $name"
            }
        }
        if (-not (Select-String -LiteralPath (Join-Path $stage 'index.html') -Pattern 'RabbitMole' -SimpleMatch -Quiet) -or
            -not (Select-String -LiteralPath (Join-Path $stage 'js/audit-relations.js') -Pattern 'AuditRelations' -SimpleMatch -Quiet)) {
            throw 'Los archivos no corresponden con RabbitMole.'
        }
        foreach ($name in $files) {
            $parent = Split-Path -Parent (Join-Path $OutputDirectory $name)
            if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
            Move-Item -LiteralPath (Join-Path $stage $name) -Destination (Join-Path $OutputDirectory $name) -Force
        }
        Write-Host "[OK] Aplicación instalada en: $OutputDirectory"
    } finally {
        Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue
    }
}
$index = Join-Path $OutputDirectory 'index.html'
Write-Host "[OK] Archivo local: $index"
Write-Host 'Expedientes: en el navegador. Exporta copias JSON y conserva los originales de evidencias.'
if (-not $NoOpen) { Start-Process -FilePath $index }
