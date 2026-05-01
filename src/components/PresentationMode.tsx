'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Play, Pause, Star, Euro } from 'lucide-react'
import type { Product } from '@/lib/types'

interface Props {
  products: Product[]
  startIndex?: number
  onClose: () => void
}

const AUTOPLAY_DURATION = 2500
const MAX_DOTS = 9

export default function PresentationMode({ products, startIndex = 0, onClose }: Props) {
  const [index, setIndex] = useState(startIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [fade, setFade] = useState(true)

  const product = products[index]

  const goTo = useCallback((next: number) => {
    setFade(false)
    setTimeout(() => {
      setIndex((next + products.length) % products.length)
      setFade(true)
    }, 150)
  }, [products.length])

  const prev = useCallback(() => goTo(index - 1), [goTo, index])
  const next = useCallback(() => goTo(index + 1), [goTo, index])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === ' ') { e.preventDefault(); setIsPlaying(p => !p) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, prev, next])

  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => next(), AUTOPLAY_DURATION)
    return () => clearInterval(timer)
  }, [isPlaying, next])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Fenêtre glissante de points de navigation (max 9)
  const dotIndices = (() => {
    const total = products.length
    if (total <= MAX_DOTS) return Array.from({ length: total }, (_, i) => i)
    const half = Math.floor(MAX_DOTS / 2)
    let start = Math.max(0, index - half)
    const end = Math.min(total - 1, start + MAX_DOTS - 1)
    if (end - start < MAX_DOTS - 1) start = Math.max(0, end - MAX_DOTS + 1)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })()

  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 bg-plum flex flex-col select-none">

      {/* Barre du haut — compacte sur mobile */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <span className="text-white/50 text-xs sm:text-sm font-medium tabular-nums">
          {index + 1} <span className="text-white/25">/</span> {products.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Défilement auto'}</span>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Barre de progression auto-play */}
      {isPlaying && (
        <div className="h-0.5 bg-white/10 flex-shrink-0">
          <div
            key={`${index}-${isPlaying}`}
            className="h-full bg-rose origin-left"
            style={{ animation: `progressBar ${AUTOPLAY_DURATION}ms linear forwards` }}
          />
        </div>
      )}

      {/* Zone image */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-12 sm:px-20 py-2">
        <button
          onClick={prev}
          className="absolute left-2 sm:left-6 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div
          className="w-full h-full flex items-center justify-center transition-opacity duration-150"
          style={{ opacity: fade ? 1 : 0 }}
        >
          {product.image_url ? (
            <img
              key={product.id}
              src={product.image_url}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
          ) : (
            <div className="w-40 h-40 sm:w-64 sm:h-64 rounded-3xl bg-white/10 flex items-center justify-center">
              <span className="text-6xl sm:text-8xl">{product.category?.icon ?? '💄'}</span>
            </div>
          )}
        </div>

        <button
          onClick={next}
          className="absolute right-2 sm:right-6 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Infos produit — compactes sur mobile */}
      <div
        className="flex-shrink-0 px-4 sm:px-6 pt-2 pb-4 sm:py-6 text-center transition-opacity duration-150"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {/* Catégorie : masquée sur mobile */}
        {product.category && (
          <span className="hidden sm:inline-block text-xs text-rose/80 uppercase tracking-widest font-medium mb-2">
            {product.category.icon} {product.category.name}
          </span>
        )}

        <p className="text-white/50 text-xs sm:text-sm uppercase tracking-widest mb-0.5 sm:mb-1">{product.brand}</p>
        <h2 className="font-display italic text-lg sm:text-3xl text-white mb-2 sm:mb-3 line-clamp-2 leading-tight px-4">
          {product.name}
        </h2>

        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {product.rating && (
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  fill={i < product.rating! ? '#C4A35A' : 'none'}
                  stroke={i < product.rating! ? '#C4A35A' : 'rgba(255,255,255,0.2)'}
                />
              ))}
            </div>
          )}
          {product.price && (
            <span className="flex items-center gap-0.5 text-gold text-xs sm:text-sm font-medium">
              <Euro className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {product.price.toFixed(2)}
            </span>
          )}
          {product.is_empty && (
            <span className="text-[10px] sm:text-xs text-white/40 border border-white/20 px-2 py-0.5 rounded-full">Épuisé</span>
          )}
        </div>

        {/* Points de navigation — fenêtre glissante, masqués sur mobile si trop nombreux */}
        <div className="flex justify-center items-center gap-1.5 mt-3 sm:mt-4">
          {dotIndices[0] > 0 && (
            <span className="w-1 h-1 rounded-full bg-white/20" />
          )}
          {dotIndices.map(i => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === index
                  ? 'w-5 h-1.5 bg-rose'
                  : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
          {dotIndices[dotIndices.length - 1] < products.length - 1 && (
            <span className="w-1 h-1 rounded-full bg-white/20" />
          )}
        </div>
      </div>

      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to { width: 100% }
        }
      `}</style>
    </div>
  )
}
