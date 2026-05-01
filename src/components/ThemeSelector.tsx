'use client'

import { useState } from 'react'
import { Palette } from 'lucide-react'
import { useTheme, THEMES } from './ThemeProvider'

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 z-50">
      {open && (
        <div className="absolute bottom-12 right-0 bg-white rounded-2xl border border-border shadow-xl p-3 flex flex-col gap-2 min-w-[130px]">
          <p className="text-[10px] font-medium text-mauve uppercase tracking-widest px-1 mb-1">Thème</p>
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false) }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${theme === t.id ? 'bg-petal font-medium text-plum' : 'text-mauve hover:bg-petal/60'}`}
            >
              <span
                className="w-4 h-4 rounded-full flex-shrink-0 border-2"
                style={{
                  backgroundColor: t.color,
                  borderColor: theme === t.id ? t.color : 'transparent',
                }}
              />
              {t.label}
              {theme === t.id && <span className="ml-auto text-rose-deep">✓</span>}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        className="w-10 h-10 rounded-full bg-white border border-border shadow-lg flex items-center justify-center hover:bg-petal transition-colors"
        title="Changer le thème"
      >
        <Palette className="w-4 h-4 text-mauve" />
      </button>
    </div>
  )
}
