'use client'

import { useState, useMemo } from 'react'
import { SlidersHorizontal, X, Star, Heart } from 'lucide-react'
import type { Category, Product } from '@/lib/types'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'

interface Props {
  products: Product[]
  categories: Category[]
}

export default function Gallery({ products, categories }: Props) {
  const [activeMain, setActiveMain] = useState<string | null>(null)
  const [activeSub, setActiveSub] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showFavsOnly, setShowFavsOnly] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'empty'>('active')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterStars, setFilterStars] = useState<number | null>(null)
  const [filterPriceMax, setFilterPriceMax] = useState('')

  const mainCategories = useMemo(() => categories.filter(c => !c.parent_id), [categories])
  const subCategories = useMemo(
    () => categories.filter(c => c.parent_id === activeMain),
    [categories, activeMain]
  )

  const brands = useMemo(() => {
    const set = new Set(products.map(p => p.brand))
    return Array.from(set).sort()
  }, [products])

  const activeFiltersCount = [filterBrand, filterStars, filterPriceMax, filterStatus !== 'active' ? filterStatus : ''].filter(Boolean).length

  function selectMain(id: string | null) {
    setActiveMain(id)
    setActiveSub(null)
  }

  const filtered = useMemo(() => {
    let list = products

    if (activeSub) {
      list = list.filter(p => p.category_id === activeSub)
    } else if (activeMain) {
      const subIds = categories.filter(c => c.parent_id === activeMain).map(c => c.id)
      list = list.filter(p => p.category_id === activeMain || subIds.includes(p.category_id))
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      )
    }
    if (filterStatus === 'active') list = list.filter(p => !p.is_empty)
    else if (filterStatus === 'empty') list = list.filter(p => p.is_empty)
    if (showFavsOnly) list = list.filter(p => p.is_favorite)
    if (filterBrand) list = list.filter(p => p.brand === filterBrand)
    if (filterStars) list = list.filter(p => p.rating !== null && p.rating >= filterStars)
    if (filterPriceMax) list = list.filter(p => p.price !== null && p.price <= parseFloat(filterPriceMax))

    return list
  }, [products, activeMain, activeSub, search, showFavsOnly, filterStatus, filterBrand, filterStars, filterPriceMax, categories])

  function clearFilters() {
    setFilterBrand('')
    setFilterStars(null)
    setFilterPriceMax('')
    setFilterStatus('active')
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-display italic text-4xl sm:text-5xl text-rose-deep mb-2">
            Ma Collection
          </h1>
          <p className="text-mauve text-sm">
            {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Barre de recherche + bouton filtres */}
        <div className="flex gap-3 mb-5 max-w-2xl mx-auto items-center">
          <input
            type="text"
            placeholder="Rechercher un produit ou une marque..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-5 py-3 rounded-full border border-border bg-white text-sm text-plum placeholder-mauve focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
          />
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-full border text-sm font-medium transition-all ${
              showFilters || activeFiltersCount > 0
                ? 'bg-rose-deep text-white border-rose-deep'
                : 'bg-white text-mauve border-border hover:border-rose hover:text-rose-deep'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gold text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Bouton Mes favoris */}
          <button
            onClick={() => setShowFavsOnly(v => !v)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-full border text-sm font-medium transition-all ${
              showFavsOnly
                ? 'bg-rose text-white border-rose'
                : 'bg-white text-mauve border-border hover:border-rose hover:text-rose-deep'
            }`}
          >
            <Heart className="w-4 h-4" fill={showFavsOnly ? 'white' : 'none'} />
            <span className="hidden sm:inline">Favoris</span>
          </button>
        </div>

        {/* Panneau filtres avancés */}
        {showFilters && (
          <div className="max-w-2xl mx-auto mb-5 bg-white rounded-2xl border border-border p-5 flex flex-wrap gap-4">
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Marque</label>
              <select
                value={filterBrand}
                onChange={e => setFilterBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose bg-white"
              >
                <option value="">Toutes</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Note minimum</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFilterStars(filterStars === n ? null : n)}
                    className="p-1"
                  >
                    <Star
                      className="w-5 h-5 transition-colors"
                      fill={filterStars && n <= filterStars ? '#C4A35A' : 'none'}
                      stroke={filterStars && n <= filterStars ? '#C4A35A' : '#D1B5BC'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-32">
              <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Prix max (€)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={filterPriceMax}
                onChange={e => setFilterPriceMax(e.target.value)}
                placeholder="Ex : 50"
                className="w-full px-3 py-2 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose"
              />
            </div>
            <div className="w-full">
              <label className="block text-xs font-medium text-mauve uppercase tracking-widest mb-1.5">Statut</label>
              <div className="flex gap-2">
                {(['active', 'all', 'empty'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      filterStatus === s
                        ? 'bg-rose-deep text-white border-rose-deep'
                        : 'bg-white text-mauve border-border hover:border-rose hover:text-rose-deep'
                    }`}
                  >
                    {s === 'active' ? 'Actifs' : s === 'empty' ? 'Épuisés' : 'Tous'}
                  </button>
                ))}
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="self-end flex items-center gap-1 text-xs text-mauve hover:text-rose-deep transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Effacer
              </button>
            )}
          </div>
        )}

        {/* Catégories principales — scroll horizontal sur mobile */}
        <div className="mb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center scrollbar-hide">
            <button
              onClick={() => selectMain(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeMain === null
                  ? 'bg-rose-deep text-white shadow-sm'
                  : 'bg-white text-mauve border border-border hover:border-rose hover:text-rose-deep'
              }`}
            >
              Tout
            </button>
            {mainCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => selectMain(activeMain === cat.id ? null : cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeMain === cat.id
                    ? 'bg-rose-deep text-white shadow-sm'
                    : 'bg-white text-mauve border border-border hover:border-rose hover:text-rose-deep'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sous-catégories */}
        {activeMain !== null && subCategories.length > 0 && (
          <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center scrollbar-hide">
              {subCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveSub(activeSub === cat.id ? null : cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeSub === cat.id
                      ? 'bg-rose text-white shadow-sm'
                      : 'bg-petal text-rose-dark hover:bg-rose hover:text-white'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grille */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <span className="text-5xl block mb-4">✨</span>
            <p className="font-display italic text-xl text-mauve">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="masonry">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </>
  )
}
