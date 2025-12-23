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
            email text UNIQUE NOT NULL
        );
    END IF;
END $$;


