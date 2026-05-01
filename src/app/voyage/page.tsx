import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Luggage, Plane } from 'lucide-react'
import type { Category, Product } from '@/lib/types'
import VoyageClient from './VoyageClient'

export const revalidate = 0

export default async function VoyagePage() {
  const supabase = await createClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, category:categories(*), shades(*)').eq('in_voyage', true),
    supabase.from('categories').select('*'),
  ])

  const all: Product[] = products ?? []
  const cats: Category[] = categories ?? []

  // Grouper par catégorie principale
  const mainCats = cats.filter(c => !c.parent_id)
  const groups = mainCats.map(cat => {
    const subIds = cats.filter(c => c.parent_id === cat.id).map(c => c.id)
    const items = all.filter(p => p.category_id === cat.id || subIds.includes(p.category_id))
    return { ...cat, items }
  }).filter(g => g.items.length > 0)

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-border hover:bg-petal transition-colors text-mauve">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display italic text-3xl text-rose-deep">Ma Valise</h1>
            <p className="text-sm text-mauve">
              {all.length > 0
                ? `${all.length} produit${all.length > 1 ? 's' : ''} sélectionné${all.length > 1 ? 's' : ''}`
                : 'Aucun produit sélectionné'}
            </p>
          </div>
        </div>

        {all.length === 0 ? (
          <div className="text-center py-24">
            <Luggage className="w-12 h-12 text-mauve/30 mx-auto mb-4" />
            <p className="font-display italic text-xl text-mauve">Ta valise est vide</p>
            <p className="text-sm text-mauve/60 mt-2 mb-6">Clique sur l&apos;icône valise sur tes produits pour les ajouter</p>
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-deep text-white rounded-full text-sm font-medium hover:bg-plum transition-colors">
              Parcourir la collection
            </Link>
          </div>
        ) : (
          <VoyageClient groups={groups} total={all.length} />
        )}
      </div>
    </div>
  )
}
