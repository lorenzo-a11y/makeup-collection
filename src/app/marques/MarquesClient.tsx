'use client'

import { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Globe, Search, Shuffle, X, Package, MapPin } from 'lucide-react'
import { GEO_COUNTRIES, CONTINENTS } from '@/lib/geoCountries'
import type { Continent } from '@/lib/geoCountries'
import type { BrandData } from './page'

const WorldMap = dynamic(() => import('./WorldMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-rose/30 border-t-rose-deep animate-spin" />
    </div>
  ),
})

// Reverse lookup: alpha2 → CountryInfo
const ALPHA2_LOOKUP = Object.fromEntries(
  Object.values(GEO_COUNTRIES).map(info => [info.alpha2, info])
)

const CONTINENT_CONFIG: Record<string, { center: [number, number]; zoom: number }> = {
  'Europe':           { center: [15, 52],   zoom: 4   },
  'Amérique du Nord': { center: [-100, 45], zoom: 2.8 },
  'Amérique du Sud':  { center: [-58, -15], zoom: 2.8 },
  'Asie':             { center: [95, 35],   zoom: 2.2 },
  'Afrique':          { center: [20, 5],    zoom: 2.4 },
  'Océanie':          { center: [140, -25], zoom: 3.5 },
}

interface Props {
  brands: BrandData[]
}

