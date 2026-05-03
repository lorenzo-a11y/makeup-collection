'use client'

import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { GEO_COUNTRIES } from '@/lib/geoCountries'
import type { Continent } from '@/lib/geoCountries'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

function countryColor(count: number, selected: boolean, dimmed: boolean): string {
  if (selected) return '#8B3A52'
  if (dimmed) return '#F0EAEd'
  if (count === 0) return '#EDE0E5'
  if (count === 1) return '#D4A0B0'
  if (count <= 3) return '#C4758A'
  return '#A0506A'
}

function hoverColor(count: number, dimmed: boolean): string {
  if (dimmed) return '#E8E0E4'
  if (count === 0) return '#E0D0D8'
  return '#7A2840'
}

interface Props {
  countriesWithBrands: Record<string, number>
  selectedAlpha2: string | null
  filterContinent: Continent | 'Tous'
  onSelect: (alpha2: string, name: string) => void
}

export default function WorldMap({ countriesWithBrands, selectedAlpha2, filterContinent, onSelect }: Props) {
  return (
    <ComposableMap
      projectionConfig={{ scale: 145, center: [0, 15] }}
      style={{ width: '100%', height: '100%' }}
    >
      <ZoomableGroup zoom={1} maxZoom={8} minZoom={0.8}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const id = String(geo.id).padStart(3, '0')
              const info = GEO_COUNTRIES[id] ?? GEO_COUNTRIES[String(geo.id)]
              const alpha2 = info?.alpha2 ?? null
              const count = alpha2 ? (countriesWithBrands[alpha2] ?? 0) : 0
              const isSelected = alpha2 !== null && alpha2 === selectedAlpha2
              const isDimmed = filterContinent !== 'Tous' && info?.continent !== filterContinent

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => {
                    if (alpha2 && count > 0) onSelect(alpha2, info?.name ?? alpha2)
                  }}
                  style={{
                    default: {
                      fill: countryColor(count, isSelected, isDimmed),
                      stroke: '#FFFFFF',
                      strokeWidth: 0.5,
                      outline: 'none',
                    },
                    hover: {
                      fill: hoverColor(count, isDimmed),
                      stroke: '#FFFFFF',
                      strokeWidth: 0.5,
                      outline: 'none',
                      cursor: count > 0 ? 'pointer' : 'default',
                    },
                    pressed: {
                      fill: '#8B3A52',
                      outline: 'none',
                    },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  )
}
