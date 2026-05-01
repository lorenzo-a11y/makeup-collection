'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'rose' | 'lavande' | 'nude' | 'bordeaux'

export const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: 'rose',     label: 'Rose',     color: '#E8A4B8' },
  { id: 'lavande',  label: 'Lavande',  color: '#A898D8' },
  { id: 'nude',     label: 'Nude',     color: '#C8A882' },
  { id: 'bordeaux', label: 'Bordeaux', color: '#A05858' },
]

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: 'rose',
  setTheme: () => {},
})

export function useTheme() { return useContext(ThemeContext) }

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('rose')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) apply(saved)
  }, [])

  function apply(t: Theme) {
    setThemeState(t)
    localStorage.setItem('theme', t)
    if (t === 'rose') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', t)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: apply }}>
      {children}
    </ThemeContext.Provider>
  )
}
