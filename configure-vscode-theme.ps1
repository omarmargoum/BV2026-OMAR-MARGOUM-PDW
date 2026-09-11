param(
    [string]$WorkspacePath = (Get-Location).Path,
    [switch]$NoLaunch
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== HOOS / VS Code - Vitesse Light setup ===" -ForegroundColor Cyan
Write-Host ""

$codeCommand = Get-Command code -ErrorAction SilentlyContinue
if (-not $codeCommand) {
    throw @"
The 'code' command was not found in PATH.

In VS Code:
  Ctrl+Shift+P
  -> search for: Shell Command / Install 'code' command in PATH

On Windows, you can also re-run the VS Code installer and enable:
  'Add to PATH'

Then restart PowerShell and run this script again.
"@
}

$workspace = (Resolve-Path $WorkspacePath).Path
$workspaceFile = Join-Path $workspace "hoos-vitesse.code-workspace"

Write-Host "Workspace: $workspace" -ForegroundColor DarkGray

$extensions = @(
    "antfu.theme-vitesse",
    "PKief.material-icon-theme",
    "PKief.material-product-icons"
)

Write-Host ""
Write-Host "Installing VS Code extensions..." -ForegroundColor Yellow

foreach ($extension in $extensions) {
    Write-Host "  -> $extension"
    & code --install-extension $extension --force | Out-Host

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install VS Code extension: $extension"
    }
}

$workspaceConfig = @{
    folders = @(
        @{
            path = "."
        }
    )

    settings = [ordered]@{
        "workbench.colorTheme" = "Vitesse Light"
        "workbench.iconTheme" = "material-icon-theme"
        "workbench.productIconTheme" = "material-product-icons"

        "workbench.activityBar.location" = "top"
        "window.commandCenter" = $true
        "workbench.startupEditor" = "none"
        "workbench.tree.indent" = 16
        "workbench.list.smoothScrolling" = $true
        "explorer.compactFolders" = $false
        "breadcrumbs.enabled" = $true

        "material-icon-theme.folders.theme" = "specific"
        "material-icon-theme.opacity" = 0.95
        "material-icon-theme.saturation" = 0.85

        "editor.fontFamily" = "'JetBrains Mono', 'Cascadia Code', Consolas, 'Courier New', monospace"
        "editor.fontLigatures" = $true
        "editor.fontSize" = 14
        "editor.lineHeight" = 22
        "editor.letterSpacing" = 0.2
        "editor.padding.top" = 10
        "editor.padding.bottom" = 10

        "editor.semanticHighlighting.enabled" = $true
        "editor.minimap.enabled" = $false
        "editor.stickyScroll.enabled" = $true
        "editor.renderWhitespace" = "selection"
        "editor.scrollBeyondLastLine" = $false
        "editor.smoothScrolling" = $true
        "editor.cursorSmoothCaretAnimation" = "on"
        "editor.cursorBlinking" = "smooth"

        "editor.bracketPairColorization.enabled" = $true
        "editor.guides.bracketPairs" = "active"
        "editor.guides.bracketPairsHorizontal" = "active"
        "editor.guides.indentation" = $true
        "editor.guides.highlightActiveIndentation" = $true

        "terminal.integrated.fontFamily" = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace"
        "terminal.integrated.fontSize" = 13

        "files.eol" = "`n"
        "files.insertFinalNewline" = $true
        "files.trimTrailingWhitespace" = $true
    }

    extensions = @{
        recommendations = $extensions
    }
}

$json = $workspaceConfig | ConvertTo-Json -Depth 10
Set-Content -Path $workspaceFile -Value $json -Encoding UTF8

Write-Host ""
Write-Host "Created:" -ForegroundColor Green
Write-Host "  $workspaceFile"
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Theme         : Vitesse Light"
Write-Host "  File icons    : Material Icon Theme"
Write-Host "  Product icons : Material Product Icons"
Write-Host "  Activity Bar  : Top"
Write-Host "  Brackets      : Colorized + active guides"
Write-Host "  Minimap       : Disabled"
Write-Host "  Font          : JetBrains Mono (with fallbacks)"
Write-Host ""

if (-not $NoLaunch) {
    Write-Host "Opening the configured workspace..." -ForegroundColor Cyan
    & code $workspaceFile
}

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host ""
Write-Host "Tip: if JetBrains Mono is not installed, VS Code will automatically use Cascadia Code/Consolas."
