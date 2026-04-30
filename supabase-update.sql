-- ============================================================
-- MISE À JOUR — Nouvelles catégories avec hiérarchie
-- À coller dans Supabase > Éditeur SQL > Nouvelle requête
-- ============================================================

-- 1. Ajouter la colonne parent_id si elle n'existe pas
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- 2. Supprimer les anciennes catégories (et les produits liés seront mis à null)
DELETE FROM public.categories;

-- 3. Insérer les catégories principales (avec IDs fixes pour les références)
INSERT INTO public.categories (id, name, slug, icon, has_shades, parent_id) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Maquillage',   'maquillage',  '💄', false, null),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Soins-Corps',  'soins-corps', '🧴', false, null),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Skin Care',    'skin-care',   '✨', false, null),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Capillaire',   'capillaire',  '💇', false, null),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Parfums',      'parfums',     '🌸', false, null);

-- 4. Sous-catégories Maquillage
INSERT INTO public.categories (name, slug, icon, has_shades, parent_id) VALUES
  ('Blush',                   'blush',                  '🌸', true,  'aaaaaaaa-0000-0000-0000-000000000001'),
  ('Bronzer / Highlighter',   'bronzer-highlighter',    '☀️', true,  'aaaaaaaa-0000-0000-0000-000000000001'),
  ('Correcteur',              'correcteur',             '🔮', false, 'aaaaaaaa-0000-0000-0000-000000000001'),
  ('Eyeliner / Crayon',       'eyeliner-crayon',        '🖊️', true,  'aaaaaaaa-0000-0000-0000-000000000001'),
  ('Fard à paupières',        'fard-a-paupieres',       '👁️', true,  'aaaaaaaa-0000-0000-0000-000000000001'),
  ('Fond de teint',           'fond-de-teint',          '🏺', false, 'aaaaaaaa-0000-0000-0000-000000000001'),
  ('Mascara',                 'mascara',                '🪄', false, 'aaaaaaaa-0000-0000-0000-000000000001'),
  ('Produits à lèvres',       'produits-a-levres',      '💋', true,  'aaaaaaaa-0000-0000-0000-000000000001'),
  ('Pinceau / Beauty-Blender','pinceau-beauty-blender', '🖌️', false, 'aaaaaaaa-0000-0000-0000-000000000001'),
  ('Primer / Fixateur / Poudre','primer-fixateur',      '🫧', false, 'aaaaaaaa-0000-0000-0000-000000000001');

-- 5. Sous-catégories Skin Care
INSERT INTO public.categories (name, slug, icon, has_shades, parent_id) VALUES
  ('Nettoyant', 'nettoyant',      '🫧', false, 'aaaaaaaa-0000-0000-0000-000000000003'),
  ('Sérum',     'serum',          '💧', false, 'aaaaaaaa-0000-0000-0000-000000000003'),
  ('Crème',     'creme',          '🥛', false, 'aaaaaaaa-0000-0000-0000-000000000003'),
  ('Masque',    'masque',         '🎭', false, 'aaaaaaaa-0000-0000-0000-000000000003'),
  ('Autres',    'autres-skincare','🌿', false, 'aaaaaaaa-0000-0000-0000-000000000003');
