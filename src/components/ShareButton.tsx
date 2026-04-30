'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.origin
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Ma Collection Beauté', url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {}
  }

  return (
    <button
      onClick={handleShare}
      title="Partager"
      className="flex items-center gap-1.5 text-sm text-mauve hover:text-rose-deep transition-colors px-3 py-1.5 rounded-full hover:bg-petal"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="hidden sm:inline text-green-500 text-xs">Copié !</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Partager</span>
        </>
      )}
    </button>
  )
}
