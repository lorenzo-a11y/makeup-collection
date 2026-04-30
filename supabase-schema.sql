-- ============================================================
-- SCHEMA — Ma Collection Beauté
-- À coller dans Supabase > SQL Editor > New Query
-- ============================================================

-- Catégories
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  icon text,
  has_shades boolean default false not null,
  created_at timestamptz default now() not null
);

-- Produits
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  brand text not null,
  category_id uuid references public.categories(id) on delete set null,
  description text,
  image_url text,
  price numeric(10, 2),
  rating integer check (rating >= 1 and rating <= 5),
  created_at timestamptz default now() not null
);

-- Teintes
create table public.shades (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  name text not null,
  hex_color text,
  created_at timestamptz default now() not null
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.shades enable row level security;

-- Lecture publique
create policy "Lecture publique categories" on public.categories for select using (true);
create policy "Lecture publique products" on public.products for select using (true);
create policy "Lecture publique shades" on public.shades for select using (true);

-- Écriture uniquement pour les utilisateurs connectés
create policy "Admin categories" on public.categories for all using (auth.role() = 'authenticated');
create policy "Admin products" on public.products for all using (auth.role() = 'authenticated');
create policy "Admin shades" on public.shades for all using (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE — bucket pour les photos
-- ============================================================

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

create policy "Images publiques" on storage.objects for select using (bucket_id = 'product-images');
create policy "Upload admin" on storage.objects for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "Delete admin" on storage.objects for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ============================================================
-- DONNÉES PAR DÉFAUT — catégories
-- ============================================================

insert into public.categories (name, slug, icon, has_shades) values
  ('Rouge à lèvres', 'rouge-a-levres', '💄', true),
  ('Fond de teint', 'fond-de-teint', '🏺', false),
  ('Fard à paupières', 'fard-a-paupieres', '✨', true),
  ('Blush', 'blush', '🌸', true),
  ('Mascara', 'mascara', '🪄', false),
  ('Eyeliner', 'eyeliner', '🖊️', true),
  ('Bronzer / Highlighter', 'bronzer', '☀️', true),
  ('Correcteur', 'correcteur', '💊', false),
  ('Palette', 'palette', '🎨', true),
  ('Soin', 'soin', '🌿', false);
