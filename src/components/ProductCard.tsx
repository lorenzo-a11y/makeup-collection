'use client'

import { useState } from 'react'
import { Star, Heart, Luggage } from 'lucide-react'
import { toggleFavorite, toggleVoyage } from '@/app/actions'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  onClick: () => void
  isAdmin?: boolean
}

export default function ProductCard({ product, onClick, isAdmin }: Props) {
  const [isFav, setIsFav] = useState(product.is_favorite ?? false)
  const [inVoyage, setInVoyage] = useState(product.in_voyage ?? false)

  async function handleToggleFav(e: React.MouseEvent) {
    e.stopPropagation()
    setIsFav(v => !v)
    await toggleFavorite(product.id, !isFav)
  }

  async function handleToggleVoyage(e: React.MouseEvent) {
    e.stopPropagation()
    setInVoyage(v => !v)
    await toggleVoyage(product.id, !inVoyage)
  }

  return (
    <div
      onClick={onClick}
      className="masonry-item cursor-pointer hover:scale-[1.03] transition-transform duration-200 relative hover:z-10"
    >
      <div className={`flex-1 flex flex-col bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 border ${product.is_empty ? 'border-border opacity-60' : 'border-border'}`}>

        <div
          className="relative overflow-hidden rounded-t-3xl flex-shrink-0"
          style={{ WebkitTransform: 'translateZ(0)', transform: 'translateZ(0)' }}
        >
          <div className="relative w-full bg-petal" style={{ paddingTop: '100%' }}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">{product.category?.icon ?? '💄'}</span>
              </div>
            )}
          </div>

          {product.is_empty && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-mauve text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
              Épuisé
            </div>
          )}

          {/* Bouton valise — toujours visible */}
          <button
            onClick={handleToggleVoyage}
            className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
            title={inVoyage ? 'Retirer de la valise' : 'Ajouter à la valise'}
          >
            <Luggage
              className="w-4 h-4 transition-colors"
              fill={inVoyage ? '#B07085' : 'none'}
              stroke={inVoyage ? '#B07085' : '#D1B5BC'}
            />
          </button>

          {isAdmin ? (
            /* Admin : bouton cœur cliquable */
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
          ) : isFav ? (
            /* Visiteur : cœur affiché en lecture seule si favori */
            <div className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
              <Heart className="w-4 h-4" fill="#E8A4B8" stroke="#E8A4B8" />
            </div>
          ) : null}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <p className="text-xs uppercase tracking-widest text-mauve font-medium mb-1">{product.brand}</p>
          <h3 className="font-display text-base text-plum leading-snug mb-2">{product.name}</h3>

          {product.category && (
            <span className="inline-block text-xs bg-petal text-rose-dark px-2.5 py-0.5 rounded-full mb-3 self-start">
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
                <span className="text-xs text-mauve self-center">+{product.shades.length - 6}</span>
              )}
            </div>
          )}

          {product.rating && (
            <div className="flex gap-0.5 mt-auto pt-2">
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
