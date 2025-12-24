# Configuration Google Indexing API

## Installation

La bibliothèque `googleapis` est déjà installée.

## Configuration de la variable d'environnement

### 1. Créer un compte de service Google

1. Va sur [Google Cloud Console](https://console.cloud.google.com/)
2. Crée un projet ou sélectionne un projet existant
3. Active l'API "Indexing API"
4. Crée un compte de service :
   - IAM & Admin → Service Accounts
   - Crée un nouveau compte de service
   - Télécharge le fichier JSON des credentials

### 2. Configurer dans `.env.local`

Ouvre ton fichier `.env.local` et ajoute la variable suivante :

```env
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"ton-projet","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

**Important :**
- Le contenu du fichier JSON doit être sur **une seule ligne**
- Tous les guillemets doivent être échappés avec des backslashes (`\"`)
- Les retours à ligne dans `private_key` doivent être remplacés par `\n`

### 3. Alternative : Utiliser un fichier JSON (non recommandé pour production)

Si tu préfères utiliser un fichier JSON directement, modifie `app/api/admin/bulk-index/route.ts` pour lire depuis un fichier au lieu de la variable d'environnement.

## Utilisation

### Appeler l'API d'indexation

```bash
curl -X POST https://tminer.io/api/admin/bulk-index \
  -H "Authorization: Bearer truthminer-admin-2024" \
  -H "Content-Type: application/json"
```

### Réponse attendue

```json
{
  "success": true,
  "message": "Indexation terminée : 26 URLs indexées, 0 erreurs",
  "results": {
    "total": 26,
    "indexed": 26,
    "errors": 0,
    "details": [
      {
        "url": "https://tminer.io/report/slug-1",
        "status": "success"
      },
      ...
    ]
  }
}
```

## Notes importantes

- L'API Google Indexing a des limites de rate limiting (environ 200 requêtes/jour)
- Une pause de 500ms est ajoutée entre chaque requête pour éviter le rate limiting
- Seules les URLs de ton domaine (configuré dans `NEXT_PUBLIC_SITE_URL`) peuvent être indexées
- Le compte de service doit avoir la propriété du domaine dans Google Search Console

