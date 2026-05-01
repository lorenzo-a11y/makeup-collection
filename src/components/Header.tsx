'use client'

import Link from 'next/link'
import { Sparkles, BarChart2, Layers, Shuffle, Palette, Luggage } from 'lucide-react'
import ShareButton from './ShareButton'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-dark" />
          <span className="font-display italic text-lg sm:text-xl text-rose-deep tracking-wide">
            Ma Collection Beauté
          </span>
        </Link>

        {/* Desktop : nav complète */}
        <div className="hidden sm:flex items-center gap-1">
          <ShareButton />
          <Link href="/collections" className="flex items-center gap-1.5 text-sm text-mauve hover:text-rose-deep transition-colors px-3 py-1.5 rounded-full hover:bg-petal">
            <Layers className="w-4 h-4" />
            <span className="text-xs">Looks</span>
          </Link>
          <Link href="/roue" className="flex items-center gap-1.5 text-sm text-mauve hover:text-rose-deep transition-colors px-3 py-1.5 rounded-full hover:bg-petal">
            <Shuffle className="w-4 h-4" />
            <span className="text-xs">Roue</span>
          </Link>
          <Link href="/palette" className="flex items-center gap-1.5 text-sm text-mauve hover:text-rose-deep transition-colors px-3 py-1.5 rounded-full hover:bg-petal">
            <Palette className="w-4 h-4" />
            <span className="text-xs">Palette</span>
          </Link>
          <Link href="/voyage" className="flex items-center gap-1.5 text-sm text-mauve hover:text-rose-deep transition-colors px-3 py-1.5 rounded-full hover:bg-petal">
            <Luggage className="w-4 h-4" />
            <span className="text-xs">Valise</span>
          </Link>
          <Link href="/stats" className="flex items-center gap-1.5 text-sm text-mauve hover:text-rose-deep transition-colors px-3 py-1.5 rounded-full hover:bg-petal">
            <BarChart2 className="w-4 h-4" />
            <span className="text-xs">Stats</span>
          </Link>
          <Link href="/admin" className="text-sm text-mauve hover:text-rose-deep transition-colors px-3 py-1.5 rounded-full hover:bg-petal">
            Cristina
          </Link>
        </div>

        {/* Mobile : share + admin uniquement (le reste est dans la nav du bas) */}
        <div className="flex sm:hidden items-center gap-1">
          <ShareButton />
          <Link href="/admin" className="text-sm text-mauve hover:text-rose-deep transition-colors px-3 py-1.5 rounded-full hover:bg-petal">
            Cristina
          </Link>
        </div>
      </div>
    </header>
  )
}
