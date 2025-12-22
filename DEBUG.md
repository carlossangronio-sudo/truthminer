# Guide de débogage TruthMiner

## Problème : Site cassé en local (emojis géants)

### Solution immédiate
```powershell
# 1. Arrêter le serveur (Ctrl+C)
# 2. Nettoyer le cache
Remove-Item -Recurse -Force .next
# 3. Relancer
npm run dev
```

### Si le problème persiste
1. Vider le cache du navigateur (Ctrl+Shift+Delete)
2. Faire un hard refresh (Ctrl+Shift+R)
3. Vérifier la console du navigateur (F12) pour les erreurs

## Problème : Générateur ne marche pas en production

### Vérifications à faire sur Vercel

1. **Variables d'environnement** :
   - Va dans Settings > Environment Variables
   - Vérifie que ces variables sont présentes :
     - `SERPER_API_KEY`
     - `OPENAI_API_KEY`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Logs Vercel** :
   - Va dans l'onglet "Logs" de ton déploiement
   - Cherche les erreurs liées à :
     - "SERPER_API_KEY is not defined"
     - "OPENAI_API_KEY is not defined"
     - Erreurs Supabase

3. **Test de l'API** :
   - Ouvre la console du navigateur (F12)
   - Va dans l'onglet "Network"
   - Lance une recherche
   - Clique sur la requête `/api/generate-report`
   - Regarde la réponse : elle devrait contenir `success: true` ou un message d'erreur détaillé

### Messages d'erreur courants

- **"Clé API Serper manquante ou invalide"** → Vérifie `SERPER_API_KEY` sur Vercel
- **"Clé API OpenAI manquante ou invalide"** → Vérifie `OPENAI_API_KEY` sur Vercel
- **"Erreur de connexion à la base de données"** → Vérifie les clés Supabase
- **"Aucune discussion Reddit trouvée"** → Le mot-clé ne retourne pas de résultats Reddit

### Redéploiement après correction

Après avoir mis à jour les variables d'environnement sur Vercel :
1. Va dans l'onglet "Deployments"
2. Clique sur les 3 points du dernier déploiement
3. Sélectionne "Redeploy"






