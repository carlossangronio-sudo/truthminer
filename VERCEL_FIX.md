# Fix Vercel - Checklist Rapide

## ✅ Checklist de vérification

### 1. Variables d'environnement sur Vercel

Va sur https://vercel.com → Ton projet → Settings → Environment Variables

**Vérifie que ces variables existent ET sont activées pour Production :**

- [ ] `SERPER_API_KEY` (sans `NEXT_PUBLIC_`)
- [ ] `OPENAI_API_KEY` (sans `NEXT_PUBLIC_`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL` (optionnel)

### 2. Test rapide des routes API

Ouvre ton terminal et teste :

```bash
# Test 1 : Route de recherche d'image
curl "https://tminer.io/api/search-image?q=test"

# Si ça retourne une erreur, copie-colle la réponse complète
```

### 3. Vérifier les logs Vercel

1. Va dans **Deployments** → Dernier déploiement → **Logs**
2. Cherche les erreurs qui commencent par :
   - `[API]`
   - `[Serper]`
   - `SERPER_API_KEY`
   - `Error`

### 4. Redéployer après correction

Après avoir ajouté/modifié des variables :
1. **Deployments** → 3 points → **Redeploy**
2. Attends la fin
3. Teste à nouveau

## 🔍 Diagnostic rapide

**Si les images ne se chargent pas :**

1. Ouvre la console du navigateur (F12)
2. Regarde les erreurs dans l'onglet **Console**
3. Va dans l'onglet **Network**
4. Cherche la requête `/api/search-image`
5. Clique dessus et regarde la **Response**

**Si tu vois :**
- `"SERPER_API_KEY is not defined"` → Ajoute la variable sur Vercel
- `"CORS error"` → Problème de configuration Vercel
- `"Timeout"` → Vercel Hobby a une limite de 10s (upgrade nécessaire)
- `404` → Route API introuvable (vérifie le déploiement)

## 📞 Besoin d'aide ?

Copie-colle :
1. Le message d'erreur exact de la console
2. La réponse de la requête `/api/search-image` (onglet Network)
3. Les logs Vercel (dernières lignes avec erreurs)






