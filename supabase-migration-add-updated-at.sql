-- Ajouter la colonne updated_at à la table reports
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reports'
          AND column_name = 'updated_at'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.reports ADD COLUMN updated_at timestamptz DEFAULT now() NOT NULL;
        
        -- Initialiser updated_at avec created_at pour les rapports existants
        UPDATE public.reports 
        SET updated_at = created_at 
        WHERE updated_at IS NULL;
    END IF;
END $$;

