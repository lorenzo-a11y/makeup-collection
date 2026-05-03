import { createClient } from '@/lib/supabase/server'
import { getBrandCountry } from '@/lib/brandOrigins'
import MarquesClient from './MarquesClient'

export const revalidate = 60

export interface BrandData {
  name: string
  alpha2: string | null
  productCount: number
  products: { id: string; name: string; image_url: string | null; category: { name: string; icon: string } | null }[]
}

export default async function MarquesPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name, brand, image_url, category:categories(name, icon)')
    .order('brand')

  const all = products ?? []
  const brandNames = Array.from(new Set(all.map(p => p.brand))).sort()

  const brands: BrandData[] = brandNames.map(brand => ({
    name: brand,
    alpha2: getBrandCountry(brand),
    productCount: all.filter(p => p.brand === brand).length,
    products: all
      .filter(p => p.brand === brand)
      .map(p => ({
        id: p.id,
        name: p.name,
        image_url: p.image_url,
        category: Array.isArray(p.category) ? p.category[0] ?? null : p.category ?? null,
      })),
  }))

  return <MarquesClient brands={brands} />
}
