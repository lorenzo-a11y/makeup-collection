-- Activer les teintes pour Sourcils et Poudre
UPDATE public.categories
SET has_shades = true
WHERE name ILIKE '%sourcil%'
   OR name ILIKE '%poudre%';
