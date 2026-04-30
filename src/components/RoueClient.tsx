'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, Star, Sparkles } from 'lucide-react'
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
  const [showModal, setShowModal] = useState(false)

  // Filtres
  const [favOnly, setFavOnly] = useState(false)
  const [filterMain, setFilterMain] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterStars, setFilterStars] = useState<number | null>(null)

  const mainCategories = useMemo(() => categories.filter(c => !c.parent_id), [categories])
  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand))).sort(), [products])

  const pool = useMemo(() => {
    let list = products
    if (favOnly) list = list.filter(p => p.is_favorite)
    if (filterMain) {
      const subIds = categories.filter(c => c.parent_id === filterMain).map(c => c.id)
      list = list.filter(p => p.category_id === filterMain || subIds.includes(p.category_id))
    }
    if (filterBrand) list = list.filter(p => p.brand === filterBrand)
    if (filterStars) list = list.filter(p => p.rating !== null && p.rating >= filterStars)
    return list
  }, [products, categories, favOnly, filterMain, filterBrand, filterStars])

  function spin() {
    if (spinning || pool.length === 0) return
    setWinner(null)
    setSpinning(true)

    const spins = 8 + Math.random() * 8
    const newRotation = rotation + spins * 360
    setRotation(newRotation)

    setTimeout(() => {
      const picked = pool[Math.floor(Math.random() * pool.length)]
      setWinner(picked)
      setSpinning(false)
    }, 4500)
  }

  const segments = Math.min(pool.length, 12)

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

        {/* Filtres */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-8 space-y-4">
          <p className="text-xs font-medium text-mauve uppercase tracking-widest">Filtrer les produits</p>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={filterMain}
              onChange={e => setFilterMain(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose bg-white"
            >
              <option value="">Toutes catégories</option>
              {mainCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <select
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border text-sm text-plum focus:outline-none focus:border-rose bg-white"
            >
              <option value="">Toutes marques</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-xs text-mauve mr-1">Note min</span>
              {[1,2,3,4,5].map(n => (
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
          <p className="text-xs text-mauve">
            {pool.length} produit{pool.length > 1 ? 's' : ''} dans la roue
          </p>
        </div>

        {/* Roue */}
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            {/* Flèche */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-plum" />
            </div>

            {/* Disque */}
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
              {/* Centre */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-cream shadow-inner flex items-center justify-center flex-col">
                  {spinning ? (
                    <Sparkles className="w-6 h-6 text-rose animate-pulse" />
                  ) : (
                    <span className="text-xs text-center text-plum font-medium leading-tight px-1">
                      {pool.length > 0 ? `${pool.length}\nproduits` : 'Vide'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={spin}
            disabled={spinning || pool.length === 0}
            className="px-10 py-4 bg-rose-deep text-white rounded-full text-lg font-display italic shadow-lg hover:bg-plum transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {spinning ? 'En cours...' : pool.length === 0 ? 'Aucun produit' : 'Tourner !'}
          </button>

          {/* Résultat */}
          {winner && !spinning && (
            <div
              onClick={() => setShowModal(true)}
              className="w-full bg-white rounded-3xl border border-border p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow animate-bounce-once"
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
          )}
        </div>
      </div>

      <ProductModal product={showModal ? winner : null} onClose={() => setShowModal(false)} />
    </div>
  )
}
