-- Ajout de 2 sous-catégories à Skin Care
INSERT INTO public.categories (name, slug, icon, has_shades, parent_id) VALUES
  ('SPF',   'spf',   '☀️', false, 'aaaaaaaa-0000-0000-0000-000000000003'),
  ('Huile',  'huile', '🫒', false, 'aaaaaaaa-0000-0000-0000-000000000003');
