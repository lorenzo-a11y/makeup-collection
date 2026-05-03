'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Luggage, BarChart2, Wand2 } from 'lucide-react'

const ITEMS = [
  { href: '/',        icon: Home,      label: 'Accueil' },
  { href: '/voyage',  icon: Luggage,   label: 'Valise'  },
  { href: '/outils',  icon: Wand2,     label: 'Outils'  },
  { href: '/stats',   icon: BarChart2, label: 'Stats'   },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around px-1 py-2 safe-area-pb">
        {ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${active ? 'text-rose-deep' : 'text-mauve/60'}`}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-medium transition-colors ${active ? 'text-rose-deep' : 'text-mauve/60'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
