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

-- Désactiver RLS (Row Level Security) pour permettre l'insertion publique
-- Les visiteurs doivent pouvoir s'inscrire sans être connectés
ALTER TABLE public.subscribers DISABLE ROW LEVEL SECURITY;

-- Alternative : Si tu préfères garder RLS activé, utilise cette politique publique :
-- CREATE POLICY "Allow public insert on subscribers" ON public.subscribers
--     FOR INSERT
--     TO anon, authenticated
--     WITH CHECK (true);


