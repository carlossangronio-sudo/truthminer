# Guide de Déploiement - TruthMiner

## Prérequis

1. **Git installé** : Téléchargez depuis https://git-scm.com/download/win
2. **Compte GitHub** : Créez un compte sur https://github.com
3. **Dépôt GitHub créé** : Créez un nouveau dépôt nommé `tminer` sur GitHub

## Déploiement Automatique (Recommandé)

### Option 1 : Script PowerShell

1. Ouvrez PowerShell dans le dossier du projet
2. Exécutez le script avec votre pseudo GitHub :

```powershell
.\deploy-to-github.ps1 -GitHubUsername "VOTRE_PSEUDO_GITHUB"
```

Remplacez `VOTRE_PSEUDO_GITHUB` par votre vrai pseudo GitHub.

### Option 2 : Commandes Manuelles

Si vous préférez faire les étapes manuellement :

```bash
# 1. Initialiser Git (si pas déjà fait)
git init

# 2. Ajouter tous les fichiers
git add .

# 3. Créer le commit initial
git commit -m "Initial commit TruthMiner"

# 4. Renommer la branche en main (si nécessaire)
git branch -M main

# 5. Ajouter le remote GitHub (remplacez VOTRE_PSEUDO)
git remote add origin https://github.com/VOTRE_PSEUDO/tminer.git

# 6. Push vers GitHub
git push -u origin main
```

## Configuration Git (Première fois)

Si c'est votre première utilisation de Git, configurez votre identité :

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

## Déploiement sur Vercel

Une fois le code sur GitHub :

1. **Allez sur https://vercel.com**
2. **Connectez votre compte GitHub**
3. **Importez le projet** `tminer`
4. **Configurez les variables d'environnement** :
   - `SERPER_API_KEY` : Votre clé Serper.dev
   - `OPENAI_API_KEY` : Votre clé OpenAI
   - `NEXT_PUBLIC_SITE_URL` : `https://tminer.io`
   - `NEXT_PUBLIC_AMAZON_AFFILIATE_ID` : (optionnel)

5. **Déployez !** Vercel détectera automatiquement Next.js et déploiera votre application.

## Vérification

Après le déploiement, votre application sera accessible sur :
- **Vercel** : `https://tminer-xxx.vercel.app` (URL temporaire)
- **Votre domaine** : `https://tminer.io` (après configuration du domaine dans Vercel)

## Fichiers Créés

- ✅ `vercel.json` : Configuration optimisée pour Vercel
- ✅ `.gitignore` : Exclut les fichiers sensibles (`.env`, `node_modules`, etc.)
- ✅ `public/robots.txt` : Autorise l'indexation Google

## Notes Importantes

- ⚠️ Le fichier `.env` est dans `.gitignore` et ne sera **PAS** envoyé sur GitHub
- ✅ Configurez les variables d'environnement directement dans Vercel
- ✅ Le fichier `env.example` sert de template pour les autres développeurs


