'use client'

import { useState, useMemo } from 'react'
import { SlidersHorizontal, X, Star, Heart, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { Category, Product } from '@/lib/types'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'
import ProductForm from './admin/ProductForm'

type SortKey = 'name' | 'price' | 'brand' | 'category' | 'rating' | 'created_at'
type SortItem = { key: SortKey; dir: 'asc' | 'desc' }

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name',       label: 'Nom' },
  { key: 'brand',      label: 'Marque' },
  { key: 'category',   label: 'Catégorie' },
  { key: 'price',      label: 'Prix' },
  { key: 'rating',     label: 'Note' },
  { key: 'created_at', label: 'Date' },
]

function getSortValue(p: Product, key: SortKey): string | number {
  switch (key) {
    case 'name':       return p.name.toLowerCase()
    case 'brand':      return p.brand.toLowerCase()
    case 'category':   return p.category?.name.toLowerCase() ?? ''
    case 'price':      return p.price ?? Infinity
    case 'rating':     return p.rating ?? 0
    case 'created_at': return p.created_at
  }
}

interface Props {
  products: Product[]
  categories: Category[]
  isAdmin?: boolean
}

export default function Gallery({ products, categories, isAdmin }: Props) {
  const [activeMain, setActiveMain] = useState<string | null>(null)
  const [activeSub, setActiveSub] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showFavsOnly, setShowFavsOnly] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'empty'>('active')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterStars, setFilterStars] = useState<number | null>(null)
  const [filterPriceMax, setFilterPriceMax] = useState('')
  const [sorts, setSorts] = useState<SortItem[]>([])

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

  function handleSort(key: SortKey) {
    setSorts(prev => {
      const idx = prev.findIndex(s => s.key === key)
      if (idx === -1) return [...prev, { key, dir: 'asc' }]
      if (prev[idx].dir === 'asc') return prev.map((s, i) => i === idx ? { ...s, dir: 'desc' } : s)
      return prev.filter((_, i) => i !== idx)
    })
  }

  function removeSort(key: SortKey) {
    setSorts(prev => prev.filter(s => s.key !== key))
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

  const sorted = useMemo(() => {
    if (sorts.length === 0) return filtered
    return [...filtered].sort((a, b) => {
      for (const { key, dir } of sorts) {
        const valA = getSortValue(a, key)
        const valB = getSortValue(b, key)
        if (valA < valB) return dir === 'asc' ? -1 : 1
        if (valA > valB) return dir === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filtered, sorts])

  function clearFilters() {
    setFilterBrand('')
    setFilterStars(null)
    setFilterPriceMax('')
    setFilterStatus('active')
  }

  function handleEdit(product: Product) {
    setSelectedProduct(null)
    setEditProduct(product)
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-display italic text-4xl sm:text-5xl text-rose-deep mb-2">
            Ma Collection
          </h1>
          <p className="text-mauve text-sm">
            {sorted.length} produit{sorted.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Barre de recherche + filtres + favoris */}
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

        {/* Catégories principales */}
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
          <div className="mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
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

        {/* Barre de tri multi-critères */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <span className="text-xs text-mauve uppercase tracking-widest font-medium flex-shrink-0">Trier :</span>
          {SORT_OPTIONS.map(({ key, label }) => {
            const idx = sorts.findIndex(s => s.key === key)
            const active = idx !== -1
            const dir = active ? sorts[idx].dir : null
            const priority = idx + 1

            return (
              <button
                key={key}
                onClick={() => handleSort(key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? 'bg-rose-deep text-white border-rose-deep'
                    : 'bg-white text-mauve border-border hover:border-rose hover:text-rose-deep'
                }`}
              >
                {active && sorts.length > 1 && (
                  <span className="w-4 h-4 rounded-full bg-white/25 text-[10px] flex items-center justify-center font-bold">
                    {priority}
                  </span>
                )}
                {label}
                {active
                  ? dir === 'asc'
                    ? <ChevronUp className="w-3 h-3" />
                    : <ChevronDown className="w-3 h-3" />
                  : <ChevronsUpDown className="w-3 h-3 opacity-40" />
                }
                {active && (
                  <span
                    role="button"
                    onClick={e => { e.stopPropagation(); removeSort(key) }}
                    className="ml-0.5 hover:opacity-70"
                  >
                    <X className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            )
          })}
          {sorts.length > 0 && (
            <button
              onClick={() => setSorts([])}
              className="flex items-center gap-1 text-xs text-mauve hover:text-rose-deep transition-colors"
            >
              <X className="w-3 h-3" /> Tout effacer
            </button>
          )}
        </div>

        {/* Grille */}
        {sorted.length === 0 ? (
          <div className="text-center py-24">
            <span className="text-5xl block mb-4">✨</span>
            <p className="font-display italic text-xl text-mauve">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="masonry">
            {sorted.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isAdmin={isAdmin}
        onEdit={handleEdit}
      />

      {editProduct && (
        <ProductForm
          categories={categories}
          brands={Array.from(new Set(products.map(p => p.brand))).sort()}
          product={editProduct}
          onClose={() => setEditProduct(null)}
        />
      )}
    </>
  )
}
