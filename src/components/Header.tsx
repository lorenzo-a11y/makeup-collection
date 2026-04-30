'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Sparkles className="w-5 h-5 text-rose-dark" />
          <span className="font-display italic text-xl text-rose-deep tracking-wide">
            Ma Collection Beauté
          </span>
        </Link>
        <Link
          href="/admin"
          className="text-sm text-mauve hover:text-rose-deep transition-colors px-3 py-1.5 rounded-full hover:bg-petal"
        >
          Admin
        </Link>
      </div>
    </header>
  )
}
