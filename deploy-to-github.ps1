# Script de déploiement vers GitHub pour TruthMiner
# Usage: .\deploy-to-github.ps1 -GitHubUsername "VOTRE_PSEUDO"

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername
)

$repoUrl = "https://github.com/$GitHubUsername/tminer.git"

Write-Host "=== Déploiement TruthMiner vers GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Git est installé
try {
    $gitVersion = git --version
    Write-Host "✓ Git détecté: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer Git depuis https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Vérifier si le dépôt est déjà initialisé
if (Test-Path .git) {
    Write-Host "✓ Dépôt Git déjà initialisé" -ForegroundColor Green
} else {
    Write-Host "Initialisation du dépôt Git..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Dépôt initialisé" -ForegroundColor Green
}

# Vérifier si le remote existe déjà
$remoteExists = git remote -v | Select-String "origin"
if ($remoteExists) {
    Write-Host "✓ Remote 'origin' existe déjà" -ForegroundColor Green
    Write-Host "Mise à jour de l'URL du remote..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
} else {
    Write-Host "Ajout du remote GitHub..." -ForegroundColor Yellow
    git remote add origin $repoUrl
    Write-Host "✓ Remote ajouté" -ForegroundColor Green
}

# Ajouter tous les fichiers
Write-Host "Ajout des fichiers au suivi Git..." -ForegroundColor Yellow
git add .
Write-Host "✓ Fichiers ajoutés" -ForegroundColor Green

# Vérifier s'il y a des changements à committer
$status = git status --porcelain
if ($status) {
    Write-Host "Création du commit initial..." -ForegroundColor Yellow
    git commit -m "Initial commit TruthMiner"
    Write-Host "✓ Commit créé" -ForegroundColor Green
} else {
    Write-Host "Aucun changement à committer" -ForegroundColor Yellow
}

# Vérifier la branche actuelle
$currentBranch = git branch --show-current
if (-not $currentBranch) {
    Write-Host "Création de la branche 'main'..." -ForegroundColor Yellow
    git branch -M main
    $currentBranch = "main"
}

# Push vers GitHub
Write-Host "Envoi du code vers GitHub ($repoUrl)..." -ForegroundColor Yellow
Write-Host "Branche: $currentBranch" -ForegroundColor Cyan

try {
    git push -u origin $currentBranch
    Write-Host ""
    Write-Host "=== ✓ DÉPLOIEMENT RÉUSSI ===" -ForegroundColor Green
    Write-Host "Votre code est maintenant disponible sur: $repoUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "1. Allez sur https://vercel.com" -ForegroundColor White
    Write-Host "2. Importez votre projet depuis GitHub" -ForegroundColor White
    Write-Host "3. Configurez les variables d'environnement:" -ForegroundColor White
    Write-Host "   - SERPER_API_KEY" -ForegroundColor Gray
    Write-Host "   - OPENAI_API_KEY" -ForegroundColor Gray
    Write-Host "   - NEXT_PUBLIC_SITE_URL=https://tminer.io" -ForegroundColor Gray
} catch {
    Write-Host ""
    Write-Host "✗ Erreur lors du push" -ForegroundColor Red
    Write-Host "Vérifiez que:" -ForegroundColor Yellow
    Write-Host "1. Le dépôt GitHub existe: $repoUrl" -ForegroundColor White
    Write-Host "2. Vous avez les droits d'écriture" -ForegroundColor White
    Write-Host "3. Vous êtes authentifié (git config --global user.name et user.email)" -ForegroundColor White
    exit 1
}


