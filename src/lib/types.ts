export type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  has_shades: boolean
  parent_id: string | null
}

export type Shade = {
  id: string
  product_id: string
  name: string
  hex_color: string | null
}

export type Product = {
  id: string
  name: string
  brand: string
  category_id: string
  description: string | null
  image_url: string | null
  price: number | null
  rating: number | null
  is_favorite: boolean
  created_at: string
  category?: Category
  shades?: Shade[]
}
