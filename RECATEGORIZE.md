# Guide : Recatégoriser les rapports existants

## Comment utiliser la route API de recatégorisation

Une route API admin a été créée pour recatégoriser automatiquement tous les rapports existants dans Supabase.

### Étape 1 : Définir la clé secrète (optionnel mais recommandé)

Ajoute dans ton fichier `.env.local` :

```env
ADMIN_SECRET_KEY=ton-secret-personnel-ici
```

Si tu ne définis pas cette clé, la valeur par défaut sera `truthminer-admin-2024`.

### Étape 2 : Appeler la route API

#### Option A : Via curl (ligne de commande)

```bash
curl -X POST https://tminer.io/api/admin/recategorize-reports \
  -H "Authorization: Bearer ton-secret-personnel-ici" \
  -H "Content-Type: application/json"
```

#### Option B : Via PowerShell (Windows)

```powershell
$headers = @{
    "Authorization" = "Bearer ton-secret-personnel-ici"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://tminer.io/api/admin/recategorize-reports" -Method POST -Headers $headers
```

#### Option C : En local (développement)

```powershell
$headers = @{
    "Authorization" = "Bearer truthminer-admin-2024"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/admin/recategorize-reports" -Method POST -Headers $headers
```

### Étape 3 : Vérifier les résultats

La réponse JSON contiendra :

```json
{
  "success": true,
  "message": "Recatégorisation terminée : X mis à jour, Y inchangés, Z erreurs",
  "results": {
    "total": 10,
    "updated": 5,
    "unchanged": 4,
    "errors": 1,
    "details": [
      {
        "id": "uuid-du-rapport",
        "productName": "souris gaming",
        "oldCategory": "Services",
        "newCategory": "Électronique",
        "status": "updated"
      },
      ...
    ]
  }
}
```

## Comment ça fonctionne

1. La route récupère **tous les rapports** de Supabase
2. Pour chaque rapport, elle utilise la fonction de **détection automatique** basée sur le nom du produit
3. Si la catégorie détectée est différente de celle actuelle, elle **met à jour** le rapport dans Supabase
4. Elle retourne un **résumé détaillé** de toutes les modifications

## Sécurité

⚠️ **Important** : Cette route modifie directement la base de données. Assure-toi de :
- Utiliser une clé secrète forte
- Ne pas exposer cette route publiquement
- Faire une sauvegarde de Supabase avant de lancer la recatégorisation (optionnel mais recommandé)

## Notes

- Les rapports qui ont déjà la bonne catégorie ne seront pas modifiés
- La détection se base uniquement sur le nom du produit (product_name)
- Si un rapport ne correspond à aucun mot-clé, il sera classé en "Services" par défaut

