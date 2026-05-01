import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Heart, Star, Euro, Package, Sparkles, TrendingUp, Award } from 'lucide-react'
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

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={n <= rating ? '#C4A35A' : 'none'} stroke={n <= rating ? '#C4A35A' : '#D1B5BC'} strokeWidth={2}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </span>
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
  const makeupId = 'aaaaaaaa-0000-0000-0000-000000000001'
  const makeupSubIds = cats.filter(c => c.parent_id === makeupId).map(c => c.id)
  const makeupProducts = all.filter(p => makeupSubIds.includes(p.category_id) || p.category_id === makeupId)

  const favorites = all.filter(p => p.is_favorite).length
  const empty = all.filter(p => p.is_empty).length
  const withPrice = all.filter(p => p.price != null)
  const totalBudget = withPrice.reduce((s, p) => s + (p.price ?? 0), 0)
  const avgBudget = withPrice.length ? totalBudget / withPrice.length : null
  const withRating = all.filter(p => p.rating != null)
  const avgRating = withRating.length
    ? withRating.reduce((s, p) => s + (p.rating ?? 0), 0) / withRating.length
    : null

  // Distribution des notes
  const ratingDist = [5, 4, 3, 2, 1].map(n => ({
    stars: n,
    count: withRating.filter(p => p.rating === n).length,
  }))
  const maxRatingCount = Math.max(...ratingDist.map(r => r.count), 1)

  // Par catégorie principale (count + note moyenne + budget)
  const byCat = mainCats.map(cat => {
    const subIds = cats.filter(c => c.parent_id === cat.id).map(c => c.id)
    const catProducts = all.filter(p => p.category_id === cat.id || subIds.includes(p.category_id))
    const catRated = catProducts.filter(p => p.rating != null)
    const catPriced = catProducts.filter(p => p.price != null)
    return {
      ...cat,
      count: catProducts.length,
      avgRating: catRated.length ? catRated.reduce((s, p) => s + (p.rating ?? 0), 0) / catRated.length : null,
      totalBudget: catPriced.reduce((s, p) => s + (p.price ?? 0), 0),
      hasBudget: catPriced.length > 0,
    }
  }).filter(c => c.count > 0).sort((a, b) => b.count - a.count)

  const maxCount = byCat[0]?.count ?? 1

  // Top marques (count + note moyenne + budget)
  const brandMap: Record<string, { count: number; totalRating: number; ratedCount: number; totalBudget: number; pricedCount: number }> = {}
  all.forEach(p => {
    if (!brandMap[p.brand]) brandMap[p.brand] = { count: 0, totalRating: 0, ratedCount: 0, totalBudget: 0, pricedCount: 0 }
    brandMap[p.brand].count++
    if (p.rating != null) { brandMap[p.brand].totalRating += p.rating; brandMap[p.brand].ratedCount++ }
    if (p.price != null) { brandMap[p.brand].totalBudget += p.price; brandMap[p.brand].pricedCount++ }
  })
  const topBrands = Object.entries(brandMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([brand, data]) => ({
      brand,
      count: data.count,
      avgRating: data.ratedCount ? data.totalRating / data.ratedCount : null,
      totalBudget: data.pricedCount ? data.totalBudget : null,
    }))

  // Coup de cœur : produit le mieux noté (parmi maquillage)
  const topRated = [...makeupProducts].filter(p => p.rating != null).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0] ?? null
  // Produit le plus cher
  const mostExpensive = [...all].filter(p => p.price != null).sort((a, b) => (b.price ?? 0) - (a.price ?? 0))[0] ?? null

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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Package className="w-5 h-5 text-rose-dark" />}
            label="Produits"
            value={String(all.length)}
            sub={empty > 0 ? `${empty} épuisé${empty > 1 ? 's' : ''}` : undefined}
          />
          <StatCard
            icon={<Heart className="w-5 h-5 text-rose" fill="#E8A4B8" />}
            label="Favoris"
            value={String(favorites)}
            sub={all.length ? `${Math.round(favorites / all.length * 100)} % de la collection` : undefined}
          />
          <StatCard
            icon={<Star className="w-5 h-5 text-gold" fill="#C4A35A" />}
            label="Note moyenne"
            value={avgRating ? `${avgRating.toFixed(1)} / 5` : '—'}
            sub={withRating.length ? `${withRating.length} produits notés` : undefined}
          />
          <StatCard
            icon={<Euro className="w-5 h-5 text-gold" />}
            label="Budget total"
            value={withPrice.length ? `${totalBudget.toFixed(0)} €` : '—'}
            sub={withPrice.length < all.length ? `sur ${withPrice.length} produits renseignés` : undefined}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-gold" />}
            label="Prix moyen"
            value={avgBudget ? `${avgBudget.toFixed(0)} €` : '—'}
            sub="par produit"
          />
          <StatCard
            icon={<Award className="w-5 h-5 text-rose-dark" />}
            label="Maquillage"
            value={String(makeupProducts.length)}
            sub={all.length ? `${Math.round(makeupProducts.length / all.length * 100)} % de la collection` : undefined}
          />
        </div>

        {/* Coups de cœur */}
        {(topRated || mostExpensive) && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {topRated && (
              <div className="bg-white rounded-3xl border border-border p-5">
                <p className="text-xs font-medium text-mauve uppercase tracking-widest mb-4">Maquillage le mieux noté</p>
                <div className="flex items-center gap-3">
                  {topRated.image_url
                    ? <img src={topRated.image_url} alt={topRated.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                    : <div className="w-14 h-14 rounded-2xl bg-petal flex items-center justify-center text-2xl flex-shrink-0">{topRated.category?.icon ?? '💄'}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-mauve">{topRated.brand}</p>
                    <p className="font-display text-base text-plum truncate">{topRated.name}</p>
                    <Stars rating={topRated.rating ?? 0} />
                  </div>
                </div>
              </div>
            )}
            {mostExpensive && (
              <div className="bg-white rounded-3xl border border-border p-5">
                <p className="text-xs font-medium text-mauve uppercase tracking-widest mb-4">Produit le plus cher</p>
                <div className="flex items-center gap-3">
                  {mostExpensive.image_url
                    ? <img src={mostExpensive.image_url} alt={mostExpensive.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                    : <div className="w-14 h-14 rounded-2xl bg-petal flex items-center justify-center text-2xl flex-shrink-0">{mostExpensive.category?.icon ?? '💄'}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-mauve">{mostExpensive.brand}</p>
                    <p className="font-display text-base text-plum truncate">{mostExpensive.name}</p>
                    <p className="text-sm font-medium text-gold">{mostExpensive.price?.toFixed(2)} €</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          {/* Par catégorie */}
          {byCat.length > 0 && (
            <div className="bg-white rounded-3xl border border-border p-6">
              <h2 className="font-display text-lg text-plum mb-5">Par catégorie</h2>
              <div className="space-y-4">
                {byCat.map(cat => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-plum">{cat.icon} {cat.name}</span>
                      <div className="flex items-center gap-2">
                        {cat.avgRating && (
                          <span className="text-xs text-gold font-medium">★ {cat.avgRating.toFixed(1)}</span>
                        )}
                        <span className="text-xs text-mauve font-medium">{cat.count}</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-petal overflow-hidden">
                      <div className="h-full rounded-full bg-rose transition-all duration-500" style={{ width: `${(cat.count / maxCount) * 100}%` }} />
                    </div>
                    {cat.hasBudget && (
                      <p className="text-xs text-mauve mt-1">{cat.totalBudget.toFixed(0)} € investis</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Distribution des notes */}
          {withRating.length > 0 && (
            <div className="bg-white rounded-3xl border border-border p-6">
              <h2 className="font-display text-lg text-plum mb-5">Distribution des notes</h2>
              <div className="space-y-3">
                {ratingDist.map(({ stars, count }) => (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5 w-20 flex-shrink-0">
                      {[1,2,3,4,5].map(n => (
                        <svg key={n} className="w-3 h-3" viewBox="0 0 24 24" fill={n <= stars ? '#C4A35A' : 'none'} stroke={n <= stars ? '#C4A35A' : '#D1B5BC'} strokeWidth={2}>
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      ))}
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-petal overflow-hidden">
                      <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${(count / maxRatingCount) * 100}%` }} />
                    </div>
                    <span className="text-xs text-mauve font-medium w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-mauve mt-4">{withRating.length} produit{withRating.length > 1 ? 's' : ''} noté{withRating.length > 1 ? 's' : ''} sur {all.length}</p>
            </div>
          )}
        </div>

        {/* Top marques enrichi */}
        {topBrands.length > 0 && (
          <div className="bg-white rounded-3xl border border-border p-6">
            <h2 className="font-display text-lg text-plum mb-5">Top marques</h2>
            <div className="space-y-3">
              {topBrands.map(({ brand, count, avgRating, totalBudget }, i) => (
                <div key={brand} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-petal text-rose-dark text-xs flex items-center justify-center font-medium flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-plum truncate font-medium">{brand}</span>
                  <div className="flex items-center gap-3 text-xs text-mauve">
                    {avgRating && <span className="text-gold">★ {avgRating.toFixed(1)}</span>}
                    {totalBudget != null && <span>{totalBudget.toFixed(0)} €</span>}
                    <span>{count} produit{count > 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
