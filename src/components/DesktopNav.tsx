'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Luggage, BarChart2, Wand2, Globe } from 'lucide-react'

const ITEMS = [
  { href: '/',        icon: Home,      label: 'Accueil'           },
  { href: '/voyage',  icon: Luggage,   label: 'Valise'            },
  { href: '/marques', icon: Globe,     label: 'Carte des Marques' },
  { href: '/stats',   icon: BarChart2, label: 'Stats'             },
  { href: '/outils',  icon: Wand2,     label: 'Outils'            },
]

export default function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden sm:flex fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-border h-14 items-center px-6 gap-2">
      <Link href="/" className="font-display italic text-lg text-rose-deep mr-6 flex-shrink-0">
        Ma Collection Beauté
      </Link>
      {ITEMS.map(({ href, icon: Icon, label }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              active
                ? 'bg-petal text-rose-deep'
                : 'text-mauve hover:bg-petal/50 hover:text-rose-deep'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
