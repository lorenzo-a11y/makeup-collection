-- Mode Voyage : ajouter la colonne in_voyage
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_voyage boolean NOT NULL DEFAULT false;
