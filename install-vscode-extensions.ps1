# Installe les extensions VSCode pour un setup Angular / NestJS
# avec une intégration Git avancée (façon WebStorm).
#
# Prérequis : la commande "code" doit être disponible dans le PATH.
# Si ce n'est pas le cas : ouvrir VSCode > Ctrl+Shift+P
# > taper "Shell Command: Install 'code' command in PATH" > Entrée.
#
# Usage : clic droit sur ce fichier > "Exécuter avec PowerShell"
# ou depuis un terminal PowerShell : .\install-vscode-extensions.ps1
#
# Si erreur "l'exécution de scripts est désactivée sur ce système",
# lancer d'abord (une seule fois, en administrateur) :
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

$ErrorActionPreference = "Stop"

if (-not (Get-Command code -ErrorAction SilentlyContinue)) {
    Write-Host "Erreur : la commande 'code' est introuvable dans le PATH." -ForegroundColor Red
    Write-Host "Ouvre VSCode, fais Ctrl+Shift+P,"
    Write-Host "puis lance 'Shell Command: Install code command in PATH'."
    exit 1
}

$extensions = @(
    # --- Git ---
    "eamodio.gitlens",                     # Blame, historique, comparaisons avancées
    "mhutchie.git-graph",                  # Visualisation graphique des branches/commits
    "donjayamanne.githistory",             # Historique de fichier / repo

    # --- Angular ---
    "Angular.ng-template",                 # Angular Language Service (officiel)

    # --- TypeScript / NestJS / Qualité de code ---
    "dbaeumer.vscode-eslint",              # Linting temps réel
    "esbenp.prettier-vscode",              # Formatage automatique
    "usernamehw.errorlens",                # Erreurs/warnings affichés inline
    "christian-kohler.path-intellisense",  # Autocomplétion des chemins d'import
    "gruntfuggly.todo-tree",               # Repérage des TODO / FIXME

    # --- Confort général ---
    "editorconfig.editorconfig"            # Respect des conventions .editorconfig du projet
)

Write-Host "Installation de $($extensions.Count) extensions..." -ForegroundColor Cyan
Write-Host ""

foreach ($ext in $extensions) {
    Write-Host "-> $ext"
    code --install-extension $ext --force
}

Write-Host ""
Write-Host "Terminé. Redémarre VSCode pour que toutes les extensions soient actives." -ForegroundColor Green