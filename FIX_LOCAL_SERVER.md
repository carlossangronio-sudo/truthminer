# Fix : Site en local ne fonctionne pas

## Actions effectuées

1. ✅ **Nettoyage du cache Next.js** : Suppression du dossier `.next`
2. ✅ **Arrêt des processus Node.js** : Arrêt de tous les processus Node.js en cours
3. ✅ **Correction de l'import** : Remplacement de l'import dynamique par un import statique de `updateReportImage`
4. ✅ **Redémarrage du serveur** : `npm run dev`

## Vérifications

### 1. Vérifier que le serveur démarre

Ouvre ton terminal et vérifie que tu vois :
```
✓ Ready in X seconds
○ Local:        http://localhost:3000
```

### 2. Si le serveur ne démarre pas

**Erreur de compilation TypeScript :**
```powershell
# Nettoyer et réinstaller
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

**Erreur de port déjà utilisé :**
```powershell
# Trouver le processus qui utilise le port 3000
netstat -ano | findstr :3000
# Tuer le processus (remplace PID par le numéro trouvé)
taskkill /PID <PID> /F
# Redémarrer
npm run dev
```

**Erreur de variables d'environnement :**
- Vérifie que le fichier `.env` existe à la racine
- Vérifie qu'il contient toutes les variables nécessaires (voir `env.example`)

### 3. Si le site se charge mais ne fonctionne pas

**Ouvre la console du navigateur (F12) :**
- Regarde les erreurs dans l'onglet **Console**
- Regarde les requêtes dans l'onglet **Network**

**Erreurs courantes :**
- `SERPER_API_KEY is not defined` → Vérifie `.env`
- `Supabase connection error` → Vérifie `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `404 Not Found` → Vérifie que les routes API existent

## Commandes de diagnostic

```powershell
# Vérifier les processus Node.js
Get-Process -Name node -ErrorAction SilentlyContinue

# Vérifier le port 3000
netstat -ano | findstr :3000

# Nettoyer complètement
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

## Prochaines étapes

1. Ouvre http://localhost:3000 dans ton navigateur
2. Si ça ne fonctionne toujours pas, copie-colle :
   - Le message d'erreur exact du terminal
   - Les erreurs de la console du navigateur (F12)
   - Les dernières lignes des logs du serveur






