# Guide : Corriger l'erreur -102 (Connexion refusée)

## Erreur -102 : Qu'est-ce que c'est ?

L'erreur -102 (ERR_CONNECTION_REFUSED) signifie que le navigateur ne peut pas se connecter au serveur. Cela peut arriver si :

1. Le serveur de développement n'est pas lancé
2. Le serveur est en train de démarrer (attendre quelques secondes)
3. Le port 3000 est utilisé par un autre processus
4. Il y a un problème de firewall

## Solutions

### Solution 1 : Vérifier que le serveur est lancé

Dans le terminal où tu as lancé `npm run dev`, tu devrais voir :
```
✓ Ready in X ms
○ Local: http://localhost:3000
```

Si tu ne vois pas ce message, le serveur n'est pas lancé.

### Solution 2 : Attendre que le serveur démarre

Quand tu lances `npm run dev`, il faut attendre 10-30 secondes pour que le serveur soit prêt. Ne ferme pas le terminal pendant ce temps.

### Solution 3 : Vérifier le port 3000

Si le port 3000 est utilisé par un autre processus :

```powershell
# Voir quel processus utilise le port 3000
netstat -ano | findstr :3000

# Si un processus utilise le port, tu peux le tuer (remplace PID par le numéro du processus)
taskkill /PID <PID> /F
```

### Solution 4 : Changer le port

Si le port 3000 est bloqué, tu peux utiliser un autre port :

```powershell
# Lancer sur le port 3001
$env:PORT=3001; npm run dev
```

Puis ouvre `http://localhost:3001`

### Solution 5 : Vérifier le firewall

Parfois Windows Firewall bloque les connexions locales. Vérifie que Node.js est autorisé dans le firewall.

### Solution 6 : Nettoyer complètement et relancer

```powershell
# Arrêter tous les processus Node.js
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Nettoyer le cache
Remove-Item -Recurse -Force .next

# Relancer
npm run dev
```

## Vérification rapide

1. Le terminal montre-t-il "Ready" ?
2. Le port 3000 est-il libre ? (`netstat -ano | findstr :3000`)
3. As-tu attendu assez longtemps (10-30 secondes) après avoir lancé `npm run dev` ?
4. As-tu essayé un hard refresh dans le navigateur ? (`Ctrl + Shift + R`)






