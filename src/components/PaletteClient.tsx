'use client'

import { useState, useMemo } from 'react'

interface Shade {
  id: string
  name: string
  hex_color: string | null
}

interface ProductWithShades {
  id: string
  name: string
  brand: string
  image_url: string | null
  shades: Shade[]
}

interface Props {
  products: ProductWithShades[]
}

function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return 0
  const d = max - min
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return h * 360
}

function ShadeCircle({ shade, productName, productBrand }: {
  shade: Shade
  productName: string
  productBrand: string
}) {
  const [hovered, setHovered] = useState(false)
  const color = shade.hex_color ?? '#E8A4B8'

  return (
    <div
      className="relative flex-shrink-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-white shadow-md hover:scale-110 transition-transform duration-200 cursor-default"
        style={{ backgroundColor: color }}
      />
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-plum text-white text-xs rounded-2xl px-3 py-2 whitespace-nowrap z-20 shadow-lg pointer-events-none">
          <p className="font-medium">{shade.name}</p>
          <p className="text-white/60">{productBrand} · {productName}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-plum" />
        </div>
      )}
    </div>
  )
}

export default function PaletteClient({ products }: Props) {
  const [view, setView] = useState<'rainbow' | 'product'>('rainbow')

  const allShades = useMemo(() =>
    products.flatMap(p =>
      p.shades.map(s => ({
        ...s,
        productName: p.name,
        productBrand: p.brand,
      }))
    ), [products]
  )

  const sortedByHue = useMemo(() =>
    [...allShades].sort((a, b) =>
      hexToHue(a.hex_color ?? '#E8A4B8') - hexToHue(b.hex_color ?? '#E8A4B8')
    ), [allShades]
  )

  return (
    <div>
      {/* Toggle vue */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setView('rainbow')}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            view === 'rainbow'
              ? 'bg-rose-deep text-white border-rose-deep'
              : 'bg-white text-mauve border-border hover:border-rose hover:text-rose-deep'
          }`}
        >
          🌈 Arc-en-ciel
        </button>
        <button
          onClick={() => setView('product')}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            view === 'product'
              ? 'bg-rose-deep text-white border-rose-deep'
              : 'bg-white text-mauve border-border hover:border-rose hover:text-rose-deep'
          }`}
        >
          💄 Par produit
        </button>
      </div>

      {view === 'rainbow' ? (
        /* Vue arc-en-ciel : toutes les teintes triées par teinte */
        <div className="bg-white rounded-3xl border border-border p-6 sm:p-8">
          <div className="flex flex-wrap gap-3">
            {sortedByHue.map((shade, i) => (
              <ShadeCircle
                key={`${shade.id}-${i}`}
                shade={shade}
                productName={shade.productName}
                productBrand={shade.productBrand}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Vue par produit */
        <div className="space-y-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-3xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-10 h-10 rounded-xl object-cover bg-petal flex-shrink-0"
                  />
                )}
                <div>
                  <p className="text-xs text-mauve uppercase tracking-widest font-medium">{product.brand}</p>
                  <p className="font-display text-base text-plum">{product.name}</p>
                </div>
                <span className="ml-auto text-xs text-mauve">{product.shades.length} teinte{product.shades.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.shades.map(shade => (
                  <ShadeCircle
                    key={shade.id}
                    shade={shade}
                    productName={product.name}
                    productBrand={product.brand}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
