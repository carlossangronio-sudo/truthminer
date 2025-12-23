# Guide : Affichage des Images

## Problème : Les images ne s'affichent pas

### Causes possibles :

1. **La colonne `image_url` n'existe pas dans Supabase**
   - Solution : Exécuter le script SQL `supabase-migration-add-image-url.sql` dans le SQL Editor de Supabase

2. **Les rapports existants n'ont pas d'images**
   - Les rapports créés avant l'ajout de cette fonctionnalité n'ont pas d'images
   - Solution : Générer un **nouveau rapport** pour voir les images apparaître

3. **La recherche d'images via Serper ne fonctionne pas**
   - Vérifier les logs dans la console du serveur
   - Les erreurs sont non-bloquantes : une image placeholder sera utilisée

## Comment tester :

### 1. Vérifier que la colonne existe dans Supabase

1. Aller dans ton projet Supabase
2. Ouvrir le SQL Editor
3. Exécuter le contenu de `supabase-migration-add-image-url.sql` :
   ```sql
   DO $$ BEGIN
       ALTER TABLE reports ADD COLUMN image_url TEXT;
   EXCEPTION
       WHEN duplicate_column THEN RAISE NOTICE 'column image_url already exists in reports.';
   END $$;
   ```

### 2. Générer un nouveau rapport

1. Aller sur http://localhost:3000
2. Rechercher un produit (ex: "Meilleure souris gaming")
3. Attendre la génération du rapport
4. Vérifier que l'image apparaît :
   - Sur la page du rapport (image principale en haut)
   - Sur les cartes dans les catégories
   - Sur la page /explore

### 3. Vérifier les logs

Ouvre la console du serveur (terminal où `npm run dev` tourne) et cherche :
- `[API] Recherche d'image pour: ...`
- `[API] Image trouvée: ...`
- `[Serper] Image trouvée: ...`

### 4. Si les images ne s'affichent toujours pas

1. **Vérifier la console du navigateur** (F12) :
   - Chercher les erreurs de chargement d'images
   - Vérifier que les URLs d'images sont valides

2. **Vérifier que les images sont bien sauvegardées** :
   - Aller dans Supabase → Table `reports`
   - Vérifier qu'une colonne `image_url` existe
   - Vérifier qu'un rapport récent a une valeur dans `image_url`

3. **Tester avec un placeholder** :
   - Les composants affichent maintenant un placeholder (icône) si pas d'image
   - Si tu vois l'icône, c'est que le système fonctionne mais qu'il n'y a pas d'image

## Notes importantes :

- **Les anciens rapports** n'auront pas d'images jusqu'à ce qu'ils soient régénérés
- **Les placeholders** s'affichent maintenant même si pas d'image (icône de photo)
- **Les logs** sont ajoutés pour faciliter le débogage







