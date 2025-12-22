# Guide de débogage Vercel - Images et Fallback

## Problème : Ça marche en local mais pas sur Vercel

### 1. Vérifier les variables d'environnement sur Vercel

**Obligatoires :**
- `SERPER_API_KEY` (sans `NEXT_PUBLIC_`)
- `OPENAI_API_KEY` (sans `NEXT_PUBLIC_`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (optionnel mais recommandé)

**Optionnelles :**
- `ADMIN_SECRET_KEY` (par défaut: `truthminer-admin-2024`)

**Comment vérifier :**
1. Va sur https://vercel.com
2. Sélectionne ton projet `tminer`
3. Va dans **Settings** → **Environment Variables**
4. Vérifie que toutes les variables sont présentes
5. **Important** : Assure-toi qu'elles sont activées pour **Production**, **Preview**, et **Development**

### 2. Vérifier les logs Vercel

1. Va dans l'onglet **Deployments**
2. Clique sur le dernier déploiement
3. Va dans l'onglet **Logs**
4. Cherche les erreurs :
   - `SERPER_API_KEY is not defined`
   - `OPENAI_API_KEY is not defined`
   - `Supabase connection error`
   - `CORS error`
   - `Timeout`

### 3. Tester les routes API directement

**Test de la recherche d'image (fallback) :**
```bash
curl "https://tminer.io/api/search-image?q=iPhone%2015"
```

**Test de la génération de rapport :**
```bash
curl -X POST "https://tminer.io/api/generate-report" \
  -H "Content-Type: application/json" \
  -d '{"keyword":"iPhone 15"}'
```

### 4. Vérifier la console du navigateur

1. Ouvre https://tminer.io
2. Appuie sur F12 pour ouvrir les DevTools
3. Va dans l'onglet **Console**
4. Lance une recherche
5. Regarde les erreurs :
   - `Failed to fetch` → Problème réseau ou CORS
   - `404 Not Found` → Route API introuvable
   - `500 Internal Server Error` → Erreur serveur (voir logs Vercel)

### 5. Vérifier l'onglet Network

1. Dans les DevTools, va dans l'onglet **Network**
2. Lance une recherche
3. Cherche la requête `/api/search-image` ou `/api/generate-report`
4. Clique dessus et regarde :
   - **Status** : Doit être `200` (pas `404`, `500`, etc.)
   - **Response** : Doit contenir `success: true` ou un message d'erreur clair

### 6. Problèmes courants et solutions

#### Problème : "SERPER_API_KEY is not defined"
**Solution :**
- Vérifie que `SERPER_API_KEY` est bien dans Vercel (sans `NEXT_PUBLIC_`)
- Redéploie après avoir ajouté la variable

#### Problème : Images ne se chargent pas (fallback)
**Causes possibles :**
- Route `/api/search-image` retourne une erreur
- Timeout de Serper (15 secondes)
- Rate limit de Serper

**Solution :**
- Vérifie les logs Vercel pour voir l'erreur exacte
- Teste la route directement avec curl (voir étape 3)

#### Problème : CORS ou erreurs réseau
**Solution :**
- Vérifie que les routes API sont bien accessibles
- Vérifie que `NEXT_PUBLIC_SITE_URL` est bien configuré

#### Problème : Timeout
**Solution :**
- Vercel a une limite de 10 secondes pour les fonctions serverless (Hobby)
- Les recherches d'images peuvent prendre jusqu'à 15 secondes
- **Solution** : Augmenter le timeout ou utiliser Vercel Pro

### 7. Redéploiement après correction

Après avoir corrigé les variables d'environnement :
1. Va dans **Deployments**
2. Clique sur les 3 points du dernier déploiement
3. Sélectionne **Redeploy**
4. Attends la fin du déploiement
5. Teste à nouveau

### 8. Test rapide

Pour tester rapidement si tout fonctionne :

```bash
# Test 1 : Recherche d'image
curl "https://tminer.io/api/search-image?q=iPhone%2015"

# Test 2 : Génération de rapport (peut prendre 30-60 secondes)
curl -X POST "https://tminer.io/api/generate-report" \
  -H "Content-Type: application/json" \
  -d '{"keyword":"iPhone 15"}' \
  --max-time 120
```

Si ces commandes retournent des erreurs, copie-colle la réponse complète pour diagnostiquer.





