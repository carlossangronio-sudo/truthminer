# Guide : Mettre à jour les images des 10 derniers rapports

## Description
Ce script met à jour automatiquement les images des **10 derniers rapports** qui n'ont pas d'image dans Supabase.

## Utilisation

### En local (développement)

```powershell
$headers = @{
    "Authorization" = "Bearer truthminer-admin-2024"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/admin/update-recent-images" -Method POST -Headers $headers
```

### En production (Vercel)

```powershell
$headers = @{
    "Authorization" = "Bearer truthminer-admin-2024"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://tminer.io/api/admin/update-recent-images" -Method POST -Headers $headers
```

## Réponse attendue

```json
{
  "success": true,
  "message": "Mise à jour terminée : 8 mis à jour, 2 erreurs",
  "results": {
    "total": 25,
    "withoutImage": 10,
    "updated": 8,
    "errors": 2,
    "details": [
      {
        "id": "uuid-1",
        "productName": "iPhone 15",
        "imageUrl": "https://example.com/image.jpg",
        "status": "updated"
      },
      {
        "id": "uuid-2",
        "productName": "Produit sans image",
        "status": "error",
        "message": "Aucune image trouvée via Serper"
      }
    ]
  }
}
```

## Notes importantes

1. **Limite** : Seuls les **10 derniers rapports** sans image sont traités
2. **Rate limiting** : Une pause de 500ms est ajoutée entre chaque recherche d'image pour éviter le rate limit de Serper
3. **Sécurité** : L'endpoint est protégé par `ADMIN_SECRET_KEY` (par défaut: `truthminer-admin-2024`)
4. **Ordre** : Les rapports sont triés par date de création (plus récents en premier)

## Personnalisation

Pour changer la clé secrète, modifie la variable d'environnement `ADMIN_SECRET_KEY` dans `.env.local` :

```
ADMIN_SECRET_KEY=ta-cle-secrete-personnalisee
```








