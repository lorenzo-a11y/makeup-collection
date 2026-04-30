-- ============================================================
-- Nouvelles fonctionnalités : Épuisés + Collections + Looks
-- À exécuter dans l'Éditeur SQL de Supabase
-- ============================================================

-- 1. Colonne is_empty sur products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_empty boolean NOT NULL DEFAULT false;

-- 2. Table collections
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Table de liaison collection_products
CREATE TABLE IF NOT EXISTS collection_products (
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES products(id)    ON DELETE CASCADE,
  PRIMARY KEY (collection_id, product_id)
);

-- 4. RLS collections (lecture publique, écriture authentifiée)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read collections"
  ON collections FOR SELECT
  USING (true);

CREATE POLICY "Auth insert collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Auth update collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Auth delete collections"
  ON collections FOR DELETE
  TO authenticated
  USING (true);

-- 5. RLS collection_products
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read collection_products"
  ON collection_products FOR SELECT
  USING (true);

CREATE POLICY "Auth insert collection_products"
  ON collection_products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Auth delete collection_products"
  ON collection_products FOR DELETE
  TO authenticated
  USING (true);
