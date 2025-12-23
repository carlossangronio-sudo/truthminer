# TruthMiner

Application web pour générer des analyses ultra-honnêtes (produits, actualité, tendances de société) en synthétisant les discussions Reddit.

## Stack Technique

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Serper.dev API** (recherche Reddit)
- **OpenAI GPT-4o** (analyse et génération d'articles)

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

Puis remplir les clés API dans `.env` :
- `SERPER_API_KEY` : Votre clé API Serper.dev
- `OPENAI_API_KEY` : Votre clé API OpenAI

3. Lancer le serveur de développement :
```bash
npm run dev
```

## Fonctionnalités

- 🔍 Recherche de discussions Reddit via Serper.dev
- 🤖 Analyse et génération d'articles avec GPT-4o
- 💾 Cache local des rapports générés (fichiers JSON)
- 🎨 Design journalistique épuré
- 🔗 Support des liens d'affiliation Amazon

## Structure du Projet

- `/app` : Pages et routes Next.js
- `/lib` : Services modulaires (Serper, OpenAI)
- `/components` : Composants React réutilisables
- `/data` : Stockage local des rapports (JSON)


