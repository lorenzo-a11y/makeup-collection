'use client'

import { useState } from 'react'
import { Star, Heart } from 'lucide-react'
import { toggleFavorite } from '@/app/actions'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  onClick: () => void
}

export default function ProductCard({ product, onClick }: Props) {
  const [isFav, setIsFav] = useState(product.is_favorite ?? false)

  async function handleToggleFav(e: React.MouseEvent) {
    e.stopPropagation()
    setIsFav(v => !v)
    await toggleFavorite(product.id, !isFav)
  }

  return (
    <div onClick={onClick} className="masonry-item cursor-pointer group">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-border">
        <div className="relative">
          {product.image_url ? (
            <div className="overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-full h-40 bg-petal flex items-center justify-center">
              <span className="text-4xl">{product.category?.icon ?? '💄'}</span>
            </div>
          )}

          {/* Bouton cœur */}
          <button
            onClick={handleToggleFav}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
          >
            <Heart
              className="w-4 h-4 transition-colors"
              fill={isFav ? '#E8A4B8' : 'none'}
              stroke={isFav ? '#E8A4B8' : '#B07085'}
            />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs uppercase tracking-widest text-mauve font-medium mb-1">
            {product.brand}
          </p>
          <h3 className="font-display text-base text-plum leading-snug mb-2">
            {product.name}
          </h3>

          {product.category && (
            <span className="inline-block text-xs bg-petal text-rose-dark px-2.5 py-0.5 rounded-full mb-3">
              {product.category.icon} {product.category.name}
            </span>
          )}

          {product.shades && product.shades.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.shades.slice(0, 6).map(shade => (
                <span
                  key={shade.id}
                  title={shade.name}
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: shade.hex_color ?? '#E8A4B8' }}
                />
              ))}
              {product.shades.length > 6 && (
                <span className="text-xs text-mauve self-center">
                  +{product.shades.length - 6}
                </span>
              )}
            </div>
          )}

          {product.rating && (
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5"
                  fill={i < product.rating! ? '#C4A35A' : 'none'}
                  stroke={i < product.rating! ? '#C4A35A' : '#D1B5BC'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