export default function MarquesClient({ brands }: Props) {
  const [selectedAlpha2, setSelectedAlpha2] = useState<string | null>(null)
  const [filterContinent, setFilterContinent] = useState<Continent | 'Tous'>('Tous')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const brandsByCountry = useMemo(() => {
    const map: Record<string, BrandData[]> = {}
    for (const brand of brands) {
      if (brand.alpha2) {
        if (!map[brand.alpha2]) map[brand.alpha2] = []
        map[brand.alpha2].push(brand)
      }
    }
    return map
  }, [brands])

  const countriesWithBrands = useMemo(() => {
    const map: Record<string, number> = {}
    for (const [alpha2, list] of Object.entries(brandsByCountry)) {
      map[alpha2] = list.length
    }
    return map
  }, [brandsByCountry])

  const stats = useMemo(() => {
    const countryKeys = Object.keys(brandsByCountry)
    const continentSet = new Set(countryKeys.map(a2 => ALPHA2_LOOKUP[a2]?.continent).filter(Boolean))
    return {
      countries: countryKeys.length,
      continents: continentSet.size,
      brands: brands.filter(b => b.alpha2).length,
    }
  }, [brandsByCountry, brands])

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    type Result = { type: 'brand' | 'country'; label: string; alpha2: string; flag: string; sub: string }
    const results: Result[] = []
    const seenCountries = new Set<string>()

    for (const brand of brands) {
      if (brand.alpha2 && brand.name.toLowerCase().includes(q)) {
        const info = ALPHA2_LOOKUP[brand.alpha2]
        results.push({
          type: 'brand',
          label: brand.name,
          alpha2: brand.alpha2,
          flag: info?.flag ?? '',
          sub: info?.name ?? brand.alpha2,
        })
      }
    }

    for (const alpha2 of Object.keys(brandsByCountry)) {
      const info = ALPHA2_LOOKUP[alpha2]
      if (info && info.name.toLowerCase().includes(q) && !seenCountries.has(alpha2)) {
        seenCountries.add(alpha2)
        results.push({
          type: 'country',
          label: info.name,
          alpha2,
          flag: info.flag,
          sub: `${brandsByCountry[alpha2].length} marque${brandsByCountry[alpha2].length > 1 ? 's' : ''}`,
        })
      }
    }

    return results.slice(0, 8)
  }, [searchQuery, brands, brandsByCountry])

  const handleSelect = useCallback((alpha2: string) => {
    setSelectedAlpha2(prev => (prev === alpha2 ? null : alpha2))
  }, [])

  const handleSurprise = useCallback(() => {
    const keys = Object.keys(brandsByCountry)
    if (!keys.length) return
    let next: string
    do { next = keys[Math.floor(Math.random() * keys.length)] }
    while (next === selectedAlpha2 && keys.length > 1)
    setSelectedAlpha2(next)
    const info = ALPHA2_LOOKUP[next]
    if (info) setFilterContinent('Tous')
  }, [brandsByCountry, selectedAlpha2])

  const continentCfg = filterContinent !== 'Tous' ? CONTINENT_CONFIG[filterContinent] : null
  const selectedInfo = selectedAlpha2 ? ALPHA2_LOOKUP[selectedAlpha2] : null
  const selectedBrands = selectedAlpha2 ? (brandsByCountry[selectedAlpha2] ?? []) : []

  return (
    <div className="min-h-screen bg-cream pb-24" onClick={() => setShowDropdown(false)}>
      {/* Header */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-display italic text-3xl text-rose-deep flex items-center gap-2">
              <Globe className="w-7 h-7" />
              Carte des Marques
            </h1>
            <button
              onClick={handleSurprise}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-petal border border-rose/30 text-rose-deep text-sm font-medium hover:bg-rose/10 transition-all"
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">Surprise !</span>
            </button>
          </div>
          <p className="text-sm text-mauve mb-4">Explorez les origines de votre collection</p>

          {/* Stats pills */}
          <div className="flex gap-3">
            {[
              { value: stats.countries, label: 'pays' },
              { value: stats.continents, label: 'continents' },
              { value: stats.brands, label: 'marques' },
            ].map(s => (
              <div key={s.label} className="bg-petal rounded-2xl px-4 py-2 text-center min-w-[64px]">
                <p className="text-lg font-bold text-rose-deep leading-none">{s.value}</p>
                <p className="text-[10px] text-mauve uppercase tracking-wide mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Search */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mauve pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher une marque ou un pays…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-10 pr-10 py-3 rounded-2xl border border-border bg-white text-sm text-plum placeholder-mauve/60 focus:outline-none focus:border-rose transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setShowDropdown(false) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-mauve hover:text-plum"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => {
                    setSelectedAlpha2(r.alpha2)
                    setSearchQuery('')
                    setShowDropdown(false)
                    setFilterContinent('Tous')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-petal transition-colors text-left border-b border-border/40 last:border-0"
                >
                  <span className="text-xl w-7 text-center flex-shrink-0">{r.flag}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-plum truncate">{r.label}</p>
                    <p className="text-xs text-mauve">{r.sub}</p>
                  </div>
                  <span className={`ml-auto flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${r.type === 'brand' ? 'bg-petal text-rose-deep' : 'bg-mauve/10 text-mauve'}`}>
                    {r.type === 'brand' ? 'marque' : 'pays'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Continent chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['Tous', ...CONTINENTS] as (Continent | 'Tous')[]).map(c => (
            <button
              key={c}
              onClick={() => setFilterContinent(c)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filterContinent === c
                  ? 'bg-rose-deep text-white shadow-sm'
                  : 'bg-white border border-border text-mauve hover:border-rose hover:text-rose-deep'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Map + Panel */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* Map */}
          <div
            className="w-full sm:flex-1 bg-white rounded-3xl border border-border overflow-hidden"
            style={{ height: 380 }}
          >
            <WorldMap
              countriesWithBrands={countriesWithBrands}
              selectedAlpha2={selectedAlpha2}
              filterContinent={filterContinent}
              onSelect={(alpha2, _name) => handleSelect(alpha2)}
              mapZoom={continentCfg?.zoom}
              mapCenter={continentCfg?.center}
            />
          </div>

          {/* Detail panel */}
          {selectedAlpha2 && (
            <div className="w-full sm:w-72 flex-shrink-0 bg-white rounded-3xl border border-border overflow-hidden">
              {selectedInfo && selectedBrands.length > 0 ? (
                <>
                  {/* Country header */}
                  <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-border/50">
                    <span className="text-4xl">{selectedInfo.flag}</span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-lg text-plum leading-tight">{selectedInfo.name}</h2>
                      <p className="text-xs text-mauve">
                        {selectedBrands.length} marque{selectedBrands.length > 1 ? 's' : ''} ·{' '}
                        {selectedBrands.reduce((s, b) => s + b.productCount, 0)} produit{selectedBrands.reduce((s, b) => s + b.productCount, 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                    <button onClick={() => setSelectedAlpha2(null)} className="text-mauve hover:text-plum flex-shrink-0">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Brand list */}
                  <div className="p-3 space-y-2 max-h-64 sm:max-h-[280px] overflow-y-auto">
                    {selectedBrands.map(brand => (
                      <div key={brand.name} className="rounded-2xl bg-petal/60 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-plum">{brand.name}</p>
                          <span className="flex items-center gap-1 text-xs text-mauve flex-shrink-0 ml-2">
                            <Package className="w-3 h-3" />
                            {brand.productCount}
                          </span>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {brand.products.slice(0, 5).map(p =>
                            p.image_url ? (
                              <img
                                key={p.id}
                                src={p.image_url}
                                alt={p.name}
                                title={p.name}
                                className="w-9 h-9 rounded-xl object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div
                                key={p.id}
                                title={p.name}
                                className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-base"
                              >
                                {p.category?.icon ?? '✨'}
                              </div>
                            )
                          )}
                          {brand.productCount > 5 && (
                            <div className="w-9 h-9 rounded-xl bg-rose-deep/10 border border-rose-deep/20 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-rose-deep">+{brand.productCount - 5}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 p-8 text-center min-h-32">
                  <MapPin className="w-8 h-8 text-mauve/30" />
                  <p className="text-sm text-mauve">Aucune marque de votre collection<br />ne vient de ce pays.</p>
                  <button onClick={() => setSelectedAlpha2(null)} className="text-xs text-rose-deep underline">
                    Fermer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-mauve pb-2">
          {[
            { color: '#EDE0E5', label: 'Aucune marque' },
            { color: '#D4A0B0', label: '1 marque' },
            { color: '#C4758A', label: '2–3 marques' },
            { color: '#A0506A', label: '4+ marques' },
            { color: '#8B3A52', label: 'Sélectionné' },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
