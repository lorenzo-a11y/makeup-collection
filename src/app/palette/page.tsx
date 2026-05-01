import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PaletteClient from '@/components/PaletteClient'

export const revalidate = 60

export default async function PalettePage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name, brand, image_url, shades(*)')
    .order('name')

  const withShades = (products ?? []).filter(p => p.shades && p.shades.length > 0)

  const totalShades = withShades.reduce((s, p) => s + p.shades.length, 0)

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-border hover:bg-petal transition-colors text-mauve"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display italic text-3xl text-rose-deep">Palette de couleurs</h1>
            <p className="text-sm text-mauve">{totalShades} teintes · {withShades.length} produits</p>
          </div>
        </div>

        {withShades.length === 0 ? (
          <div className="text-center py-24">
            <span className="text-5xl block mb-4">🎨</span>
            <p className="font-display italic text-xl text-mauve">Aucune teinte enregistrée pour l'instant</p>
          </div>
        ) : (
          <PaletteClient products={withShades} />
        )}
      </div>
    </div>
  )
}
