# Guide de Test - Recherche d'Images

## Problème
Les images ne s'affichent pas sur le site, même après génération d'un rapport.

## Solution
J'ai amélioré la fonction `searchImage` dans `lib/services/serper.ts` avec :
- **Logs détaillés** : Chaque étape est maintenant loggée dans la console
- **Gestion de multiples structures** : Support de `images`, `imageResults`, `organic`, et autres
- **Extraction d'URL améliorée** : Test de 10+ champs possibles pour trouver l'URL
- **Validation stricte** : Filtrage des URLs invalides (redirections Google, base64, etc.)

## Comment Tester

### 1. Tester l'API directement
Ouvre dans ton navigateur ou avec curl :
```
http://localhost:3000/api/test-serper-image?q=iPhone%2015
```

Cela va tester la recherche d'image pour "iPhone 15" et retourner l'URL trouvée.

### 2. Générer un nouveau rapport
1. Va sur http://localhost:3000
2. Recherche un produit (ex: "Meilleure souris gaming")
3. Ouvre la console du navigateur (F12) et regarde les logs
4. Regarde aussi les logs du serveur dans le terminal où `npm run dev` tourne

### 3. Vérifier les logs
Dans la console du serveur, tu devrais voir :
- `[Serper] 🔍 Recherche d'image pour: ...`
- `[Serper] 📦 Structure complète de la réponse: ...`
- `[Serper] 🔑 Clés de la réponse: ...`
- `[Serper] ✅ Images trouvées dans ...`
- `[Serper] 🖼️ URL extraite pour l'image X: ...`
- `[Serper] ✅ Image valide trouvée: ...`

## Si ça ne marche toujours pas

1. **Vérifie la clé API Serper** : Assure-toi que `SERPER_API_KEY` est bien dans `.env.local`
2. **Vérifie les logs** : Regarde exactement ce que Serper retourne dans les logs
3. **Teste avec l'API de test** : Utilise `/api/test-serper-image?q=PRODUIT` pour isoler le problème
4. **Vérifie Supabase** : Assure-toi que `image_url` est bien sauvegardé dans la table `reports`

## Prochaines étapes
Si les logs montrent que Serper retourne bien des images mais qu'elles ne s'affichent pas :
- Vérifie que `imageUrl` est bien passé au composant `ArticleCard`
- Vérifie que l'image est bien sauvegardée dans Supabase
- Vérifie les erreurs CORS ou de chargement d'image dans la console du navigateur






