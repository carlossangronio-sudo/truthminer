# Guide de Configuration - TruthMiner

## 1. Installation des dépendances

```bash
npm install
```

## 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet avec les clés API suivantes :

```env
# Clé API Serper.dev (obligatoire)
# Obtenez votre clé sur : https://serper.dev
SERPER_API_KEY=votre_cle_serper_ici

# Clé API OpenAI (obligatoire)
# Obtenez votre clé sur : https://platform.openai.com/api-keys
OPENAI_API_KEY=votre_cle_openai_ici

# ID d'affiliation Amazon (optionnel, pour plus tard)
# Format : votre-id-20
NEXT_PUBLIC_AMAZON_AFFILIATE_ID=votre_id_amazon_ici
```

## 3. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 4. Utilisation

1. Entrez un mot-clé de recherche (ex: "Meilleure souris gaming")
2. Cliquez sur "Générer avec l'IA"
3. Attendez la génération (peut prendre 30-60 secondes)
4. Consultez l'article généré avec le choix de la communauté et les défauts rédhibitoires

## 5. Structure des données

Les rapports générés sont stockés dans `/data/reports.json` pour éviter de payer l'API plusieurs fois pour le même mot-clé.

## Notes importantes

- Les appels API peuvent avoir un coût (Serper.dev + OpenAI)
- Le cache local évite les appels redondants
- Les rapports sont stockés indéfiniment dans `/data/reports.json`


