'use client'

import { useState, useMemo } from 'react'
import type { Category, Product } from '@/lib/types'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'

interface Props {
  products: Product[]
  categories: Category[]
}

export default function Gallery({ products, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = products
    if (activeCategory) list = list.filter(p => p.category_id === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      )
    }
    return list
  }, [products, activeCategory, search])

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-display italic text-4xl sm:text-5xl text-rose-deep mb-2">
            Ma Collection
          </h1>
          <p className="text-mauve text-sm">
            {products.length} produit{products.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher un produit ou une marque..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md mx-auto block px-5 py-3 rounded-full border border-border bg-white text-sm text-plum placeholder-mauve focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === null
                ? 'bg-rose-deep text-white shadow-sm'
                : 'bg-white text-mauve border border-border hover:border-rose hover:text-rose-deep'
            }`}
          >
            Tout
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-rose-deep text-white shadow-sm'
                  : 'bg-white text-mauve border border-border hover:border-rose hover:text-rose-deep'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <span className="text-5xl block mb-4">✨</span>
            <p className="font-display italic text-xl text-mauve">
              Aucun produit trouvé
            </p>
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

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  )
}
