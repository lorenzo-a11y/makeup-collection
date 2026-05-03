'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shuffle, MonitorPlay } from 'lucide-react'
import PresentationMode from '@/components/PresentationMode'
import { useTheme, THEMES } from '@/components/ThemeProvider'
import type { Product } from '@/lib/types'

interface Props {
  products: Product[]
}

export default function OutilsClient({ products }: Props) {
  const [presentationOpen, setPresentationOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display italic text-3xl text-rose-deep mb-2">Outils</h1>
        <p className="text-sm text-mauve mb-8">Toutes les fonctionnalités du site</p>

        {/* Cartes principales */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/roue"
            className="bg-white rounded-3xl border border-border p-6 flex flex-col items-center gap-3 hover:shadow-md hover:border-rose transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-petal flex items-center justify-center group-hover:bg-rose/20 transition-colors">
              <Shuffle className="w-7 h-7 text-rose-deep" />
            </div>
            <div className="text-center">
              <p className="font-display text-base text-plum">Roue Beauté</p>
              <p className="text-xs text-mauve mt-0.5">Tirage aléatoire</p>
            </div>
          </Link>

          <button
            onClick={() => products.length > 0 && setPresentationOpen(true)}
            disabled={products.length === 0}
            className="bg-white rounded-3xl border border-border p-6 flex flex-col items-center gap-3 hover:shadow-md hover:border-rose transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="w-14 h-14 rounded-2xl bg-petal flex items-center justify-center group-hover:bg-rose/20 transition-colors">
              <MonitorPlay className="w-7 h-7 text-rose-deep" />
            </div>
            <div className="text-center">
              <p className="font-display text-base text-plum">Présentation</p>
              <p className="text-xs text-mauve mt-0.5">{products.length} produits</p>
            </div>
          </button>
        </div>

        {/* Sélecteur de thème */}
        <div className="bg-white rounded-3xl border border-border p-6">
          <p className="text-xs font-medium text-mauve uppercase tracking-widest mb-4">Thème de couleur</p>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${
                  theme === t.id
                    ? 'border-rose-deep bg-petal'
                    : 'border-border hover:border-rose hover:bg-petal/50'
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: t.color }}
                />
                <span className={`text-sm font-medium ${theme === t.id ? 'text-plum' : 'text-mauve'}`}>
                  {t.label}
                </span>
                {theme === t.id && (
                  <span className="ml-auto text-rose-deep text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {presentationOpen && (
        <PresentationMode
          products={products}
          onClose={() => setPresentationOpen(false)}
        />
      )}
    </div>
  )
}
