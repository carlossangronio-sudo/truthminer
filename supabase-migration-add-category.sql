-- Migration SQL pour ajouter la colonne 'category' à la table 'reports'
-- À exécuter dans le SQL Editor de Supabase

-- Vérifier si la colonne existe déjà, sinon l'ajouter
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'reports' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE reports 
    ADD COLUMN category TEXT;
    
    -- Optionnel : Mettre à jour les rapports existants avec une catégorie par défaut
    -- UPDATE reports SET category = 'Services' WHERE category IS NULL;
    
    RAISE NOTICE 'Colonne category ajoutée avec succès';
  ELSE
    RAISE NOTICE 'La colonne category existe déjà';
  END IF;
END $$;

-- Créer un index pour améliorer les performances des filtres par catégorie
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);






