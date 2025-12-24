-- Script SQL pour corriger les erreurs d'insertion dans Supabase
-- À exécuter dans le SQL Editor de Supabase

-- 1. Créer la colonne updated_at si elle n'existe pas (avec DEFAULT pour qu'elle soit optionnelle lors de l'insertion)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reports'
          AND column_name = 'updated_at'
          AND table_schema = 'public'
    ) THEN
        -- Créer la colonne avec DEFAULT now() et NULL autorisé
        ALTER TABLE public.reports 
        ADD COLUMN updated_at timestamptz DEFAULT now();
        
        -- Initialiser updated_at avec created_at pour les rapports existants
        UPDATE public.reports 
        SET updated_at = created_at 
        WHERE updated_at IS NULL;
        
        RAISE NOTICE 'Colonne updated_at créée avec succès.';
    ELSE
        RAISE NOTICE 'Colonne updated_at existe déjà.';
    END IF;
END $$;

-- 2. S'assurer que image_url peut être NULL (pas de contrainte NOT NULL)
DO $$
BEGIN
    -- Vérifier si la colonne existe
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reports'
          AND column_name = 'image_url'
          AND table_schema = 'public'
    ) THEN
        -- Modifier la colonne pour permettre NULL (si ce n'est pas déjà le cas)
        ALTER TABLE public.reports 
        ALTER COLUMN image_url DROP NOT NULL;
        
        RAISE NOTICE 'Colonne image_url vérifiée (peut être NULL).';
    ELSE
        -- Créer la colonne si elle n'existe pas
        ALTER TABLE public.reports 
        ADD COLUMN image_url TEXT;
        
        RAISE NOTICE 'Colonne image_url créée (peut être NULL).';
    END IF;
END $$;

-- 3. Vérifier que la colonne category peut aussi être NULL (au cas où)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reports'
          AND column_name = 'category'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.reports 
        ALTER COLUMN category DROP NOT NULL;
        
        RAISE NOTICE 'Colonne category vérifiée (peut être NULL).';
    END IF;
END $$;

-- 4. Afficher un résumé de la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'reports'
  AND table_schema = 'public'
ORDER BY ordinal_position;

