# Installation de la table subscribers dans Supabase

## Étapes à suivre

1. **Ouvre le SQL Editor** dans ton projet Supabase
2. **Copie-colle le code SQL** ci-dessous
3. **Exécute le script**

## Code SQL à exécuter

```sql
-- Crée la table subscribers pour capturer les emails de newsletter
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'subscribers'
          AND table_schema = 'public'
    ) THEN
        CREATE TABLE public.subscribers (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            email text UNIQUE NOT NULL,
            created_at timestamptz DEFAULT now() NOT NULL
        );
    ELSE
        -- Si la table existe déjà mais n'a pas created_at, l'ajouter
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'subscribers'
              AND column_name = 'created_at'
              AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.subscribers ADD COLUMN created_at timestamptz DEFAULT now() NOT NULL;
        END IF;
    END IF;
END $$;

-- Désactiver RLS (Row Level Security) pour permettre l'insertion publique
-- Les visiteurs doivent pouvoir s'inscrire sans être connectés
ALTER TABLE public.subscribers DISABLE ROW LEVEL SECURITY;
```

## Structure de la table

La table `subscribers` aura les colonnes suivantes :
- `id` : UUID (clé primaire, généré automatiquement)
- `email` : TEXT (unique, obligatoire)
- `created_at` : TIMESTAMPTZ (timestamp avec fuseau horaire, généré automatiquement)

## Vérification

Après avoir exécuté le script, vérifie que :
1. La table `subscribers` existe dans l'onglet "Table Editor" de Supabase
2. Les 3 colonnes sont présentes (id, email, created_at)
3. RLS est désactivé (tu peux tester en essayant d'insérer un email via l'interface web)

