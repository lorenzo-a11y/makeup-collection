'use client'

import { useEffect } from 'react'
import { X, Star, Euro } from 'lucide-react'
import type { Product } from '@/lib/types'

interface Props {
  product: Product | null
  onClose: () => void
}

export default function ProductModal({ product, onClose }: Props) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-plum/40 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow hover:bg-petal transition-colors"
        >
          <X className="w-4 h-4 text-plum" />
        </button>

        {product.image_url && (
          <div className="rounded-t-3xl overflow-hidden max-h-72">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-8">
          {product.category && (
            <span className="inline-block text-xs bg-petal text-rose-dark px-3 py-1 rounded-full mb-3">
              {product.category.icon} {product.category.name}
            </span>
          )}

          <p className="text-sm uppercase tracking-widest text-mauve font-medium mb-1">
            {product.brand}
          </p>
          <h2 className="font-display text-2xl text-plum mb-1">
            {product.name}
          </h2>

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
              <span className="flex items-center gap-0.5 text-sm text-gold font-medium">
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
              <h4 className="font-display text-sm text-plum mb-3 uppercase tracking-widest">
                Teintes
              </h4>
              <div className="flex flex-wrap gap-3">
                {product.shades.map(shade => (
                  <div key={shade.id} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-10 h-10 rounded-full border-4 border-white shadow-md"
                      style={{ backgroundColor: shade.hex_color ?? '#E8A4B8' }}
                    />
                    <span className="text-xs text-mauve max-w-[60px] text-center leading-tight">
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
  )
}
