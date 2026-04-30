'use client'

import { useEffect } from 'react'
import { X, Star, Euro, Pencil } from 'lucide-react'
import type { Product } from '@/lib/types'

interface Props {
  product: Product | null
  onClose: () => void
  isAdmin?: boolean
  onEdit?: (product: Product) => void
}

export default function ProductModal({ product, onClose, isAdmin, onEdit }: Props) {
  useEffect(() => {
    if (!product) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [product, onClose])

  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-plum/50 backdrop-blur-sm" />

      <div
        className="relative bg-white w-full sm:max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-petal transition-colors"
        >
          <X className="w-4 h-4 text-plum" />
        </button>

        <div className="overflow-y-auto flex-1">
          {product.image_url && (
            <div className="w-full bg-petal">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full max-h-[55vh] object-contain"
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {product.category && (
              <span className="inline-block text-xs bg-petal text-rose-dark px-3 py-1 rounded-full mb-3">
                {product.category.icon} {product.category.name}
              </span>
            )}

            <p className="text-xs uppercase tracking-widest text-mauve font-medium mb-1">
              {product.brand}
            </p>

            {/* Nom + bouton Modifier (admin seulement) */}
            <div className="flex items-start gap-3 mb-3">
              <h2 className="font-display text-2xl sm:text-3xl text-plum leading-tight flex-1">
                {product.name}
              </h2>
              {isAdmin && onEdit && (
                <button
                  onClick={() => onEdit(product)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-petal text-rose-deep text-xs font-medium hover:bg-rose hover:text-white transition-colors mt-1"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Modifier
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              {product.rating && (
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      fill={i < product.rating! ? '#C4A35A' : 'none'}
                      stroke={i < product.rating! ? '#C4A35A' : '#D1B5BC'}
                    />
                  ))}
                </div>
              )}
              {product.price && (
                <span className="flex items-center gap-0.5 text-sm font-semibold text-gold">
                  <Euro className="w-3.5 h-3.5" />
                  {product.price.toFixed(2)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-mauve leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {product.shades && product.shades.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-plum mb-3 uppercase tracking-widest">
                  Teintes
                </h4>
                <div className="flex flex-wrap gap-4">
                  {product.shades.map(shade => (
                    <div key={shade.id} className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-11 h-11 rounded-full border-4 border-white shadow-md"
                        style={{ backgroundColor: shade.hex_color ?? '#E8A4B8' }}
                      />
                      <span className="text-xs text-mauve max-w-[64px] text-center leading-tight">
                        {shade.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
