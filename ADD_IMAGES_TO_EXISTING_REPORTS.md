# Guide : Ajouter des images aux analyses existantes

## Problème
Les analyses déjà disponibles n'ont pas d'images car elles ont été créées avant l'ajout de cette fonctionnalité.

## Solution
Une route API admin permet d'ajouter automatiquement des images à tous les rapports existants qui n'en ont pas.

## Comment utiliser

### Option 1 : En local (développement)

Assure-toi que ton serveur de développement est lancé (`npm run dev`).

```powershell
$headers = @{
    "Authorization" = "Bearer truthminer-admin-2024" # Remplace par ta clé si personnalisée
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/admin/add-images-to-reports" -Method POST -Headers $headers
```

### Option 2 : En production (après déploiement sur Vercel)

Assure-toi que ton application est déployée sur Vercel et que les variables d'environnement sont configurées.

```powershell
$headers = @{
    "Authorization" = "Bearer truthminer-admin-2024" # Remplace par ta clé si personnalisée
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://tminer.io/api/admin/add-images-to-reports" -Method POST -Headers $headers
```

## Sécurité

Cette route est protégée par une clé secrète via l'en-tête `Authorization`.

- **Clé par défaut** : `truthminer-admin-2024`
- **Personnalisation** : Tu peux définir ta propre clé en ajoutant `ADMIN_SECRET_KEY=ta-cle-secrete` dans ton fichier `.env.local` (pour le développement) et dans les variables d'environnement de Vercel (pour la production).

## Réponse attendue

La route retournera un objet JSON similaire à ceci :

```json
{
  "success": true,
  "message": "Ajout d'images terminé : 5 mis à jour, 3 ignorés, 0 erreurs",
  "results": {
    "total": 8,
    "updated": 5,
    "skipped": 3,
    "errors": 0,
    "details": [
      {
        "id": "uuid-du-rapport-1",
        "productName": "Meilleure souris gaming",
        "status": "updated",
        "imageUrl": "https://example.com/image.jpg"
      },
      {
        "id": "uuid-du-rapport-2",
        "productName": "Casque audio",
        "status": "skipped",
        "reason": "Image déjà présente"
      },
      {
        "id": "uuid-du-rapport-3",
        "productName": "Produit sans image",
        "status": "skipped",
        "reason": "Aucune image trouvée"
      }
    ]
  }
}
```

## Notes importantes

- **Temps d'exécution** : Cette opération peut prendre du temps selon le nombre de rapports (500ms de pause entre chaque recherche pour ne pas surcharger l'API Serper)
- **Rapports avec images** : Les rapports qui ont déjà une image seront ignorés
- **Rapports sans images trouvées** : Si aucune image n'est trouvée pour un rapport, il sera ignoré (pas d'erreur)
- **Logs** : Vérifie les logs du serveur pour suivre la progression

## Après l'exécution

Une fois l'API exécutée :
1. Les images seront visibles sur les cartes dans les catégories
2. Les images seront visibles sur la page `/explore`
3. Les images seront visibles sur les pages de rapport individuelles (`/report/[slug]`)
4. Les images seront visibles sur la page d'accueil après génération





