'use client'

import { useState } from 'react'
import { Luggage, X, Plane } from 'lucide-react'
import { toggleVoyage, clearVoyage } from '@/app/actions'
import ProductModal from '@/components/ProductModal'
import type { Category, Product } from '@/lib/types'

interface Group extends Category {
  items: Product[]
}

interface Props {
  groups: Group[]
  total: number
}

export default function VoyageClient({ groups: initialGroups, total }: Props) {
  const [groups, setGroups] = useState(initialGroups)
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const [clearing, setClearing] = useState(false)

  async function handleRemove(product: Product) {
    await toggleVoyage(product.id, false)
    setGroups(prev =>
      prev.map(g => ({ ...g, items: g.items.filter(p => p.id !== product.id) }))
          .filter(g => g.items.length > 0)
    )
  }

  async function handleClear() {
    setClearing(true)
    await clearVoyage()
    setGroups([])
    setClearing(false)
  }

  const remaining = groups.reduce((s, g) => s + g.items.length, 0)

  return (
    <>
      <div className="space-y-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-3xl border border-border p-5">
            <h2 className="font-display text-base text-plum mb-4">
              {group.icon} {group.name}
              <span className="text-xs font-sans text-mauve ml-2">{group.items.length}</span>
            </h2>
            <div className="space-y-3">
              {group.items.map(product => (
                <div key={product.id} className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setModalProduct(product)}
                  >
                    {product.image_url
                      ? <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      : <div className="w-12 h-12 rounded-xl bg-petal flex items-center justify-center text-xl flex-shrink-0">{product.category?.icon ?? '💄'}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-mauve">{product.brand}</p>
                      <p className="text-sm font-medium text-plum truncate">{product.name}</p>
                      {product.category && (
                        <span className="text-xs bg-petal text-rose-dark px-2 py-0.5 rounded-full">{product.category.icon} {product.category.name}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(product)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-petal transition-colors text-mauve hover:text-rose-deep flex-shrink-0"
                    title="Retirer de la valise"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-mauve">
            <Plane className="w-4 h-4" />
            <span>{remaining} produit{remaining > 1 ? 's' : ''} dans ta valise</span>
          </div>
          <button
            onClick={handleClear}
            disabled={clearing}
            className="px-6 py-2.5 rounded-full border border-border text-sm text-mauve hover:bg-petal transition-colors disabled:opacity-50"
          >
            {clearing ? 'En cours…' : 'Vider la valise'}
          </button>
        </div>
      )}

      <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
    </>
  )
}
