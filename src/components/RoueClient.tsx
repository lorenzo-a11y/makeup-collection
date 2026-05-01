'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, Star, Sparkles, RefreshCw } from 'lucide-react'
import type { Category, Product } from '@/lib/types'
import ProductModal from './ProductModal'

interface Props {
  products: Product[]
  categories: Category[]
}

const WHEEL_COLORS = ['#E8A4B8', '#F8D7DA', '#C4758A', '#B07085', '#8B3A52', '#C4A35A', '#F2C4CE', '#D4A0B0']

export default function RoueClient({ products, categories }: Props) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [winner, setWinner] = useState<Product | null>(null)
  const [look, setLook] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const [mode, setMode] = useState<'normal' | 'look'>('normal')

  // Filtres
  const [favOnly, setFavOnly] = useState(false)
  const [filterCat, setFilterCat] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterStars, setFilterStars] = useState<number | null>(null)

  // Historique des 5 derniers tirages
  const [history, setHistory] = useState<Product[]>([])

  // Produits exclus temporairement (Pas celui-là)
  const [excluded, setExcluded] = useState<Set<string>>(new Set())

  const brands = useMemo(() => {
    const base = filterCat ? products.filter(p => p.category_id === filterCat) : products
    return Array.from(new Set(base.map(p => p.brand))).sort()
  }, [products, filterCat])

  // Pool normal (avec filtre catégorie)
  const pool = useMemo(() => {
    let list = products
    if (favOnly) list = list.filter(p => p.is_favorite)
    if (filterCat) list = list.filter(p => p.category_id === filterCat)
    if (filterBrand) list = list.filter(p => p.brand === filterBrand)
    if (filterStars) list = list.filter(p => p.rating !== null && p.rating >= filterStars)
    return list
  }, [products, favOnly, filterCat, filterBrand, filterStars])

  // Pool look complet (sans filtre catégorie — on prend une par catégorie)
  const lookPool = useMemo(() => {
    let list = products
    if (favOnly) list = list.filter(p => p.is_favorite)
    if (filterBrand) list = list.filter(p => p.brand === filterBrand)
    if (filterStars) list = list.filter(p => p.rating !== null && p.rating >= filterStars)
    return list
  }, [products, favOnly, filterBrand, filterStars])

  const effectivePool = useMemo(
    () => pool.filter(p => !excluded.has(p.id)),
    [pool, excluded]
  )

  function addToHistory(product: Product) {
    setHistory(prev => [product, ...prev.filter(p => p.id !== product.id)].slice(0, 5))
  }

  function spin() {
    if (spinning) return
    const activePool = mode === 'look' ? lookPool : effectivePool
    if (activePool.length === 0) return

    setWinner(null)
    setLook([])
    setSpinning(true)

    const spins = 8 + Math.random() * 8
    const newRotation = rotation + spins * 360
    setRotation(newRotation)

    setTimeout(() => {
      if (mode === 'look') {
        const result: Product[] = []
        for (const cat of categories) {
          const catPool = activePool.filter(p => p.category_id === cat.id)
          if (catPool.length > 0) {
            result.push(catPool[Math.floor(Math.random() * catPool.length)])
          }
        }
        setLook(result)
      } else {
        const picked = effectivePool[Math.floor(Math.random() * effectivePool.length)]
        setWinner(picked)
        addToHistory(picked)
      }
      setSpinning(false)
    }, 4500)
  }

  function skipThis() {
    if (!winner || spinning) return
    const newExcluded = new Set([...excluded, winner.id])
    setExcluded(newExcluded)
    const remaining = pool.filter(p => !newExcluded.has(p.id))
    if (remaining.length === 0) { setWinner(null); return }
    const picked = remaining[Math.floor(Math.random() * remaining.length)]
    setWinner(picked)
    addToHistory(picked)
  }

  const activePoolSize = mode === 'look' ? lookPool.length : effectivePool.length
  const segments = Math.min(activePoolSize, 12)

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-border hover:bg-petal transition-colors text-mauve">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display italic text-3xl text-rose-deep">La Roue Beauté</h1>
            <p className="text-sm text-mauve">Laisse le hasard choisir !</p>
          </div>
        </div>

        {/* Toggle de mode */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode('normal'); setWinner(null); setLook([]) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${mode === 'normal' ? 'bg-rose-deep text-white border-rose-deep' : 'bg-white text-mauve border-border hover:bg-petal'}`}
          >
            💄 Produit du moment
          </button>
          <button
            onClick={() => { setMode('look'); setWinner(null); setLook([]) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${mode === 'look' ? 'bg-rose-deep text-white border-rose-deep' : 'bg-white text-mauve border-border hover:bg-petal'}`}
          >
            ✨ Look complet
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-8 space-y-4">
          <p className="text-xs font-medium text-mauve uppercase tracking-widest">Filtrer les produits</p>
          <div className="grid grid-cols-2 gap-3">
            {mode === 'normal' && (
              <select
                value={filterCat}
                onChange={e => { setFilterCat(e.target.value); setFilterBrand(''); setExcluded(new Set()) }}
                className="px-3 py-2 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose bg-white"
              >
                <option value="">Toutes catégories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            )}
            <select
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
              className={`px-3 py-2 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose bg-white ${mode === 'look' ? 'col-span-2' : ''}`}
            >
              <option value="">Toutes marques</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-xs text-mauve mr-1">Note min</span>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setFilterStars(filterStars === n ? null : n)} className="p-0.5">
                  <Star className="w-4 h-4" fill={filterStars && n <= filterStars ? '#C4A35A' : 'none'} stroke={filterStars && n <= filterStars ? '#C4A35A' : '#D1B5BC'} />
                </button>
              ))}
            </div>
            <button
              onClick={() => setFavOnly(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${favOnly ? 'bg-rose text-white border-rose' : 'bg-white text-mauve border-border'}`}
            >
              <Heart className="w-3.5 h-3.5" fill={favOnly ? 'white' : 'none'} /> Favoris uniquement
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-mauve">
              {activePoolSize} produit{activePoolSize > 1 ? 's' : ''} dans la roue
              {excluded.size > 0 && <span className="text-rose-deep"> · {excluded.size} exclu{excluded.size > 1 ? 's' : ''}</span>}
            </p>
            {excluded.size > 0 && (
              <button onClick={() => setExcluded(new Set())} className="text-xs text-rose-deep underline">
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Roue */}
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-plum" />
            </div>
            <div
              className="w-64 h-64 rounded-full shadow-2xl"
              style={{
                background: segments > 0
                  ? `conic-gradient(${WHEEL_COLORS.slice(0, segments).map((c, i) => `${c} ${(i / segments) * 100}% ${((i + 1) / segments) * 100}%`).join(', ')})`
                  : '#F8D7DA',
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-cream shadow-inner flex items-center justify-center flex-col">
                  {spinning ? (
                    <Sparkles className="w-6 h-6 text-rose animate-pulse" />
                  ) : (
                    <span className="text-xs text-center text-plum font-medium leading-tight px-1">
                      {activePoolSize > 0 ? `${activePoolSize}\nproduits` : 'Vide'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={spin}
            disabled={spinning || activePoolSize === 0}
            className="px-10 py-4 bg-rose-deep text-white rounded-full text-lg font-display italic shadow-lg hover:bg-plum transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {spinning ? 'En cours...' : activePoolSize === 0 ? 'Aucun produit' : mode === 'look' ? 'Composer un look !' : 'Tourner !'}
          </button>

          {/* Résultat — mode normal */}
          {winner && !spinning && mode === 'normal' && (
            <div className="w-full space-y-3">
              <div
                onClick={() => { setModalProduct(winner); setShowModal(true) }}
                className="w-full bg-white rounded-3xl border border-border p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                {winner.image_url
                  ? <img src={winner.image_url} alt={winner.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                  : <div className="w-16 h-16 rounded-2xl bg-petal flex items-center justify-center flex-shrink-0 text-3xl">{winner.category?.icon ?? '💄'}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-rose-deep font-medium uppercase tracking-widest mb-0.5">✨ Ton choix du moment</p>
                  <p className="text-xs text-mauve uppercase tracking-widest">{winner.brand}</p>
                  <p className="font-display text-lg text-plum truncate">{winner.name}</p>
                  {winner.category && <span className="text-xs bg-petal text-rose-dark px-2 py-0.5 rounded-full">{winner.category.icon} {winner.category.name}</span>}
                </div>
              </div>
              <button
                onClick={skipThis}
                disabled={effectivePool.length <= 1}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-mauve hover:bg-petal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Pas celui-là
              </button>
            </div>
          )}

          {/* Résultat — mode look complet */}
          {look.length > 0 && !spinning && mode === 'look' && (
            <div className="w-full space-y-3">
              <p className="text-xs font-medium text-mauve uppercase tracking-widest text-center">✨ Ton look du moment</p>
              {look.map(p => (
                <div
                  key={p.id}
                  onClick={() => { setModalProduct(p); setShowModal(true) }}
                  className="w-full bg-white rounded-2xl border border-border p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                >
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    : <div className="w-12 h-12 rounded-xl bg-petal flex items-center justify-center flex-shrink-0 text-2xl">{p.category?.icon ?? '💄'}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-mauve uppercase tracking-widest">{p.category?.icon} {p.category?.name}</p>
                    <p className="font-display text-base text-plum truncate">{p.name}</p>
                    <p className="text-xs text-mauve">{p.brand}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Historique des tirages */}
          {history.length > 0 && mode === 'normal' && (
            <div className="w-full">
              <p className="text-xs font-medium text-mauve uppercase tracking-widest mb-3">Historique</p>
              <div className="space-y-2">
                {history.map((p, i) => (
                  <div
                    key={`${p.id}-${i}`}
                    onClick={() => { setModalProduct(p); setShowModal(true) }}
                    className="w-full bg-white/70 rounded-xl border border-border p-3 flex items-center gap-3 cursor-pointer hover:bg-white transition-colors"
                  >
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      : <div className="w-9 h-9 rounded-lg bg-petal flex items-center justify-center flex-shrink-0 text-lg">{p.category?.icon ?? '💄'}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-plum truncate">{p.name}</p>
                      <p className="text-xs text-mauve">{p.brand}</p>
                    </div>
                    {i === 0 && <span className="text-xs text-rose-deep font-medium shrink-0">dernier</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ProductModal product={showModal ? modalProduct : null} onClose={() => setShowModal(false)} />
    </div>
  )
}
