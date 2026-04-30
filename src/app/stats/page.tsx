import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Heart, Star, Euro, Package, Sparkles } from 'lucide-react'
import type { Category, Product } from '@/lib/types'

export const revalidate = 60

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-3xl border border-border p-6 flex flex-col gap-2">
      <div className="w-10 h-10 rounded-2xl bg-petal flex items-center justify-center">
        {icon}
      </div>
      <p className="text-xs uppercase tracking-widest text-mauve font-medium">{label}</p>
      <p className="font-display text-3xl text-plum">{value}</p>
      {sub && <p className="text-xs text-mauve">{sub}</p>}
    </div>
  )
}

export default async function StatsPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from('categories').select('*'),
    supabase.from('products').select('*, category:categories(*)'),
  ])

  const all: Product[] = products ?? []
  const cats: Category[] = categories ?? []

  const mainCats = cats.filter(c => !c.parent_id)

  const favorites = all.filter(p => p.is_favorite).length
  const withPrice = all.filter(p => p.price != null)
  const totalBudget = withPrice.reduce((s, p) => s + (p.price ?? 0), 0)
  const withRating = all.filter(p => p.rating != null)
  const avgRating = withRating.length
    ? (withRating.reduce((s, p) => s + (p.rating ?? 0), 0) / withRating.length).toFixed(1)
    : null

  const byCat = mainCats.map(cat => {
    const subIds = cats.filter(c => c.parent_id === cat.id).map(c => c.id)
    const count = all.filter(p => p.category_id === cat.id || subIds.includes(p.category_id)).length
    return { ...cat, count }
  }).filter(c => c.count > 0).sort((a, b) => b.count - a.count)

  const max = byCat[0]?.count ?? 1

  const brandMap: Record<string, number> = {}
  all.forEach(p => { brandMap[p.brand] = (brandMap[p.brand] ?? 0) + 1 })
  const topBrands = Object.entries(brandMap).sort((a, b) => b[1] - a[1]).slice(0, 6)

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-border hover:bg-petal transition-colors text-mauve">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display italic text-3xl text-rose-deep">Statistiques</h1>
            <p className="text-sm text-mauve">Ma Collection Beauté</p>
          </div>
        </div>

        {/* Chiffres clés */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Package className="w-5 h-5 text-rose-dark" />}
            label="Produits"
            value={String(all.length)}
          />
          <StatCard
            icon={<Heart className="w-5 h-5 text-rose" fill="#E8A4B8" />}
            label="Favoris"
            value={String(favorites)}
            sub={all.length ? `${Math.round(favorites / all.length * 100)}% de la collection` : undefined}
          />
          <StatCard
            icon={<Euro className="w-5 h-5 text-gold" />}
            label="Budget total"
            value={withPrice.length ? `${totalBudget.toFixed(0)} €` : '—'}
            sub={withPrice.length < all.length ? `sur ${withPrice.length} produits renseignés` : undefined}
          />
          <StatCard
            icon={<Star className="w-5 h-5 text-gold" fill="#C4A35A" />}
            label="Note moyenne"
            value={avgRating ? `${avgRating} / 5` : '—'}
            sub={withRating.length ? `${withRating.length} avis` : undefined}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Par catégorie */}
          {byCat.length > 0 && (
            <div className="bg-white rounded-3xl border border-border p-6">
              <h2 className="font-display text-lg text-plum mb-5">Par catégorie</h2>
              <div className="space-y-3">
                {byCat.map(cat => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-plum">
                        {cat.icon} {cat.name}
                      </span>
                      <span className="text-xs text-mauve font-medium">{cat.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-petal overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose transition-all duration-500"
                        style={{ width: `${(cat.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top marques */}
          {topBrands.length > 0 && (
            <div className="bg-white rounded-3xl border border-border p-6">
              <h2 className="font-display text-lg text-plum mb-5">Top marques</h2>
              <div className="space-y-3">
                {topBrands.map(([brand, count], i) => (
                  <div key={brand} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-petal text-rose-dark text-xs flex items-center justify-center font-medium flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-plum truncate">{brand}</span>
                    <span className="text-xs text-mauve font-medium">
                      {count} produit{count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {all.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="w-10 h-10 text-rose mx-auto mb-4" />
            <p className="font-display italic text-xl text-mauve">Aucun produit encore</p>
          </div>
        )}
      </div>
    </div>
  )
}
