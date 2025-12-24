# Guide de réparation - Site cassé en local

## Étapes de dépannage

### 1. Nettoyer complètement le cache
```powershell
# Arrêter tous les processus Node.js
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Supprimer le cache Next.js
Remove-Item -Recurse -Force .next

# Supprimer le cache npm (optionnel)
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
```

### 2. Réinstaller les dépendances (si nécessaire)
```powershell
npm install
```

### 3. Relancer le serveur
```powershell
npm run dev
```

### 4. Vérifier dans le navigateur
1. Ouvre `http://localhost:3000`
2. Fais un **hard refresh** : `Ctrl + Shift + R` (ou `Ctrl + F5`)
3. Ouvre la console du navigateur (F12) et regarde les erreurs

### 5. Si le problème persiste

#### Vérifier les erreurs dans la console
- Ouvre la console (F12)
- Regarde l'onglet "Console" pour les erreurs JavaScript
- Regarde l'onglet "Network" pour les requêtes qui échouent

#### Vérifier les erreurs dans le terminal
- Regarde le terminal où tourne `npm run dev`
- Cherche les messages d'erreur en rouge

#### Vérifier les variables d'environnement
- Assure-toi que le fichier `.env.local` existe
- Vérifie que les clés API sont présentes :
  - `SERPER_API_KEY`
  - `OPENAI_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 6. Erreurs courantes et solutions

#### "Module not found"
```powershell
npm install
```

#### "Cannot read property of undefined"
- Vérifie la console du navigateur pour voir quelle propriété est undefined
- Peut être lié à un état React non initialisé

#### "Hydration error"
- Fais un hard refresh du navigateur
- Vérifie que le serveur de développement est bien relancé

#### Écran blanc / Site ne charge pas
- Vérifie la console du navigateur (F12)
- Vérifie le terminal du serveur
- Assure-toi que le port 3000 n'est pas utilisé par un autre processus

### 7. Solution de dernier recours
```powershell
# Arrêter tout
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Nettoyer complètement
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules

# Réinstaller
npm install

# Relancer
npm run dev
```








