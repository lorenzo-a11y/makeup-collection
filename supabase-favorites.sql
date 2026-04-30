-- ============================================================
-- FAVORIS — Ajouter la colonne is_favorite
-- À coller dans Supabase > Éditeur SQL > Nouvelle requête
-- ============================================================

-- 1. Ajouter la colonne
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false NOT NULL;

-- 2. Permettre à tout le monde de mettre à jour les favoris
DROP POLICY IF EXISTS "Admin products" ON public.products;

CREATE POLICY "Auth insert products" ON public.products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth delete products" ON public.products
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone update products" ON public.products
  FOR UPDATE USING (true);
